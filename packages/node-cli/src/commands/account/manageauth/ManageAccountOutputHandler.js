/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const BaseOutputHandler = require('../../base/BaseOutputHandler');
const ActionResultUtils = require('../../../utils/ActionResultUtils');
const AccountCredentialsFormatter = require('../../../utils/AccountCredentialsFormatter');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const { MANAGE_ACTION } = require('../../../services/actionresult/ManageAccountActionResult');
const {
	COMMAND_MANAGE_ACCOUNT: { OUTPUT },
} = require('../../../services/TranslationKeys');

module.exports = class ManageAccountOutputFormatter extends BaseOutputHandler {
	constructor(consoleLogger) {
		super(consoleLogger);
	}

	parse(actionResult) {
		if (actionResult.resultMessage) {
			ActionResultUtils.logResultMessage(actionResult, this._log);
		}

		if (actionResult.actionExecuted === MANAGE_ACTION.INFO) {
			this._log.result(AccountCredentialsFormatter.getInfoString(actionResult.data));
		} else if (actionResult.actionExecuted === MANAGE_ACTION.LIST) {
			const authIds = Object.keys(actionResult.data);
			if (authIds.length === 0) {
				this._log.result(NodeTranslationService.getMessage(OUTPUT.NO_AUTHENTICATION_IDS));
			}
			authIds.forEach((authId) =>
				this._log.result(AccountCredentialsFormatter.getListItemString(authId, actionResult.data[authId]))
			);
		}
		return actionResult;
	}
};
