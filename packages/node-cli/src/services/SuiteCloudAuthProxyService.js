/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

/** http libraries */
const http = require('node:http');
const https = require('node:https');
const EventEmitter = require('events');

/** Events */
const EVENTS = {
	SERVER_ERROR: 'serverError',
	SERVER_ERROR_ON_REFRESH: 'serverErrorOnRefresh',
	AUTH_REFRESH_MANUAL_EVENT: 'authRefreshManual',
	PROXY_ERROR: 'proxyError',
	UNAUTHORIZED_PROXY_REQUEST: 'unauthorizedProxyRequest',
	REQUEST_PATH_NOT_ALLOWED: 'requestPathNotAllowed'
};

/** Authentication methods */
const {
	getAuthIds,
	checkIfReauthorizationIsNeeded,
	forceRefreshAuthorization,
} = require('../utils/AuthenticationUtils');
const {
	AUTHORIZATION_PROPERTIES_KEYS,
	HTTP_RESPONSE_CODE,
} = require('../ApplicationConstants');

/** Message literal service method */
const NodeTranslationService = require('./NodeTranslationService');
const {
	SUITECLOUD_AUTH_PROXY_SERVICE,
} = require('./TranslationKeys');

const MAX_RETRY_ATTEMPTS = 1;
const LOCAL_HOSTNAME = '127.0.0.1';

/** Target server port */
const TARGET_SERVER_PORT = 443;

class SuiteCloudAuthProxyService extends EventEmitter {
	constructor(sdkPath, executionEnvironmentContext, apiKey, allowedPathPrefix) {
		super();
		this._sdkPath = sdkPath;
		this._executionEnvironmentContext = executionEnvironmentContext;
		this._apiKey = apiKey;
		this._allowedPathPrefix = allowedPathPrefix;
		/** These are the variables we are going to use to store instance data */
		this._accessToken = undefined;
		this._localProxy = undefined;
		this._targetHost = undefined;
		this._authId = undefined;
	}

	/**
	 * starts the listener.
	 * It can return an error, for instance when it cannot connect to the auth server or the parameters being incorrect
	 * @param authId
	 * @param proxyPort
	 * @returns {Promise<void>}
	 */
	async start(authId, proxyPort) {

		//Parameters validation
		this._evalInputParameters(authId, proxyPort);
		this._authId = authId;

		//Retrieve from authId accessToken and target host
		const { accessToken, hostName } = await this._retrieveCredentials();
		this._targetHost = hostName;
		this._accessToken = accessToken;

		await this.stop();
		this._localProxy = http.createServer();

		this._localProxy.addListener('request', async (request, response) => {

			// Validate incoming request (auth & allowed path) in a dedicated method
			if (!this.validateIncomingRequest(request, response)) return;

			const requestOptions = this._buildRequestOptions(request);

			// Save body
			const bodyChunks = [];
			request.on('data', function (chunk) {
				bodyChunks.push(chunk);
			});

			request.on('end', async () => {
				const body = Buffer.concat(bodyChunks);
				const proxyRequest = await this._createProxyRequest(requestOptions, body, response, 0);
				proxyRequest.write(body);
				proxyRequest.end();
			});
		});

		this._localProxy.listen(proxyPort, LOCAL_HOSTNAME, () => {
			const localURL = `http://${LOCAL_HOSTNAME}:${proxyPort}`;
			console.log(`SuiteCloud Proxy server listening on ${localURL}`);
		});

		this._localProxy.on('error', (error) => {
			const errorMessage = (error.code === 'EADDRINUSE') ?
				NodeTranslationService.getMessage(SUITECLOUD_AUTH_PROXY_SERVICE.ALREADY_USED_PORT, proxyPort, error.message ?? '')
				: NodeTranslationService.getMessage(SUITECLOUD_AUTH_PROXY_SERVICE.INTERNAL_PROXY_SERVER_ERROR, proxyPort, error.message ?? '');
			this._handleListeningErrors(errorMessage, EVENTS.PROXY_ERROR);
		});
	}

	/**
	 * Public method that stops the proxy and returns a Promise resolved when it's fully closed
	 */
	async stop() {
		if (this._localProxy) {
			// Wrap the close callback in a Promise
			const closePromise = new Promise((resolve, reject) => {
				this._localProxy.close(err => {
					if (err) {
						reject(err);
					} else {
						console.log('SuiteCloud Proxy server stopped.');
						resolve();
					}
				});
			});

			await closePromise;
			this._localProxy = null;
		} else {
			console.log('No server instance to stop.');
		}
	}

	/**
	 * Updates the stored API key, which is used to authenticate and filter incoming requests to the local server.
	 *
	 * @param {string} newApiKey - The new API key to set for request filtering.
	 * @returns {void}
	 */
	updateApiKey(newApiKey) {
		this._apiKey = newApiKey;
	}


	/**
	 * For being used after manual authentication. It refreshes the access token from credentials.
	 * @returns {Promise<void>}
	 */
	async reloadAccessToken() {
		const { accessToken } = await this._retrieveCredentials();
		this._accessToken = accessToken;
		console.log('access token refreshed');
	}

	_handleListeningErrors(errorMsg, event) {
		console.error(errorMsg);
		this.emit(event, this._buildEmitObject(errorMsg));
	}

	/**
	 * It validates the input parameters
	 * @param authId
	 * @param proxyPort
	 * @private
	 */
	_evalInputParameters(authId, proxyPort) {
		if (!authId) {
			throw NodeTranslationService.getMessage(SUITECLOUD_AUTH_PROXY_SERVICE.MISSING_AUTH_ID);
		}

		if (!proxyPort) {
			throw NodeTranslationService.getMessage(SUITECLOUD_AUTH_PROXY_SERVICE.MISSING_PORT);
		}

		if (isNaN(proxyPort)) {
			throw NodeTranslationService.getMessage(SUITECLOUD_AUTH_PROXY_SERVICE.PORT_MUST_BE_NUMBER);
		}
	}

	/**
	 * This method retrieves the credentials and returns the hostname and the accessToken
	 * @returns {Promise<{hostName: string, accessToken: string}>}
	 * @private
	 */
	async _retrieveCredentials() {
		const authIDActionResult = await getAuthIds(this._sdkPath);

		if (!authIDActionResult.isSuccess()) {
			throw authIDActionResult.errorMessages;
		}

		if (!authIDActionResult.data.hasOwnProperty(this._authId)) {
			throw NodeTranslationService.getMessage(SUITECLOUD_AUTH_PROXY_SERVICE.NOT_EXISTING_AUTH_ID, this._authId);
		}
		return {
			accessToken: authIDActionResult.data[this._authId].token.accessToken,
			hostName: authIDActionResult.data[this._authId].hostInfo.hostName,
		};
	}

	/**
	 * Validates an incoming proxy request for authentication and path prefix.
	 * Responds and emits the correct events on failure.
	 * @param {http.IncomingMessage} request
	 * @param {http.ServerResponse} response
	 * @returns {boolean} true if valid, false if rejected
	 */
	validateIncomingRequest(request, response) {
		// Authentication filter: check authorization header if an API key is configured
		if (this._apiKey) {
			const authHeader = request.headers['authorization'];
			// TODO remove console logs
			console.log('--->>>   SuiteCloudAuthProxyService.validateIncomingRequest.  <<<---');
			console.log({ authHeader, proxyApiKey: this._apiKey })
			if (authHeader !== `Bearer ${this._apiKey}`) {
				const unauthorizedMessage = 'Unauthorized: Missing or invalid API Key';
				// TODO explore different http response code options
				// using 400 as CLINE is hiddiing the allowedPathPrefix when using 407-Proxy Authentication Required
				this._writeResponseMessage(response, 400, unauthorizedMessage);
				const emitData = { message: unauthorizedMessage, authId: this._authId, requestUrl: request.url};
				this.emit(EVENTS.UNAUTHORIZED_PROXY_REQUEST, emitData);
				return false;
			}
		}
		// Allowed path filter: check allowed prefix if configured
		if (this._allowedPathPrefix) {
			if (!request.url.startsWith(this._allowedPathPrefix)) {
				const pathNotAllowedMessage = 'Forbidden: Path not allowed';
				this._writeResponseMessage(response, HTTP_RESPONSE_CODE.FORBIDDEN, pathNotAllowedMessage);
				this.emit(EVENTS.REQUEST_PATH_NOT_ALLOWED, this._buildEmitObject(pathNotAllowedMessage));
				return false;
			}
		}
		return true;
	}

	/**
	 * Builds request options
	 * @param request request
	 * @returns {{path: *, headers: *&{authorization: string}, hostname: *, method: *, port: number}}
	 * @private
	 */
	_buildRequestOptions(request) {
		const authorization = 'Bearer ' + this._accessToken;
		const host = this._targetHost;

		const requestOptions = {
			hostname: this._targetHost,
			port: TARGET_SERVER_PORT,
			path: request.url,
			method: request.method,
			headers: { ...request.headers, host, authorization },
		};

		// Add agent for insecure connections when connecting to runboxes
		if (this._targetHost && this._targetHost.includes('vm.eng')) {
			requestOptions.agent = new https.Agent({
				rejectUnauthorized: false,
			});
			requestOptions.rejectUnauthorized = false;
		}
		return requestOptions;
	}

	async _createProxyRequest(requestOptions, body, response, attempts) {
		const proxyRequest = https.request(requestOptions, async (proxyResponse) => {
			if (proxyResponse.statusCode === HTTP_RESPONSE_CODE.UNAUTHORIZED && attempts <= MAX_RETRY_ATTEMPTS) {
				proxyResponse.resume();
				const refreshOperationResult = await this._tryRefreshOperation();

				if (refreshOperationResult.accessTokenHasBeenUpdated) {
					this._updateRequestAuthorizationHeader(requestOptions);
					const newProxyRequest = await this._createProxyRequest(requestOptions, body, response, attempts + 1);
					newProxyRequest.write(body);
					newProxyRequest.end();
				} else {
					this.emit(refreshOperationResult.emitEventName, this._buildEmitObject(refreshOperationResult.errorMessage));
					//Message shown to cline
					this._writeResponseMessage(response, refreshOperationResult.responseStatusCode, refreshOperationResult.errorMessage);
					proxyResponse.pipe(response, { end: true });
				}
			} else {
				response.writeHead(proxyResponse.statusCode || HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR, proxyResponse.headers);
				proxyResponse.pipe(response, { end: true });
			}

		});

		proxyRequest.on('error', (err) => {
			console.error('Proxy request error:', err);
			response.writeHead(HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR);
			this.emit(EVENTS.SERVER_ERROR, this._buildEmitObject(err.message));
			//TODO Review this message and see confluence error pages and review with the tech writers
			response.end('SuiteCloud Proxy error: ' + err.message);
		});
		return proxyRequest;
	}

	/**
	 * This method refreshes authorization.
	 * If successful returns true and updates this._accessToken
	 * If not successful returns false and returns the http response and the info to generate the emit message.
	 * @returns {Promise<*>}
	 * @private
	 */
	async _tryRefreshOperation() {
		const refreshInfo = {
			accessTokenHasBeenUpdated: false,//Whether the token has been updated or not.
			emitEventName: undefined,        //Event to be thrown.
			responseStatusCode: undefined,   //HTTP response status code.
			errorMessage: undefined          //Error message, used both for emit data and http response.
		};

		const inspectAuthOperationResult = await checkIfReauthorizationIsNeeded(this._authId, this._sdkPath, this._executionEnvironmentContext);

		//Not being able to execute the reauth if needed, it can be vpn disconnected, network problems...
		if (!inspectAuthOperationResult.isSuccess()) {
			const errorMsg = this._cleanText(inspectAuthOperationResult.errorMessages.join('. '));

			refreshInfo.emitEventName = EVENTS.SERVER_ERROR_ON_REFRESH;
			refreshInfo.errorMessage = errorMsg;
			refreshInfo.responseStatusCode = HTTP_RESPONSE_CODE.FORBIDDEN;

			return Object.freeze(refreshInfo);
		}

		//Needs manual reauthorization
		const inspectAuthData = inspectAuthOperationResult.data;
		if (inspectAuthData[AUTHORIZATION_PROPERTIES_KEYS.NEEDS_REAUTHORIZATION]) {
			const errorMsg = NodeTranslationService.getMessage(SUITECLOUD_AUTH_PROXY_SERVICE.NEED_TO_REAUTHENTICATE);

			refreshInfo.emitEventName = EVENTS.AUTH_REFRESH_MANUAL_EVENT;
			refreshInfo.errorMessage = errorMsg;
			refreshInfo.responseStatusCode = HTTP_RESPONSE_CODE.FORBIDDEN;

			return Object.freeze(refreshInfo);
		}

		//force refresh
		const forceRefreshOperationResult = await forceRefreshAuthorization(this._authId, this._sdkPath, this._executionEnvironmentContext);
		if (!forceRefreshOperationResult.isSuccess()) {
			//Refresh unsuccessful
			const errorMsg = this._cleanText(forceRefreshOperationResult.errorMessages.join('. '));

			refreshInfo.emitEventName = EVENTS.AUTH_REFRESH_MANUAL_EVENT;
			refreshInfo.errorMessage = errorMsg;
			refreshInfo.responseStatusCode = HTTP_RESPONSE_CODE.FORBIDDEN;

			return Object.freeze(refreshInfo);
		} else {
			//If the refresh has been successful
			//Return operation forceRefreshOperationResult as true and update the accessToken
			refreshInfo.accessTokenHasBeenUpdated = true;
			this._accessToken = forceRefreshOperationResult.data.accessToken;

			return Object.freeze(refreshInfo);
		}
	}

	/**
	 * This method is created in order to have centralized the structure of the
	 * emit object in case it should be changed into the future
	 * @param errorMsg
	 * @returns {{message, authId}}
	 * @private
	 */
	_buildEmitObject(errorMsg) {
		return { message: errorMsg, authId: this._authId };
	}

	/**
	 * Method to clear output messages.
	 * The reason for this is the output do not show properly \n and \r
	 * So they are replaced by . and made some extra adjustments.
	 * @param input
	 * @returns {*}
	 */
	_cleanText(input) {
		let result = input.replace(/\r/g, '');   // Remove \r
		result = result.replace(/\n/g, '. ');  // Replace \n with ". "
		result = result.replace(/,\./g, '.');  // Replace ",." with "."
		result = result.replace(/"/g, '\''); //Replace \" by ' since \" also show problems.
		while (result.includes('  ')) {    // Replace double spaces with single space
			result = result.replace(/  /g, ' ');
		}
		while (result.includes('..')) { // Replace ".." with "."
			result = result.replace(/\.\./g, '.');
		}
		return result;
	}

	/**
	 * Update requestOptions access token without need to rebuild the requestOptions
	 * @param requestOptions
	 * @private
	 */
	_updateRequestAuthorizationHeader(requestOptions) {
		if (requestOptions.headers && requestOptions.headers.authorization) {
			requestOptions.headers.authorization = 'Bearer ' + this._accessToken;
		}
	}


	/**
	 * Write JSON response message
	 * @param response
	 * @param responseCode
	 * @param responseMessage
	 * @private
	 */
	_writeResponseMessage(response, responseCode, responseMessage) {
		response.writeHead(responseCode, { 'Content-Type': 'application/json' });
		const message = { error: responseMessage };
		response.end(JSON.stringify(message));
	}

}

module.exports = { SuiteCloudAuthProxyService, EVENTS };
