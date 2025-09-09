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
const AUTH_REFRESH_MANUAL_EVENT = "authRefreshManual";

/** Authentication methods */
const {
	getAuthIds,
	checkIfReauthorizationIsNeeded,
	forceRefreshAuthorization,
} = require('../utils/AuthenticationUtils');
const {
	AUTHORIZATION_PROPERTIES_KEYS,
} = require('../ApplicationConstants');

/** Message literal service method */
const NodeTranslationService = require('./NodeTranslationService');
const {
	DEV_ASSIST_PROXY_SERVICE,
} = require('./TranslationKeys');


const SdkOperationResult = require('../utils/SdkOperationResult');
const LOCAL_HOSTNAME = '127.0.0.1';

/** Target server port */
const TARGET_SERVER_PORT = 443;

/** Http codes */
const UNAUTHORIZED_RESPONSE = 401;
const FORBIDDEN_RESPONSE = 403;
const INTERNAL_SERVER_ERROR_RESPONSE = 500;

/** Time to refresh authorization */
const MS_TO_REFRESH = 60 * 60 * 1000; // 3600000 milliseconds in one hour

/**
 * Token status, UP_TO_DATE is the default standard.
 * When manual refresh is needed the response output is need to authenticate message
 * One the user has been authenticated externally, vscode will move to MANUAL_REFRESH_NEEDED_APPLIED
 * When MANUAL_REFRESH_NEEDED_APPLIED is detected, the credentials are reloaded and set UP_TO_DATE again
 * @type {Readonly<{MANUAL_REFRESH_NEEDED_APPLIED: string, UP_TO_DATE: string, MANUAL_REFRESH_NEEDED: string}>}
 */
const Status = Object.freeze({
	UP_TO_DATE: 'UP_TO_DATE',
	MANUAL_REFRESH_NEEDED: 'MANUAL_REFRESH_NEEDED',
	MANUAL_REFRESH_NEEDED_APPLIED: 'MANUAL_REFRESH_NEEDED_APPLIED'
});

class DevAssistProxyService extends EventEmitter {
	constructor(sdkPath, executionEnvironmentContext) {
		super();
		this._sdkPath = sdkPath;
		this._executionEnvironmentContext = executionEnvironmentContext;
		/** These are the variables we are going to use to store instance data */
		this._accessToken = undefined;
		this._localProxy = undefined;
		this._targetHost = undefined;
		this._authId = undefined;
		this._lastCheckedTimestamp = undefined;
		this._isManualRefreshNeeded = undefined;
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
			throw NodeTranslationService.getMessage(DEV_ASSIST_PROXY_SERVICE.NOT_EXISTING_AUTH_ID, this._authId);
		}
		return {
			accessToken: authIDActionResult.data[this._authId].token.accessToken,
			hostName: authIDActionResult.data[this._authId].hostInfo.hostName,
		};
	}

	/**
	 * This method refreshes authorization
	 * @returns {Promise<*>}
	 * @private
	 */
	async _forceRefreshAuth() {
		let inspectAuthOperationResult = await checkIfReauthorizationIsNeeded(this._authId, this._sdkPath, this._executionEnvironmentContext);
		if (!inspectAuthOperationResult.isSuccess()) {
			//TODO send special message The remote server returned an error:\n\n\nReceived fatal alert: internal_error; when not being able to connect, for instance vpn disconnected
			throw inspectAuthOperationResult.errorMessages;
		}

		let inspectAuthData = inspectAuthOperationResult.data;
		if (inspectAuthData[AUTHORIZATION_PROPERTIES_KEYS.NEEDS_REAUTHORIZATION]) {
			throw NodeTranslationService.getMessage(DEV_ASSIST_PROXY_SERVICE.NEED_TO_REAUTHENTICATE);
		} else {
			//force refresh
			let result = await forceRefreshAuthorization(this._authId, this._sdkPath, this._executionEnvironmentContext);
			if (result.status === 'ERROR') {
				/*if (result.errorMessages && result.errorMessages.length > 0) {
					throw result.errorMessages[0];
				} else {
					//throw NodeTranslationService.getMessage(DEV_ASSIST_PROXY_SERVICE.NEED_TO_REAUTHENTICATE);
				}*/
				//We are going to change the state and return an undefined access token
				this._isManualRefreshNeeded = Status.MANUAL_REFRESH_NEEDED;
				return undefined;
			}
			return result.data.accessToken;
		}
	}

	/**
	 * Builds request options
	 * @param req request
	 * @returns {{path: *, headers: *&{authorization: string}, hostname: *, method: *, port: number}}
	 * @private
	 */
	_buildOptions(req) {
		//if token needs to be re authorized manually we use a dummy authorization in order to trigger
		//the UNAUTHORIZED error response into cline and show our personalized message
		const authorization = (this._isManualRefreshNeeded === Status.UP_TO_DATE) ?
			'Bearer ' + this._accessToken
			: '';

		const options = {
			hostname: this._targetHost,
			port: TARGET_SERVER_PORT,
			path: req.url,
			method: req.method,
			headers: { ...req.headers, authorization },
		};

		// Add agent for insecure connections when connecting to runboxes
		if (this._targetHost && this._targetHost.includes('vm.eng')) {
			console.log('Disabling reject unauthorized');
			options.agent = new https.Agent({
				rejectUnauthorized: false,
			});
			options.rejectUnauthorized = false;
		}

		console.log('Target: ' + options.hostname);
		console.log('Path: ' + options.path);
		console.log('Authorization: ' + (options.headers?.authorization?.substring(0, 20) + '...'));

		return options;
	}

	_writeResponseMessage(clineResponse, responseCode, responseMessage) {
		clineResponse.writeHead(responseCode, { 'Content-Type': 'application/json' });
		const message = { error: responseMessage };
		clineResponse.end(JSON.stringify(message));
	}

	async _createProxyReq(clineRequest, clineResponse) {
		await this._refreshAuthIfNeeded();
		let options = this._buildOptions(clineRequest);
		const authenticatedRequest = https.request(options, async (serverResponse) => {
			console.log(`Proxy response: ${serverResponse.statusCode}`);

			if (serverResponse.statusCode === UNAUTHORIZED_RESPONSE) {
				//401 make appear the sign-in to cline button, so we use instead 403
				this._writeResponseMessage(clineResponse, FORBIDDEN_RESPONSE, NodeTranslationService.getMessage(DEV_ASSIST_PROXY_SERVICE.NEED_TO_REAUTHENTICATE));
				//Emit the need to reauthorize message
				this.emit(AUTH_REFRESH_MANUAL_EVENT, { message: 'Auth Token needs been refreshed manually.' });
			} else {
				clineResponse.writeHead(serverResponse.statusCode || INTERNAL_SERVER_ERROR_RESPONSE, serverResponse.headers);
				serverResponse.pipe(clineResponse, { end: true });
			}
		});

		authenticatedRequest.on('error', (err) => {
			console.error('Proxy request error:', err);
			clineResponse.writeHead(INTERNAL_SERVER_ERROR_RESPONSE);
			clineResponse.end('SuiteCloud Proxy error: ' + err.message);
		});

		clineRequest.pipe(authenticatedRequest, { end: true });
	}

	async _refreshAuthIfNeeded() {

		if (this._isManualRefreshNeeded === Status.MANUAL_REFRESH_NEEDED) {
			//Needs manual refresh. Do not do anything.
			console.log('Manual refresh needed');
			return;
		} else if (this._isManualRefreshNeeded === Status.MANUAL_REFRESH_NEEDED_APPLIED) {
			//Manual refresh has been applied. Load the new credentials and reset the state.
			let { accessToken } = await this._retrieveCredentials();
			this._accessToken = accessToken;
			this._lastCheckedTimestamp = Date.now();
			console.log('Manual refresh applied');
			this._isManualRefreshNeeded = Status.UP_TO_DATE;
		} else if (!this._lastCheckedTimestamp) {
			//First time checked
			console.log('Token is going to be refreshed');
			this._accessToken = await this._forceRefreshAuth();
			this._lastCheckedTimestamp = Date.now();
		} else {
			const now = Date.now();  // current time in ms since Unix epoch
			if ((now - this._lastCheckedTimestamp) > MS_TO_REFRESH) {
				console.log('Token is going to be refreshed');
				this._accessToken = await this._forceRefreshAuth();
				this._lastCheckedTimestamp = now;
			}
		}
		console.log('Refresh token date: ' + this._dateToString(this._lastCheckedTimestamp));
	}

	_dateToString(timestamp) {
		const date = new Date(timestamp);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		const seconds = String(date.getSeconds()).padStart(2, '0');

		// Format: YYYY-MM-DD HH:MM:SS
		return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
		if (!authId) {
			throw NodeTranslationService.getMessage(DEV_ASSIST_PROXY_SERVICE.MISSING_AUTH_ID);
		} else {
			this._authId = authId;
		}

		if (!proxyPort) {
			throw NodeTranslationService.getMessage(DEV_ASSIST_PROXY_SERVICE.MISSING_PORT);
		}

		if (isNaN(proxyPort)) {
			throw NodeTranslationService.getMessage(DEV_ASSIST_PROXY_SERVICE.PORT_MUST_BE_NUMBER);
		}

		//Retrieve from authId accessToken and target host
		let { hostName } = await this._retrieveCredentials();
		this._targetHost = hostName;

		//Default state, no need of manual reauthorize
		this._isManualRefreshNeeded = Status.UP_TO_DATE;
		//reset last refreshed time
		this._lastCheckedTimestamp = undefined;

		await this._refreshAuthIfNeeded();

		this._localProxy = http.createServer();

		this._localProxy.addListener('request', async (req, res) => {
			console.log(`${req.method} ${req.url}`);
			await this._createProxyReq(req, res);
		});

		this._localProxy.listen(proxyPort, LOCAL_HOSTNAME, () => {
			const localURL = `http://${LOCAL_HOSTNAME}:${proxyPort}`;
			console.log(`SuiteCloud Proxy server listening on ${localURL}`);
			console.log(`Set Cline Base URL to: ${localURL}/api/internal/devassist`);
			console.log('SuiteCloud Proxy running.');
			console.log(`Configure Cline Base URL to: ${localURL}/api/internal/devassist`);
			console.log(`SuiteCloud Proxy server listening on ${localURL}`);
			console.log(`SuiteCloud Proxy is using the ${authId} authID`);
			console.log(`Configure Cline Base URL to: ${localURL}/api/internal/devassist`);
		});
	}

	/**
	 * Stops servernp
	 * @returns {Promise<void>}
	 */
	async stop() {
		if (this._localProxy) {
			this._localProxy.close(() => {
				console.log('SuiteCloud Proxy server stopped.');
			});
			this._localProxy = null;
		} else {
			console.log('No server instance to stop.');
		}
	}

	/** gets refresh status*/
	getRefreshStatus(){
		return this._isManualRefreshNeeded;
	}

	/** Sets refresh status */
	setRefreshStatus(newStatus){
		this._isManualRefreshNeeded = newStatus;
		console.log('Refresh status changed to:'+this._isManualRefreshNeeded);
	}

}

module.exports = {DevAssistProxyService, Status, AUTH_REFRESH_MANUAL_EVENT };