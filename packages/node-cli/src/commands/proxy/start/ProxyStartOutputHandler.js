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
			this._log.result(NodeTranslationService.getMessage(COMMAND_PROXY_START.MESSAGES.STARTED, actionResult.data.authId, actionResult.data.port));
		}
		return actionResult;
	}
};
