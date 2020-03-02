/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const TranslationService = require('../services/TranslationService');
const {
	COMMAND_PROXY: { ARGS_VALIDATION, MESSAGES },
} = require('../services/TranslationKeys');
const NodeUtils = require('../utils/NodeUtils');
const CLISettingsService = require('../services/settings/CLISettingsService');
const ActionResultBuilder = require('../commands/actionresult/ActionResultBuilder');
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
				proxyCommandAction.proxyOverrided = setProxyResult.proxyOverrided;
			} else {
				this._CLISettingsService.clearProxy();
			}


			const proxyCommandData = await Promise.resolve(proxyCommandAction);
			const actionResultContext = {
				isSettingProxy: proxyCommandData.isSettingProxy,
				proxyUrl: proxyCommandData.proxyUrl,
				proxyOverrided: proxyCommandData.proxyOverrided
			};
			return new ActionResultBuilder().withSuccess(actionResultContext).build();
		} catch (error) {
			return new ActionResultBuilder().withError(error).build();
		}
	}

	_formatOutput(actionResult) {
		const actionResultContext = actionResult._context;
		if (actionResultContext.isSettingProxy) {
			if (actionResultContext.proxyOverrided) {
				NodeUtils.println(
					TranslationService.getMessage(MESSAGES.PROXY_OVERRIDDEN, actionResultContext.proxyUrl),
					NodeUtils.COLORS.RESULT
				);
			} else {
				NodeUtils.println(
					TranslationService.getMessage(
						MESSAGES.SUCCESFULLY_SETUP,
						actionResultContext.proxyUrl
					),
					NodeUtils.COLORS.RESULT
				);
			}
		} else {
			NodeUtils.println(
				TranslationService.getMessage(MESSAGES.SUCCESFULLY_CLEARED),
				NodeUtils.COLORS.RESULT
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
		return { proxyOverrided: proxyUrlIsDifferent };
	}
};
