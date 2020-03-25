/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';
const { ActionResult, ActionResultBuilder } = require('./ActionResult');

class DeployActionResult extends ActionResult {

	constructor(build) {
		super(build)
		this._isServerValidation = build.isServerValidation ? true : false;
		this._appliedContentProtection = build.appliedContentProtection ? true : false
	}

	get isServerValidation() {
		return this._isServerValidation;
	}

	get appliedContentProtection() {
		return this._appliedContentProtection;
	}

	static get Builder() {
		return new DeployActioneResultBuilder();
	}
};

class DeployActioneResultBuilder extends ActionResultBuilder {
	constructor() {
		super();
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

module.exports = DeployActionResult;