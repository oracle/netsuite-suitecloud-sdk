/*
** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const NodeUtils = require('./NodeUtils');
const { ERROR } = require('../commands/actionresult/ActionResult');

module.exports = {
	getErrorMessagesString: actionResult => {
		const { error, resultMessage } = actionResult;
		if (Array.isArray(error) && error.length > 0) {
			if (resultMessage) {
				error.unshift(resultMessage);
			}
			return error.join(NodeUtils.lineBreak);
		}
		return resultMessage;
	},
	getResultMessage: actionResult => {
		const { resultMessage } = actionResult;
		return resultMessage ? resultMessage : '';
	},
	hasErrors: actionResult => {
		return actionResult.status === ERROR;
	},
	logErrors: error => {
		if (Array.isArray(error) && error.length > 0) {
			error.forEach(message => NodeUtils.println(message, NodeUtils.COLORS.ERROR));
		}
	},
	logResultMessage: actionResult => {
		if (actionResult.resultMessage) {
			if (actionResult.status === ERROR) {
				NodeUtils.println(actionResult.resultMessage, NodeUtils.COLORS.ERROR);
			}
			else {
				NodeUtils.println(actionResult.resultMessage, NodeUtils.COLORS.RESULT);
			}
		}
	},
};