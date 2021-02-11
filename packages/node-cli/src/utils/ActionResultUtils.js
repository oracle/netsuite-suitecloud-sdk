/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { lineBreak } = require('../loggers/LoggerConstants');

module.exports = {
	getErrorMessagesString: actionResult => {
		return actionResult.errorMessages.join(lineBreak);
	},

	logResultMessage: (actionResult, log) => {
		if (actionResult.resultMessage) {
			log.result(actionResult.resultMessage);
		}
	},
};
