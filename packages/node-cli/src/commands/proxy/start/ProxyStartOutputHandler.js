/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const NodeTranslationService = require('../../../services/NodeTranslationService');
const BaseOutputHandler = require('../../base/BaseOutputHandler');
const { COMMAND_PROXY_START } = require('../../../services/TranslationKeys');

module.exports = class ProxyStartOutputHandler extends BaseOutputHandler {
	parse(actionResult) {
		if (actionResult?.data?.authId && actionResult?.data?.port) {
			this._log.result(NodeTranslationService.getMessage(COMMAND_PROXY_START.MESSAGES.RUNNING_WITH_AUTH_ID, actionResult.data.authId, actionResult.data.port));
			this._log.result('');
			this._log.result(NodeTranslationService.getMessage(COMMAND_PROXY_START.MESSAGES.CONFIGURE_AGENT_HEADER));
			this._log.result(NodeTranslationService.getMessage(COMMAND_PROXY_START.MESSAGES.GUIDE_API_PROVIDER));
			this._log.result(NodeTranslationService.getMessage(COMMAND_PROXY_START.MESSAGES.GUIDE_BASE_URL, actionResult.data.port));
			this._log.result(NodeTranslationService.getMessage(COMMAND_PROXY_START.MESSAGES.GUIDE_API_KEY));
			this._log.result(NodeTranslationService.getMessage(COMMAND_PROXY_START.MESSAGES.GUIDE_MODEL_ID));
			this._log.result('');
			this._log.result(NodeTranslationService.getMessage(COMMAND_PROXY_START.MESSAGES.STOP_INSTRUCTIONS));
			this._log.result('');
		}
		return actionResult;
	}
};
