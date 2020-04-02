/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ERROR } = require('../commands/actionresult/ActionResult');
const { lineBreak } = require('../loggers/LoggerConstants');


module.exports = {
	getErrorMessagesString: actionResult => {
		return actionResult.errorMessages.join(lineBreak);
	},

	logResultMessage: (actionResult, consoleLogger) => {
		if (actionResult.resultMessage) {
			if (actionResult.status === ERROR) {
				consoleLogger.error(actionResult.resultMessage);
			} else {
				consoleLogger.result(actionResult.resultMessage);
			}
		}
	},

	// TODO: fix operationResult in SDK to always return errors in errorMessage and never in resultMessage
	collectErrorMessages: operationResult => {
		let errors = [];
		const { errorMessages, resultMessage } = operationResult;
		if (Array.isArray(errorMessages)) {
			if (resultMessage) {
				errorMessages.unshift(resultMessage);
			}
			errors = errorMessages;
		} else {
			errors = [...(resultMessage && resultMessage), ...(errorMessages && errorMessages)];
		}
		return errors;
	},
};
