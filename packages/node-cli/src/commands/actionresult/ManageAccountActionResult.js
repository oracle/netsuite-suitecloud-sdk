/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const assert = require('assert');
const { ActionResult, ActionResultBuilder } = require('./ActionResult');

const STATUS = {
	ERROR: 'ERROR',
	SUCCESS: 'SUCCESS',
};

class ManageAccountActionResult extends ActionResult {
	constructor(parameters) {
		super(parameters);
		this._actionExecuted = parameters.actionExecuted;
	}

	validateParameters(parameters) {
		assert(parameters);
		assert(parameters.status, 'status is required when creating an ActionResult object.');
		if (parameters.status === STATUS.SUCCESS) {
			assert(parameters.actionExecuted);
		}
		if (parameters.status === STATUS.ERROR) {
			assert(parameters.errorMessages, 'errorMessages is required when ActionResult is an error.');
			assert(Array.isArray(parameters.errorMessages), 'errorMessages argument must be an array');
		}
	}

	get actionExecuted() {
		return this._actionExecuted;
	}

	static get Builder() {
		return new ManageAccountActionResultBuilder();
	}
}

class ManageAccountActionResultBuilder extends ActionResultBuilder {
	constructor() {
		super();
	}

	withActionExecuted(actionExecuted) {
		this.actionExecuted = actionExecuted;
		return this;
	}

	build() {
		return new ManageAccountActionResult({
			status: this.status,
			...(this.data && { data: this.data }),
			...(this.resultMessage && { resultMessage: this.resultMessage }),
			...(this.errorMessages && { errorMessages: this.errorMessages }),
			...(this.actionExecuted && { actionExecuted: this.actionExecuted }),
		});
	}
}

module.exports.ManageAccountActionResult = ManageAccountActionResult;
module.exports.ManageAccountActionResultBuilder = ManageAccountActionResultBuilder;
