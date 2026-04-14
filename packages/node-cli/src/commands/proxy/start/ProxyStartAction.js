/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ActionResult } = require('../../../services/actionresult/ActionResult');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const { executeWithSpinner } = require('../../../ui/CliSpinner');
const SdkExecutionContext = require('../../../SdkExecutionContext');
const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');
const BaseAction = require('../../base/BaseAction');
const { SuiteCloudAuthProxyService, EVENTS } = require('../../../services/SuiteCloudAuthProxyService');
const { COMMAND_PROXY_START, COMMAND_REFRESH_AUTHORIZATION } = require('../../../services/TranslationKeys');
const { refreshAuthorization } = require('../../../utils/AuthenticationUtils');
const ProxyApiKeyExtractor = require('./ProxyApiKeyExtractor');

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

const READ_CLIENT_API_CONTENT_CLI_COMMAND = 'readsdaapikeycontent';

module.exports = class ProxyStartAction extends BaseAction {
	constructor(options) {
		super(options);
		this._proxyService = null;
		this._manualRefreshInFlight = null;
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

			const { apiKey } = await this._readClientAPIContents();

			this._proxyService = new SuiteCloudAuthProxyService(this._sdkPath, this._executionEnvironmentContext, undefined, apiKey);
			this._registerProxyEvents();
			this._registerShutdownHandlers();

			await this._proxyService.start(authId, port);

			return ActionResult.Builder.withData({ authId, port }).build();
		} catch (error) {
			return ActionResult.Builder.withErrors([error]).build();
		}
	}

	_validatePort(port) {
		if (Number.isNaN(port)) {
			throw NodeTranslationService.getMessage(COMMAND_PROXY_START.ERRORS.PORT_MUST_BE_NUMBER);
		}

		if (port < PORT_RANGE.MIN || port > PORT_RANGE.MAX) {
			throw NodeTranslationService.getMessage(COMMAND_PROXY_START.ERRORS.PORT_OUT_OF_RANGE, PORT_RANGE.MIN, PORT_RANGE.MAX);
		}

		if (!this._validatePortAvailability(port)) {
			throw NodeTranslationService.getMessage(COMMAND_PROXY_START.ERRORS.PORT_ALREADY_IN_USE, port);
		}
	}

	_validatePortAvailability(port) {
		// TODO PDPDEVTOOL-6392: validate if port is already in use before starting the proxy.
		return true;
	}

	async _readClientAPIContents() {
		const executionContext = SdkExecutionContext.Builder.forCommand(READ_CLIENT_API_CONTENT_CLI_COMMAND)
			.integration()
			.addFlags([])
			.build();

		const operationResult = await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: NodeTranslationService.getMessage(COMMAND_PROXY_START.MESSAGES.READING_CLIENT_API_CONTENTS),
		});

		if (operationResult.errorMessages && operationResult.errorMessages.length > 0) {
			throw operationResult.errorMessages;
		}

		if (operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS) {
			return ProxyApiKeyExtractor.extractApiKey(operationResult.data);
		}

		throw NodeTranslationService.getMessage(COMMAND_PROXY_START.ERRORS.READING_CLIENT_API_CONTENTS);
	}

	_registerProxyEvents() {
		this._proxyService.on(EVENTS.PROXY_ERROR.DEFAULT, ({ message }) => this._log.error(message));
		this._proxyService.on(EVENTS.PROXY_ERROR.MANUAL_AUTH_REFRESH_REQUIRED, this._handleManualAuthRefreshRequired.bind(this));
		this._proxyService.on(EVENTS.REQUEST_ERROR.PATH_NOT_ALLOWED, ({ message }) => this._log.error(message));
		this._proxyService.on(EVENTS.REQUEST_ERROR.UNAUTHORIZED, ({ message }) => this._log.error(message));
		this._proxyService.on(EVENTS.SERVER_ERROR.DEFAULT, ({ message }) => this._log.error(message));
		this._proxyService.on(EVENTS.SERVER_ERROR.ON_AUTH_REFRESH, ({ message }) => this._log.error(message));
	}

	async _handleManualAuthRefreshRequired({ message, authId }) {
		this._log.error(message);
		if (this._manualRefreshInFlight) {
			await this._manualRefreshInFlight;
			return;
		}

		this._manualRefreshInFlight = (async () => {
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

	_registerShutdownHandlers() {
		const stopProxy = async () => {
			if (this._proxyService) {
				await this._proxyService.stop();
			}
		};

		process.on('SIGINT', stopProxy);
		process.on('SIGTERM', stopProxy);
	}
};
