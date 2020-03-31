/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const NodeConsoleLogger = require('../loggers/NodeConsoleLogger');
const { lineBreak } = require('../loggers/ConsoleLogger');
const { unwrapExceptionMessage, unwrapInformationMessage } = require('./../utils/ExceptionUtils');

module.exports = class CommandOutputHandler {
	showSuccessResult(actionResult, formatOutputFunction) {
		formatOutputFunction(actionResult);
	}

	showErrorResult(error) {
		NodeConsoleLogger.println(unwrapExceptionMessage(error), NodeConsoleLogger.COLORS.ERROR);

		const informativeMessage = unwrapInformationMessage(error);

		if (informativeMessage) {
			NodeConsoleLogger.println(`${lineBreak}${informativeMessage}`, NodeConsoleLogger.COLORS.INFO);
		}
	}
};
