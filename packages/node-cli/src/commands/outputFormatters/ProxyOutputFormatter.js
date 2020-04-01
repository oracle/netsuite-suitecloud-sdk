/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const OutputFormatter = require('./OutputFormatter');
const NodeTranslationService = require('../../services/NodeTranslationService');
const {
	COMMAND_PROXY: { MESSAGES },
} = require('../../services/TranslationKeys');
const { COLORS } = require('../../loggers/LoggerConstants');

class ProxyOutputFormatter extends OutputFormatter {
	constructor(consoleLogger) {
		super(consoleLogger);
	}

	formatActionResult(actionResult) {
		if (actionResult.withSettingProxy) {
			if (actionResult.proxyOverridden) {
				this.consoleLogger.println(
					NodeTranslationService.getMessage(MESSAGES.PROXY_OVERRIDDEN, actionResult.proxyUrl),
					COLORS.RESULT
				);
			} else {
				this.consoleLogger.println(
					NodeTranslationService.getMessage(MESSAGES.SUCCESFULLY_SETUP, actionResult.proxyUrl),
					COLORS.RESULT
				);
			}
		} else {
			this.consoleLogger.println(NodeTranslationService.getMessage(MESSAGES.SUCCESFULLY_CLEARED), COLORS.RESULT);
		}
	}
}

module.exports = ProxyOutputFormatter;
