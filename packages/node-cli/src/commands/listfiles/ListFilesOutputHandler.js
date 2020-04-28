/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const BaseOutputHandler = require('../basecommand/BaseOutputHandler');
const ActionResultUtils = require('../../utils/ActionResultUtils');

module.exports = class ListFilesOutputHandler extends BaseOutputHandler {
	constructor(options) {
		super(options);
	}

	formatActionResult(actionResult) {
		ActionResultUtils.logResultMessage(actionResult, this._log);

		if (Array.isArray(actionResult.data)) {
			actionResult.data.forEach(fileName => {
				this.lo_logg.result(fileName);
			});
		}
	}
}
