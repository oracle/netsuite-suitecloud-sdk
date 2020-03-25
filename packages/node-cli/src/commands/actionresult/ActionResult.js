/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';
const assert = require('assert');

const ERROR = "ERROR";
const SUCCESS = "SUCCESS";

class ActionResult {

	constructor(build) {
		this.validateBuild(build);

		this._status = build.status;
		this._data = build.data;
		this._resultMessage = build.resultMessage;
		this._errorMessages = build.errorMessages;
	}

	validateBuild(build) {
		assert(build);
		assert(build.status, "status is required when creating an ActionResult object.");
		if (build.status === SUCCESS) {
			assert(build.data, "data is required when ActionResult is a success.");
		}
		if (build.status === ERROR) {
			assert(build.errorMessages, "errorMessages is required when ActionResult is an error.");
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
};


class ActionResultBuilder {
	constructor() { }


	success() {
		this.status = SUCCESS;
		return this;
	}

	withResultMessage(resultMessage) {
		this.resultMessage = resultMessage;
		return this;
	}

	withData(data) {
		this.data = data;
		return this;
	}

	error(errorMessages) {
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