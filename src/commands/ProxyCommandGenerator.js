'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const TranslationService = require('../services/TranslationService');
const { COMMAND_PROXY: {ARGS_VALIDATION, MESSAGES} } = require('../services/TranslationKeys');
const NodeUtils = require('../utils/NodeUtils');
const UserPreferencesService = require('../services/userpreferences/UserPreferencesService');
const UserPreferences = require('../services/userpreferences/UserPreferences');
const url = require('url');

const SET_OPTION = 'set';
const CLEAR_FLAG_OPTION = 'clear';

module.exports = class ProxyCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._userPreferencesService = new UserPreferencesService();
	}

	_supportsInteractiveMode() {
		return false;
	}

	_executeAction(args) {
		const proxyUrlArgument = args[SET_OPTION];
		const shouldClearArgument = args[CLEAR_FLAG_OPTION];

		this._validateArguments(proxyUrlArgument, shouldClearArgument);
		const isSettingProxy = !!proxyUrlArgument;

		const actionResult = {
			isSettingProxy: isSettingProxy,
			proxyUrl: proxyUrlArgument,
		};
		if (isSettingProxy) {
			this._validateProxyUrl(proxyUrlArgument);
			const setProxyResult = this._setProxy(proxyUrlArgument);
			actionResult.proxyOverrided = setProxyResult.proxyOverrided;
		} else {
			this._clearProxy();
		}

		return Promise.resolve(actionResult);
	}

	_formatOutput(actionResult) {
		if (actionResult.proxyOverrided) {
			NodeUtils.println(TranslationService.getMessage(MESSAGES.PROXY_OVERRIDDEN), NodeUtils.COLORS.WARNING);
		}
		if (actionResult.isSettingProxy) {
			NodeUtils.println(TranslationService.getMessage(MESSAGES.SUCCESFULLY_SETUP, actionResult.proxyUrl), NodeUtils.COLORS.RESULT);
		} else {
			NodeUtils.println(TranslationService.getMessage(MESSAGES.SUCCESFULLY_CLEARED), NodeUtils.COLORS.RESULT);
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
        const existingUserPreferences = this._userPreferencesService.getUserPreferences();
        const alreadyHasProxySetup = existingUserPreferences.useProxy;
		this._userPreferencesService.setUserPreferences(
			new UserPreferences({
				useProxy: true,
				proxyUrl: proxyUrl,
			})
		);
		return { proxyOverrided: alreadyHasProxySetup };
	}

	_clearProxy() {
		this._userPreferencesService.clearUserPreferences();
	}
};
