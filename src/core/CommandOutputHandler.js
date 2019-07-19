/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const NodeUtils = require('./../utils/NodeUtils');
const { unwrapExceptionMessage, unwrapInformationMessage } = require('./../utils/ExceptionUtils');

module.exports = class CommandOutputHandler {
	showSuccessResult(actionResult, formatOutputFunction) {
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
