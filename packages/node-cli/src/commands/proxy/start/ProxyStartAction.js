/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ActionResult } = require('../../../services/actionresult/ActionResult');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const BaseAction = require('../../base/BaseAction');
const { SuiteCloudAuthProxyService, EVENTS } = require('../../../services/SuiteCloudAuthProxyService');
const { COMMAND_PROXY_START, COMMAND_REFRESH_AUTHORIZATION } = require('../../../services/TranslationKeys');
const { refreshAuthorization } = require('../../../utils/AuthenticationUtils');
const { resolveDefaultClientApiKey } = require('../../../utils/ClientAPIKeyUtils');

const COMMAND = {
	OPTIONS: {
		AUTH_ID: 'authid',
		PORT: 'port',
	},
};

const PORT_RANGE = {
	MIN: 1024,
	MAX: 65535,
};

const ALLOWED_PROXY_PATH_PREFIX = '/api/internal/devassist/';

module.exports = class ProxyStartAction extends BaseAction {
	constructor(options) {
		super(options);
		this._proxyService = null;
		this._manualRefreshInFlight = null;
		this._isShuttingDown = false;
	}

	preExecute(params) {
		const port = Number(params[COMMAND.OPTIONS.PORT]);
		this._validatePort(port);

		return {
			...params,
			[COMMAND.OPTIONS.PORT]: port,
		};
	}

	async execute(params) {
		try {
			const authId = params[COMMAND.OPTIONS.AUTH_ID];
			const port = params[COMMAND.OPTIONS.PORT];
			const apiKey = params.apiKey || (await resolveDefaultClientApiKey(this._sdkExecutor)).apiKey;

			this._proxyService = new SuiteCloudAuthProxyService(this._sdkPath, this._executionEnvironmentContext, ALLOWED_PROXY_PATH_PREFIX, apiKey);
			this._registerProxyEvents(authId, port);
			this._registerShutdownHandlers();

			await this._proxyService.start(authId, port);

			return ActionResult.Builder.withData({ authId, port }).build();
		} catch (error) {
			return ActionResult.Builder.withErrors([error]).build();
		}
	}

	_validatePort(port) {
		if (Number.isNaN(port)) {
			throw this._getInvalidPortMessage();
		}

		if (port < PORT_RANGE.MIN || port > PORT_RANGE.MAX) {
			throw this._getInvalidPortMessage();
		}

		if (!this._validatePortAvailability(port)) {
			throw NodeTranslationService.getMessage(COMMAND_PROXY_START.ERRORS.PORT_ALREADY_IN_USE, port);
		}
	}

	_getInvalidPortMessage() {
		return NodeTranslationService.getMessage(COMMAND_PROXY_START.ERRORS.PORT_MUST_BE_NUMBER, PORT_RANGE.MIN, PORT_RANGE.MAX);
	}

	_validatePortAvailability(port) {
		// TODO PDPDEVTOOL-6392: validate if port is already in use before starting the proxy.
		return true;
	}

	_registerProxyEvents(authId, port) {
		// Dedicated handlers for events with custom behavior.
		this._proxyService.on(EVENTS.PROXY_ERROR.MANUAL_AUTH_REFRESH_REQUIRED, this._handleManualAuthRefreshRequired.bind(this));
		this._proxyService.on(EVENTS.SERVER_INFO.LISTENING, this._handleServerListening.bind(this, authId, port));
		this._proxyService.on(EVENTS.SERVER_INFO.STOPPED, this._handleServerStopped.bind(this));

		// Forward error events directly to CLI output.
		this._proxyService.on(EVENTS.PROXY_ERROR.DEFAULT, ({ message }) => this._log.error(message));
		this._proxyService.on(EVENTS.REQUEST_ERROR.PATH_NOT_ALLOWED, ({ message }) => this._log.error(message));
		this._proxyService.on(EVENTS.REQUEST_ERROR.UNAUTHORIZED, ({ message }) => this._log.error(message));
		this._proxyService.on(EVENTS.SERVER_ERROR.DEFAULT, ({ message }) => this._log.error(message));
		this._proxyService.on(EVENTS.SERVER_ERROR.ON_AUTH_REFRESH, ({ message }) => this._log.error(message));
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

	_handleServerListening(authId, port) {
		this._log.result(NodeTranslationService.getMessage(COMMAND_PROXY_START.MESSAGES.RUNNING_WITH_AUTH_ID, authId, port));
		this._log.info('');
		this._log.info(NodeTranslationService.getMessage(COMMAND_PROXY_START.MESSAGES.CONFIGURE_AGENT_HEADER));
		this._log.info(NodeTranslationService.getMessage(COMMAND_PROXY_START.MESSAGES.GUIDE_API_PROVIDER));
		this._log.info(NodeTranslationService.getMessage(COMMAND_PROXY_START.MESSAGES.GUIDE_BASE_URL, port));
		this._log.info(NodeTranslationService.getMessage(COMMAND_PROXY_START.MESSAGES.GUIDE_API_KEY));
		this._log.info(NodeTranslationService.getMessage(COMMAND_PROXY_START.MESSAGES.GUIDE_MODEL_ID));
		this._log.info('');
		this._log.info(NodeTranslationService.getMessage(COMMAND_PROXY_START.MESSAGES.STOP_INSTRUCTIONS));
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
					process.stdout.write('\n');
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
