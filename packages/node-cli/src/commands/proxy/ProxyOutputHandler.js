/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const BaseOutputHandler = require('../basecommand/BaseOutputHandler');
const NodeTranslationService = require('../../services/NodeTranslationService');
const {
	COMMAND_PROXY: { MESSAGES },
} = require('../../services/TranslationKeys');

module.exports = class ProxyOutputHandler extends BaseOutputHandler {
	constructor(options) {
		super(options);
	}

	formatActionResult(actionResult) {
		if (actionResult.isSettingProxy) {
			if (actionResult.isProxyOverridden) {
				this._log.result(NodeTranslationService.getMessage(MESSAGES.PROXY_OVERRIDDEN, actionResult.proxyUrl));
			} else {
				this._log.result(NodeTranslationService.getMessage(MESSAGES.SUCCESFULLY_SETUP, actionResult.proxyUrl));
			}
		} else {
			this._log.result(NodeTranslationService.getMessage(MESSAGES.SUCCESFULLY_CLEARED));
		}
	}
}

