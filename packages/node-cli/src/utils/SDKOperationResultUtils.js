/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const ActionResultUtils = require('./ActionResultUtils');
const NodeConsoleLogger = require('./NodeConsoleLogger');

module.exports = {
	SUCCESS: 'SUCCESS',
	ERROR: 'ERROR',

	getErrorMessagesString: operationResult => {
		const errorMessages = ActionResultUtils.collectErrorMessages(operationResult);
		return errorMessages.join(NodeConsoleLogger.lineBreak);
	},

	getResultMessage: operationResult => {
		const { resultMessage } = operationResult;
		return resultMessage ? resultMessage : '';
	},

	hasErrors: operationResult => {
		return operationResult.status === this.ERROR;
	},

	logErrors: operationResult => {
		const { errorMessages } = operationResult;
		if (Array.isArray(errorMessages) && errorMessages.length > 0) {
			errorMessages.forEach(message => NodeConsoleLogger.println(message, NodeConsoleLogger.COLORS.ERROR));
		}
	},

	logResultMessage: operationResult => {
		const { resultMessage } = operationResult;
		if (resultMessage) {
			if (operationResult.status === this.ERROR) {
				NodeConsoleLogger.println(resultMessage, NodeConsoleLogger.COLORS.ERROR);
			} else {
				NodeConsoleLogger.println(resultMessage, NodeConsoleLogger.COLORS.RESULT);
			}
		}
	},

	getErrorCode: operationResult => {
		const { errorCode } = operationResult;
		return errorCode ? errorCode : '';
	},
};
