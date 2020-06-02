/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const OutputFormatter = require('./OutputFormatter');
const ActionResultUtils = require('../../utils/ActionResultUtils');
const AccountCredentialsFormatter = require('../../utils/AccountCredentialsFormatter');
const { MANAGE_ACTION } = require('../actionresult/ManageAccountActionResult');

class ManageAccountOutputFormatter extends OutputFormatter {
	constructor(consoleLogger) {
		super(consoleLogger);
		this._accountCredentialsFormatter = new AccountCredentialsFormatter();
	}

	formatActionResult(actionResult) {
		if (actionResult.resultMessage) {
			ActionResultUtils.logResultMessage(actionResult, this.consoleLogger);
		}

		if (actionResult.actionExecuted == MANAGE_ACTION.INFO) {
			this.consoleLogger.result(this._accountCredentialsFormatter.getInfoString(actionResult.data));
		} else if (actionResult.actionExecuted == MANAGE_ACTION.LIST) {
			Object.keys(actionResult.data).forEach((authId) =>
				this.consoleLogger.result(this._accountCredentialsFormatter.getListItemString(authId, actionResult.data[authId]))
			);
		}
	}
}

module.exports = ManageAccountOutputFormatter;
