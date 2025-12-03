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
	PROXY_ERROR: {
		DEFAULT: 'proxyError',
		MANUAL_AUTH_REFRESH_REQUIRED: 'manualAuthRefreshRequired'
	},
	REQUEST_ERROR: {
		PATH_NOT_ALLOWED: 'requestPathNotAllowed',
		UNAUTHORIZED: 'unauthorizedProxyRequest'
	},
	SERVER_ERROR: {
		DEFAULT: 'serverError',
		ON_AUTH_REFRESH: 'serverErrorOnRefresh',
	},
}

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

	constructor(sdkPath, executionEnvironmentContext, allowedPathPrefix, apiKey) {
		super();
		this._sdkPath = sdkPath;
		this._executionEnvironmentContext = executionEnvironmentContext;
		this._allowedPathPrefix = allowedPathPrefix;
		this._apiKey = apiKey;
		/** These are the variables we are going to use to store instance data */
		this._accessToken = undefined;
		this._localProxy = undefined;
		this._targetHost = undefined;
		this._authId = undefined;
	}

	/**
	 * starts the listener.
	 * It can return an error, for instance when it cannot connect to the auth server or the parameters being incorrect
	 * @public
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

			// Validate incoming request (Api Key & Request Path)
			if (!this._isValidAndFilterIncomingRequest(request, response)) {
				return
			}

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
			this._emitEventWithData(EVENTS.PROXY_ERROR.DEFAULT, errorMessage);
		});
	}

	/**
	 * Public method that stops the proxy and returns a Promise resolved when it's fully closed
	 * @public
	 */
	async stop() {
		// when having a "listen EADDRINUSE: address already in use 127.0.0.1:49285" the server instance exists but is not listening
		// to avoid "Error [ERR_SERVER_NOT_RUNNING]: Server is not running." at close time there is the need to check if server is activelly listening
		if (this._localProxy && this._localProxy.listening) {
			// Wrap the close callback in a Promise
			const closePromise = new Promise((resolve, reject) => {
				this._localProxy.close(error => {
					if (error) {
						console.error('Error occurred while stopping SuiteCloud Auth Proxy server.')
						console.error(error)
						reject(error);
					} else {
						console.log('SuiteCloud Auth Proxy server stopped.');
						resolve();
					}
				});
			});

			await closePromise;
		} else {
			console.log('No server instance to stop.');
		}

		this._localProxy = null;
	}

	/**
	 * Updates the stored API key, which is used to authenticate and filter incoming requests to the local server.
	 *
	 * @public
	 * @param {string} newApiKey - The new API key to set for request filtering.
	 * @returns {void}
	 */
	updateApiKey(newApiKey) {
		this._apiKey = newApiKey;
	}


	/**
	 * For being used after manual authentication. It refreshes the access token from credentials.
	 * @public
	 * @returns {Promise<void>}
	 */
	async reloadAccessToken() {
		const { accessToken } = await this._retrieveCredentials();
		this._accessToken = accessToken;
		console.log('access token refreshed');
	}

	/**
	 * Emits an event with a structured data object.
	 *
	 * @param {string} eventName - The name of the event to emit.
	 * @param {string} errorMessage - The error message to include in the data object.
	 * @param {string} [requestUrl] - (Optional) The URL associated with the event, if applicable.
	 * @returns {void}
	 * @private
	 */
	_emitEventWithData(eventName, errorMessage, requestUrl) {
		const emitData = {
			authId: this._authId,
			message: errorMessage,
			...(requestUrl && { requestUrl })
		}
		console.error({ eventName, emitData });
		this.emit(eventName, emitData);
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
	 * Validates an incoming proxy request for apiKey & allowed path.
	 * Responds and emits the correct events on failure.
	 * @param {http.IncomingMessage} request
	 * @param {http.ServerResponse} response
	 * @returns {boolean} true if valid, false if rejected
	 */
	_isValidAndFilterIncomingRequest(request, response) {
		const requestValidationFunctions = [
			this._checkAuthenticationHeader.bind(this),
			this._checkRequestPath.bind(this)
		];

		// check all validations are true or stops in the first failing one and returns false
		return requestValidationFunctions.every((validateFunction => validateFunction(request, response)));
	}

	/**
	 * Authentication filter: check authorization header if an API key is configured.
	 * Manages response and emit event on failure
	 */
	_checkAuthenticationHeader(request, response) {
		if (this._apiKey) {
			const authHeader = request.headers['authorization'];
			if (authHeader !== `Bearer ${this._apiKey}`) {
				const unauthorizedMessage = NodeTranslationService.getMessage(SUITECLOUD_AUTH_PROXY_SERVICE.UNAUTHORIZED_PROXY_REQUEST);
				// using 401-Unauthorized http response code as CLINE won't activate the retry mechanism with it
				// not using 407-Proxy Authentication Required as CLINE activates the retry mechanism with it
				this._writeResponseMessage(response, HTTP_RESPONSE_CODE.UNAUTHORIZED, unauthorizedMessage);
				this._emitEventWithData(EVENTS.REQUEST_ERROR.UNAUTHORIZED, unauthorizedMessage, request.url)
				return false;
			}
		}
		return true;
	}

	/**
	 * Allowed path filter: check allowed prefix if configured.
	 * Manages response and emit event on failure
	 */
	_checkRequestPath(request, response) {
		// Allowed path filter: check allowed prefix if configured
		if (this._allowedPathPrefix && !request.url.startsWith(this._allowedPathPrefix)) {
			const errorMessage = NodeTranslationService.
				getMessage(SUITECLOUD_AUTH_PROXY_SERVICE.REQUEST_PATH_NOT_ALLOWED_ERROR, this._allowedPathPrefix);
			this._writeResponseMessage(response, HTTP_RESPONSE_CODE.FORBIDDEN, errorMessage);
			this._emitEventWithData(EVENTS.REQUEST_ERROR.PATH_NOT_ALLOWED, errorMessage);
			return false;
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
					this._emitEventWithData(refreshOperationResult.emitEventName, refreshOperationResult.errorMessage);
					//Message shown to cline
					this._writeResponseMessage(response, refreshOperationResult.responseStatusCode, refreshOperationResult.errorMessage);
					proxyResponse.pipe(response, { end: true });
				}
			} else {
				response.writeHead(proxyResponse.statusCode || HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR, proxyResponse.headers);
				proxyResponse.pipe(response, { end: true });
			}

		});

		proxyRequest.on('error', (error) => {
			console.error('Proxy request error:', error);
			this._emitEventWithData(EVENTS.SERVER_ERROR.DEFAULT, error.message)
			response.writeHead(HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR);
			//TODO Review this message and see confluence error pages and review with the tech writers
			response.end('SuiteCloud Proxy error: ' + error.message);
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

			refreshInfo.emitEventName = EVENTS.SERVER_ERROR.ON_AUTH_REFRESH;
			refreshInfo.errorMessage = errorMsg;
			refreshInfo.responseStatusCode = HTTP_RESPONSE_CODE.FORBIDDEN;

			return Object.freeze(refreshInfo);
		}

		//Needs manual reauthorization
		const inspectAuthData = inspectAuthOperationResult.data;
		if (inspectAuthData[AUTHORIZATION_PROPERTIES_KEYS.NEEDS_REAUTHORIZATION]) {
			const errorMsg = NodeTranslationService.getMessage(SUITECLOUD_AUTH_PROXY_SERVICE.NEED_TO_REAUTHENTICATE);

			refreshInfo.emitEventName = EVENTS.PROXY_ERROR.MANUAL_AUTH_REFRESH_REQUIRED;
			refreshInfo.errorMessage = errorMsg;
			refreshInfo.responseStatusCode = HTTP_RESPONSE_CODE.FORBIDDEN;

			return Object.freeze(refreshInfo);
		}

		//force refresh
		const forceRefreshOperationResult = await forceRefreshAuthorization(this._authId, this._sdkPath, this._executionEnvironmentContext);
		if (!forceRefreshOperationResult.isSuccess()) {
			//Refresh unsuccessful
			const errorMsg = this._cleanText(forceRefreshOperationResult.errorMessages.join('. '));

			refreshInfo.emitEventName = EVENTS.PROXY_ERROR.MANUAL_AUTH_REFRESH_REQUIRED;
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
