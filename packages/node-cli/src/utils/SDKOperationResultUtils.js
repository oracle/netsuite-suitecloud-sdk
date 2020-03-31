/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const ActionResultUtils = require('./ActionResultUtils');
const { COLORS, lineBreak } = require('../loggers/LoggerConstants');

module.exports = {
	SUCCESS: 'SUCCESS',
	ERROR: 'ERROR',

	getErrorMessagesString: operationResult => {
		const errorMessages = ActionResultUtils.collectErrorMessages(operationResult);
		return errorMessages.join(lineBreak);
	},

	getResultMessage: operationResult => {
		const { resultMessage } = operationResult;
		return resultMessage ? resultMessage : '';
	},

	hasErrors: operationResult => {
		return operationResult.status === this.ERROR;
	},

	logResultMessage: (operationResult, consoleLogger) => {
		const { resultMessage } = operationResult;
		if (resultMessage) {
			if (operationResult.status === this.ERROR) {
				consoleLogger.println(resultMessage, COLORS.ERROR);
			} else {
				consoleLogger.println(resultMessage, COLORS.RESULT);
			}
		}
	},

	getErrorCode: operationResult => {
		const { errorCode } = operationResult;
		return errorCode ? errorCode : '';
	},
};
