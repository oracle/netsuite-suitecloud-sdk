/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';
const assert = require('assert');
const ActionResult = require('./ActionResult');

class DeployActionResult extends ActionResult {

	constructor(build) {
		super(build)
		this._isServerValidation = build.isServerValidation ? true : false;
		this._appliedContentProtection = build.appliedContentProtection ? true : false
	}

	validateBuild(build) {
		assert(build);
		assert(build.status, "status is required when creating an ActionResult object.");
		if (build.status === ActionResult.SUCCESS) {
			assert(build.data, "data is required when ActionResult is a success.");
		}
		if (build.status === ActionResult.ERROR) {
			assert(build.errorMessages, "errorMessages is required when ActionResult is an error.");
		}
	}

	get isServerValidation() {
		return this._isServerValidation;
	}

	get appliedContentProtection() {
		return this._appliedContentProtection;
	}

	static get Builder() {
		return new class Builder {
			constructor() { }

			withSuccess() {
				this.status = ActionResult.SUCCESS;
				return this;
			}

			withError(errorMessages) {
				this.status = ActionResult.ERROR;
				this.errorMessages = errorMessages;
				return this;
			}

			withData(data) {
				this.data = data;
				return this;
			}

			withResultMessage(resultMessage) {
				this.resultMessage = resultMessage;
				return this;
			}

			isServerValidation(isServerValidation) {
				this.isServerValidation = isServerValidation;
				return this;
			}

			appliedContentProtection(appliedContentProtection) {
				this.appliedContentProtection = appliedContentProtection;
				return this;
			}

			build() {
				return new DeployActionResult({
					status: this.status,
					...(this.data && { data: this.data }),
					...(this.resultMessage && { resultMessage: this.resultMessage }),
					...(this.errorMessages && { errorMessages: this.errorMessages }),
					...(this.isServerValidation && { isServerValidation: this.isServerValidation }),
					...(this.appliedContentProtection && { appliedContentProtection: this.appliedContentProtection })
				});
			}
		};
	}
};

module.exports = DeployActionResult;