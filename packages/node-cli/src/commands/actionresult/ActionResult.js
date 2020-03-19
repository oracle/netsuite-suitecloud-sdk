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
		this._error = build.error;
	}

	validateBuild(build) {
		assert(build);
		assert(build.status, "status is required when creating an ActionResult object.");
		if (build.status === SUCCESS) {
			assert(build.data, "data is required when ActionResult is a success.");
		}
		if (build.status === ERROR) {
			assert(build.error, "error is required when ActionResult is an error.");
		}
	}

	get status() {
		return this._status;
	}

	get error() {
		return this._error;
	}

	get data() {
		return this._data;
	}

	get resultMessage() {
		return this._resultMessage;
	}

	static get Builder() {
		return new class Builder {
			constructor() { }

			withSuccess() {
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

			withError(error) {
				this.status = ERROR;
				this.error = error;
				return this;
			}

			build() {
				return new ActionResult({
					status: this.status,
					...(this.data && { data: this.data }),
					...(this.resultMessage && { resultMessage: this.resultMessage }),
					...(this.error && { error: this.error }),
				});
			}
		};
	}

	static get SUCCESS() {
		return SUCCESS;
	}

	static get ERROR() {
		return ERROR;
	}
};

module.exports = ActionResult;