/*
** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const ActionResultUtils = require('./ActionResultUtils');
const NodeUtils = require('./NodeUtils');

module.exports = {

	SUCCESS: "SUCCESS",
	ERROR: "ERROR",

	getErrorMessagesString: operationResult => {
		const errorMessages = ActionResultUtils.collectErrorMessages(operationResult);
		return errorMessages.join(NodeUtils.lineBreak);
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
			errorMessages.forEach(message => NodeUtils.println(message, NodeUtils.COLORS.ERROR));
		}
	},

	logResultMessage: operationResult => {
		const { resultMessage } = operationResult;
		if (resultMessage) {
			if (operationResult.status === this.ERROR) {
				NodeUtils.println(resultMessage, NodeUtils.COLORS.ERROR);
			} else {
				NodeUtils.println(resultMessage, NodeUtils.COLORS.RESULT);
			}
		}
	},

	getErrorCode: operationResult => {
		const { errorCode } = operationResult;
		return errorCode ? errorCode : '';
	},
};