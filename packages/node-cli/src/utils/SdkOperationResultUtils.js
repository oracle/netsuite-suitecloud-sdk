/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

module.exports = {
	STATUS: {
		SUCCESS: 'SUCCESS',
		ERROR: 'ERROR',
	},

	getResultMessage: (operationResult) => {
		const { resultMessage } = operationResult;
		return resultMessage ? resultMessage : '';
	},

	// TODO: fix operationResult in SDK to always return errors in errorMessage and never in resultMessage
	collectErrorMessages: (operationResult) => {
		const { errorMessages, resultMessage } = operationResult;
		if (Array.isArray(errorMessages)) {
			if (resultMessage) {
				errorMessages.unshift(resultMessage);
			}
			return errorMessages;
		} else {
			return [resultMessage];
		}
	},
};
