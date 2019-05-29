'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const executeWithSpinner = require('../ui/CliSpinner').executeWithSpinner;
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
		this._validateProxyUrl(proxyUrlArgument);

		const willExistingPreferencesBeOverrided = this._userPreferencesService.doesUserHavePreferencesSet();
		if (willExistingPreferencesBeOverrided) {
			console.log('Preferences will be overrided');
		}

		this._userPreferencesService.setUserPreferences(
			new UserPreferences({
				proxyUrl: proxyUrlArgument,
			})
		);

		return executeWithSpinner({
			action: Promise.resolve('Hello World'),
			message: TranslationService.getMessage(
				MESSAGES.EXECUTING_COMMAND,
				this._commandMetadata.name
			),
		});
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
};
