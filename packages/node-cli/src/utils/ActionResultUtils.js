/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const NodeConsoleLogger = require('./NodeConsoleLogger');
const { ERROR } = require('../commands/actionresult/ActionResult');

module.exports = {
	getErrorMessagesString: actionResult => {
		return actionResult.errorMessages.join(NodeConsoleLogger.lineBreak);
	},

	getResultMessage: actionResult => {
		const { resultMessage } = actionResult;
		return resultMessage ? resultMessage : '';
	},

	logErrors: errors => {
		errors.forEach(message => NodeConsoleLogger.println(message, NodeConsoleLogger.COLORS.ERROR));
	},

	logResultMessage: actionResult => {
		if (actionResult.resultMessage) {
			if (actionResult.status === ERROR) {
				NodeConsoleLogger.println(actionResult.resultMessage, NodeConsoleLogger.COLORS.ERROR);
			} else {
				NodeConsoleLogger.println(actionResult.resultMessage, NodeConsoleLogger.COLORS.RESULT);
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
