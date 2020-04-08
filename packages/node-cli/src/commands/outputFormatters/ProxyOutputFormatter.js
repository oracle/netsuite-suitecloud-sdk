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

class ProxyOutputFormatter extends OutputFormatter {
	constructor(consoleLogger) {
		super(consoleLogger);
	}

	formatActionResult(actionResult) {
		if (actionResult.isSettingProxy) {
			if (actionResult.isProxyOverridden) {
				this.consoleLogger.result(NodeTranslationService.getMessage(MESSAGES.PROXY_OVERRIDDEN, actionResult.proxyUrl));
			} else {
				this.consoleLogger.result(NodeTranslationService.getMessage(MESSAGES.SUCCESFULLY_SETUP, actionResult.proxyUrl));
			}
		} else {
			this.consoleLogger.result(NodeTranslationService.getMessage(MESSAGES.SUCCESFULLY_CLEARED));
		}
	}
}

module.exports = ProxyOutputFormatter;
