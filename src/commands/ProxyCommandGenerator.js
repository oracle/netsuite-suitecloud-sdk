'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const TranslationService = require('../services/TranslationService');
const UserPreferencesService = require('../services/userpreferences/UserPreferencesService');
const UserPreferences = require('../services/userpreferences/UserPreferences');
const url = require('url');

const {
	COMMAND_SDK_WRAPPER: { MESSAGES },
} = require('../services/TranslationKeys');

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
			console.log('WARNING: Preferences will be overrided');
		}
		if (actionResult.isSettingProxy) {
			console.log('Proxy successfully setup');
		} else {
			console.log('Proxy successfully cleared');
		}
	}

	_validateArguments(proxyUrlArgument, shouldClearArgument) {
		if (!proxyUrlArgument && !shouldClearArgument) {
			throw 'Please specify set or clear';
		}
		if (proxyUrlArgument && shouldClearArgument) {
			throw 'Cannot clear and set at the same time.';
		}
	}

	_validateProxyUrl(proxyUrlArgument) {
		const proxyUrl = url.parse(proxyUrlArgument);
		if (!proxyUrl.protocol || !proxyUrl.port || !proxyUrl.hostname) {
			throw 'Proxy needs a protocol (http) a port and a hostname';
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
