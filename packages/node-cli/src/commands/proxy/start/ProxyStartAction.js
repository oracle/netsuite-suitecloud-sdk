/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ActionResult } = require('../../../services/actionresult/ActionResult');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const BaseAction = require('../../base/BaseAction');
const { SuiteCloudAuthProxyService, EVENTS } = require('../../../services/SuiteCloudAuthProxyService');
const { executeWithSpinner } = require('../../../ui/CliSpinner');
const { COMMAND_PROXY_START, COMMAND_REFRESH_AUTHORIZATION } = require('../../../services/TranslationKeys');
const { refreshAuthorization } = require('../../../utils/AuthenticationUtils');
const { resolveDefaultClientApiKey } = require('../../../utils/ClientAPIKeyUtils');
const {
	PROXY_START: {
		COMMAND: { OPTIONS },
		ALLOWED_PROXY_PATH_PREFIX,
	},
} = require('./ProxyStartConstants');
const { isValidProxyStartPort, getInvalidProxyStartPortMessage } = require('./ProxyStartValidation');

module.exports = class ProxyStartAction extends BaseAction {
	constructor(options) {
		super(options);
		this._proxyService = null;
		this._manualRefreshInFlight = null;
		this._isShuttingDown = false;
		this._proxyReadiness = {
			promise: null,
			resolve: null,
			reject: null,
			settled: false,
		};
	}

	preExecute(params) {
		return params;
	}

	async execute(params) {
		try {
			const authId = params[OPTIONS.AUTH_ID];
			const port = Number(params[OPTIONS.PORT]);
			this._validatePort(port);
			const apiKey = params.apiKey || (await resolveDefaultClientApiKey(this._sdkExecutor)).apiKey;

			// IMPORTANT: create proxy readiness promise before start().
			// This promise is settled by proxy events: LISTENING => resolve, PROXY_ERROR => reject.
			// We await it so command success is gated on actual proxy readiness to accept requests.
			// It must be initialized first to avoid missing very early event emissions.
			this._createProxyReadinessPromise();
			this._proxyService = new SuiteCloudAuthProxyService(this._sdkPath, this._executionEnvironmentContext, ALLOWED_PROXY_PATH_PREFIX, apiKey);
			this._registerProxyEvents();
			this._registerShutdownHandlers();

			await this._proxyService.start(authId, port);
			
			// NOTE: this readiness promise usually resolves very quickly once the server begins listening.
			// Even if spinner visibility is brief, awaiting it guarantees successful ActionResult is produced
			// only after the LISTENING event confirms the proxy is ready to accept incoming requests.
			await executeWithSpinner({
				action: this._proxyReadiness.promise,
				message: NodeTranslationService.getMessage(COMMAND_PROXY_START.MESSAGES.STARTED, authId, port),
			});

			return ActionResult.Builder
				.withData({ authId, port })
				.withCommandParameters(params)
				.build();
		} catch (error) {
			const errorMessagesArray = Array.isArray(error) ? error : [error];  
			return ActionResult.Builder
				.withErrors(errorMessagesArray)
				.withCommandParameters(params)
				.build();
		}
	}

	_validatePort(port) {
		if (!isValidProxyStartPort(port)) {
			throw getInvalidProxyStartPortMessage();
		}

		if (!this._validatePortAvailability(port)) {
			throw NodeTranslationService.getMessage(COMMAND_PROXY_START.ERRORS.PORT_ALREADY_IN_USE, port);
		}
	}

	_validatePortAvailability(port) {
		// TODO PDPDEVTOOL-6392: validate if port is already in use before starting the proxy.
		return true;
	}

	_createProxyReadinessPromise() {
		this._proxyReadiness.settled = false;
		this._proxyReadiness.promise = new Promise((resolve, reject) => {
			this._proxyReadiness.resolve = resolve;
			this._proxyReadiness.reject = reject;
		});
	}

	_markProxyReadyIfPending() {
		if (this._proxyReadiness.settled) {
			return;
		}

		this._proxyReadiness.settled = true;
		this._proxyReadiness.resolve();
	}

	_markProxyNotReadyIfPending(errorMessage) {
		if (this._proxyReadiness.settled) {
			return;
		}

		this._proxyReadiness.settled = true;
		this._proxyReadiness.reject(errorMessage);
	}

	_registerProxyEvents() {
		// Dedicated handlers for events with custom behavior.
		this._proxyService.on(EVENTS.PROXY_ERROR.MANUAL_AUTH_REFRESH_REQUIRED, this._handleManualAuthRefreshRequired.bind(this));
		this._proxyService.on(EVENTS.SERVER_INFO.LISTENING, this._handleServerListening.bind(this));
		this._proxyService.on(EVENTS.SERVER_INFO.STOPPED, this._handleServerStopped.bind(this));

		// Forward error events directly to CLI output.
		this._proxyService.on(EVENTS.PROXY_ERROR.DEFAULT, this._handleProxyErrorDefault.bind(this));
		this._proxyService.on(EVENTS.REQUEST_ERROR.PATH_NOT_ALLOWED, ({ message }) => this._log.error(message));
		this._proxyService.on(EVENTS.REQUEST_ERROR.UNAUTHORIZED, ({ message }) => this._log.error(message));
		this._proxyService.on(EVENTS.SERVER_ERROR.DEFAULT, ({ message }) => this._log.error(message));
		this._proxyService.on(EVENTS.SERVER_ERROR.ON_AUTH_REFRESH, ({ message }) => this._log.error(message));
	}

	_handleProxyErrorDefault({ message }) {
		if (!this._proxyReadiness.settled) {
			this._markProxyNotReadyIfPending(message);
			return;
		}

		this._log.error(message);
	}

	async _handleManualAuthRefreshRequired({ message, authId }) {
		if (this._manualRefreshInFlight) {
			await this._manualRefreshInFlight;
			return;
		}

		this._manualRefreshInFlight = (async () => {
			this._log.error(message);
			await this._log.info(NodeTranslationService.getMessage(COMMAND_REFRESH_AUTHORIZATION.MESSAGES.CREDENTIALS_NEED_TO_BE_REFRESHED, authId));
			const refreshAuthzOperationResult = await refreshAuthorization(authId, this._sdkPath, this._executionEnvironmentContext);

			if (!refreshAuthzOperationResult.isSuccess()) {
				this._log.error(refreshAuthzOperationResult.errorMessages);
				return;
			}

			await this._proxyService.reloadAccessToken();
			await this._log.info(NodeTranslationService.getMessage(COMMAND_REFRESH_AUTHORIZATION.MESSAGES.AUTHORIZATION_REFRESH_COMPLETED));
		})().catch((error) => {
			this._log.error(error);
		}).finally(() => {
			this._manualRefreshInFlight = null;
		});

		await this._manualRefreshInFlight;
	}

	_handleServerListening() {
		this._markProxyReadyIfPending();
	}

	_handleServerStopped() {
		this._log.info(NodeTranslationService.getMessage(COMMAND_PROXY_START.MESSAGES.STOPPED));
	}

	_registerShutdownHandlers() {
		const shutdown = async () => {
			if (this._isShuttingDown) {
				return;
			}

			this._isShuttingDown = true;

			try {
				if (this._proxyService) {
					// Ensure shutdown feedback starts on a new line instead of being appended to terminal '^C' echo.
					await this._log.info('');
					await this._log.info(NodeTranslationService.getMessage(COMMAND_PROXY_START.MESSAGES.STOPPING));
					await this._proxyService.stop();
				}
				process.exit(0);
			} catch (error) {
				this._log.error(error);
				process.exit(1);
			}
		};

		process.on('SIGINT', shutdown); 	// Ctrl+C on Linux, macOS, and Windows terminals.
		process.on('SIGTERM', shutdown); 	// Termination requests from the OS, shell, or process managers.
		process.on('SIGBREAK', shutdown); 	// Ctrl+Break on Windows terminals.
	}
};
