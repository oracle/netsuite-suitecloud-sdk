/*
** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';
const assert = require('assert');

const ERROR = "ERROR";
const SUCCESS = "SUCCESS";

class ActionResult {

	constructor(parameters) {
		this.validateParameters(parameters);

		this._status = parameters.status;
		this._data = parameters.data;
		this._resultMessage = parameters.resultMessage;
		this._errorMessages = parameters.errorMessages;
	}

	validateParameters(parameters) {
		assert(parameters);
		assert(parameters.status, "status is required when creating an ActionResult object.");
		if (parameters.status === SUCCESS) {
			assert(parameters.data, "data is required when ActionResult is a success.");
		}
		if (parameters.status === ERROR) {
			assert(parameters.errorMessages, "errorMessages is required when ActionResult is an error.");
			assert(Array.isArray(parameters.errorMessages), 'errorMessages argument must be an array');
		}
	}

	get status() {
		return this._status;
	}

	get errorMessages() {
		return this._errorMessages;
	}

	get data() {
		return this._data;
	}

	get resultMessage() {
		return this._resultMessage;
	}

	static get Builder() {
		return new ActionResultBuilder();
	}

	static get SUCCESS() {
		return SUCCESS;
	}

	static get ERROR() {
		return ERROR;
	}
}

class ActionResultBuilder {
	constructor() { }

	withResultMessage(resultMessage) {
		this.resultMessage = resultMessage;
		return this;
	}

	withData(data) {
		this.status = SUCCESS;
		this.data = data;
		return this;
	}

	withErrors(errorMessages) {
		this.status = ERROR;
		this.errorMessages = errorMessages;
		return this;
	}

	build() {
		return new ActionResult({
			status: this.status,
			...(this.data && { data: this.data }),
			...(this.resultMessage && { resultMessage: this.resultMessage }),
			...(this.errorMessages && { errorMessages: this.errorMessages }),
		});
	}
}

module.exports.ActionResult = ActionResult;
module.exports.ActionResultBuilder = ActionResultBuilder;