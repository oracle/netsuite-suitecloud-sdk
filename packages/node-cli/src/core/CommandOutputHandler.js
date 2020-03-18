/*
** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const NodeUtils = require('./../utils/NodeUtils');
const { unwrapExceptionMessage, unwrapInformationMessage } = require('./../utils/ExceptionUtils');
const ActionResult = require('../commands/actionresult/ActionResult');

module.exports = class CommandOutputHandler {
	showSuccessResult(actionResult, formatOutputFunction) {
		// TODO assert(actionResult instanceof ActionResult);
		if (!formatOutputFunction) {
			this._defaultSuccessOutputFormat(actionResult);
		} else {
			formatOutputFunction(actionResult);
		}
	}

	showErrorResult(error) {
		NodeUtils.println(unwrapExceptionMessage(error), NodeUtils.COLORS.ERROR);

		const informativeMessage = unwrapInformationMessage(error);

		if (informativeMessage) {
			NodeUtils.println(`${NodeUtils.lineBreak}${informativeMessage}`, NodeUtils.COLORS.INFO);
		}
	}

	_defaultSuccessOutputFormat(actionResult) {
		NodeUtils.println(actionResult, NodeUtils.COLORS.RESULT);
	}
};
