/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const ActionResultUtils = require('../../../utils/ActionResultUtils');
const BaseOutputHandler = require('../../base/BaseOutputHandler');

module.exports = class PackageOutputHandler extends BaseOutputHandler {
	constructor(options) {
		super(options);
	}

	parse(actionResult) {
		ActionResultUtils.logResultMessage(actionResult, this._log);
		return actionResult;
	}
};
