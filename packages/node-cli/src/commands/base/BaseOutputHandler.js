/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';


module.exports = class BaseOutputHandler {
	constructor(options) {
		this._log = options.log;
	}

	parse(actionResult) {
		return actionResult;
	}

	parseError(actionResult) {
		if (actionResult.errorMessages && actionResult.errorMessages.length > 0) {
			for (let i =0; i<actionResult.errorMessages.length; i++) {
				this._log.error(actionResult.errorMessages[i]);
			}
		}
		return actionResult;
	}
};
