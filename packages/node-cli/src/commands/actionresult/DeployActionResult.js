/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';
const { ActionResult, ActionResultBuilder } = require('./ActionResult');

class DeployActionResult extends ActionResult {

	constructor(parameters) {
		super(parameters);
		this._isServerValidation = parameters.isServerValidation ? true : false;
		this._appliedContentProtection = parameters.appliedContentProtection ? true : false
	}

	get isServerValidation() {
		return this._isServerValidation;
	}

	get appliedContentProtection() {
		return this._appliedContentProtection;
	}

	static get Builder() {
		return new DeployActionResultBuilder();
	}
}

class DeployActionResultBuilder extends ActionResultBuilder {
	constructor() {
		super();
	}

	withServerValidation(isServerValidation) {
		this.isServerValidation = isServerValidation;
		return this;
	}

	withAppliedContentProtection(appliedContentProtection) {
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
}

module.exports = DeployActionResult;