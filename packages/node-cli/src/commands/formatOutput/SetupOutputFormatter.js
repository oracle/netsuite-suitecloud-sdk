/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const OutputFormatter = require('./OutputFormatter');
const TranslationService = require('../../services/TranslationService');

const {
	COMMAND_SETUPACCOUNT: { OUTPUT },
} = require('../../services/TranslationKeys');

const AUTH_MODE = {
	OAUTH: 'OAUTH',
	SAVE_TOKEN: 'SAVE_TOKEN',
	REUSE: 'REUSE',
};

class SetupOutputFormatter extends OutputFormatter {
	constructor(consoleLogger) {
		super(consoleLogger);
	}

	formatOutput(actionResult) {
		let resultMessage;
		switch (actionResult.mode) {
			case AUTH_MODE.OAUTH:
				resultMessage = TranslationService.getMessage(
					OUTPUT.NEW_OAUTH,
					actionResult.accountInfo.companyName,
					actionResult.accountInfo.roleName,
					actionResult.authId
				);
				break;
			case AUTH_MODE.SAVE_TOKEN:
				resultMessage = TranslationService.getMessage(
					OUTPUT.NEW_SAVED_TOKEN,
					actionResult.accountInfo.companyName,
					actionResult.accountInfo.roleName,
					actionResult.authId
				);
				break;
			case AUTH_MODE.REUSE:
				resultMessage = TranslationService.getMessage(
					OUTPUT.REUSED_AUTH_ID,
					actionResult.authId,
					actionResult.accountInfo.companyName,
					actionResult.accountInfo.roleName
				);
				break;
			default:
				break;
		}

		this.consoleLogger.println(resultMessage, this.consoleLogger.COLORS.RESULT);
		this.consoleLogger.println(TranslationService.getMessage(OUTPUT.SUCCESSFUL), this.consoleLogger.COLORS.RESULT);
	}
}

module.exports = SetupOutputFormatter;
