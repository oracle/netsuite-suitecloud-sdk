/*
** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const ProxyActionResult = require('../commands/actionresult/ProxyActionResult');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const TranslationService = require('../services/TranslationService');
const {
	COMMAND_PROXY: { ARGS_VALIDATION, MESSAGES },
} = require('../services/TranslationKeys');
const NodeConsoleLogger = require('../utils/NodeConsoleLogger');
const CLISettingsService = require('../services/settings/CLISettingsService');
const url = require('url');

const SET_OPTION = 'set';
const CLEAR_FLAG_OPTION = 'clear';

module.exports = class ProxyCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._CLISettingsService = new CLISettingsService();
	}

	async _executeAction(args) {
		try {
			const proxyUrlArgument = args[SET_OPTION];
			const shouldClearArgument = args[CLEAR_FLAG_OPTION];

			this._validateArguments(proxyUrlArgument, shouldClearArgument);
			const isSettingProxy = !!proxyUrlArgument;

			const proxyCommandAction = {
				isSettingProxy: isSettingProxy,
				proxyUrl: proxyUrlArgument,
			};
			if (isSettingProxy) {
				this._validateProxyUrl(proxyUrlArgument);
				const setProxyResult = this._setProxy(proxyUrlArgument);
				proxyCommandAction.proxyOverrided = setProxyResult.proxyOverridden;
			} else {
				this._CLISettingsService.clearProxy();
			}

			const proxyCommandData = await Promise.resolve(proxyCommandAction);
			return ProxyActionResult.Builder
				.success()
				.withSettingProxy(proxyCommandData.withSettingProxy)
				.withProxyUrl(proxyCommandData.proxyUrl)
				.isProxyOverridden(proxyCommandData.proxyOverridden)
				.build();
		} catch (error) {
			return ProxyActionResult.Builder.withErrors([error]).build();
		}
	}

	_formatOutput(actionResult) {
		if (actionResult.withSettingProxy) {
			if (actionResult.proxyOverridden) {
				NodeConsoleLogger.println(
					TranslationService.getMessage(MESSAGES.PROXY_OVERRIDDEN, actionResult.proxyUrl),
					NodeConsoleLogger.COLORS.RESULT
				);
			} else {
				NodeConsoleLogger.println(
					TranslationService.getMessage(
						MESSAGES.SUCCESFULLY_SETUP,
						actionResult.proxyUrl
					),
					NodeConsoleLogger.COLORS.RESULT
				);
			}
		} else {
			NodeConsoleLogger.println(
				TranslationService.getMessage(MESSAGES.SUCCESFULLY_CLEARED),
				NodeConsoleLogger.COLORS.RESULT
			);
		}
	}

	_validateArguments(proxyUrlArgument, shouldClearArgument) {
		if (!proxyUrlArgument && !shouldClearArgument) {
			throw TranslationService.getMessage(ARGS_VALIDATION.SET_CLEAR_NEITHER_SPECIFIED);
		}
		if (proxyUrlArgument && shouldClearArgument) {
			throw TranslationService.getMessage(ARGS_VALIDATION.SET_CLEAR_BOTH_SPECIFIED);
		}
	}

	_validateProxyUrl(proxyUrlArgument) {
		const proxyUrl = url.parse(proxyUrlArgument);
		if (!proxyUrl.protocol || !proxyUrl.port || !proxyUrl.hostname) {
			throw TranslationService.getMessage(ARGS_VALIDATION.PROXY_URL);
		}
	}

	_setProxy(proxyUrl) {
		const proxyUrlIsDifferent = this._CLISettingsService.getProxyUrl() !== proxyUrl;
		this._CLISettingsService.setProxyUrl(proxyUrl);
		return { proxyOverridden: proxyUrlIsDifferent };
	}
};
