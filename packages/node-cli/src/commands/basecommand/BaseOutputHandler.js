/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { lineBreak } = require('../../loggers/LoggerConstants');
const { unwrapExceptionMessage, unwrapInformationMessage } = require('../../utils/ExceptionUtils');

module.exports = class BaseOutputHandler {
	constructor(options) {
		this._log = options.log;
	}

	formatActionResult(actionResult) {
		// Do nothing
	}

	formatError(error) {
		let errorMessage = unwrapExceptionMessage(error);
		this._log.error(errorMessage);
		const informativeMessage = unwrapInformationMessage(error);

		if (informativeMessage) {
			this._log.info(`${lineBreak}${informativeMessage}`);
			errorMessage += lineBreak + informativeMessage;
		}
		return errorMessage;
	}
};
