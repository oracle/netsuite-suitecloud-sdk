/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const { ActionResult, ActionResultBuilder } = require('./ActionResult');

class DeployActionResult extends ActionResult {
	constructor(parameters) {
		super(parameters);
		this._isServerValidation = !!parameters.isServerValidation;
		this._appliedInstallationPreferences = !!parameters.appliedInstallationPreferences;
		this._projectType = parameters.projectType;
	}

	get isServerValidation() {
		return this._isServerValidation;
	}

	get appliedInstallationPreferences() {
		return this._appliedInstallationPreferences;
	}

	get projectType() {
		return this._projectType;
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

	withAppliedInstallationPreferences(appliedInstallationPreferences) {
		this.appliedInstallationPreferences = appliedInstallationPreferences;
		return this;
	}

	withProjectType(projectType) {
		this.projectType = projectType;
		return this;
	}

	build() {
		return new DeployActionResult({
			status: this.status,
			...(this.data && { data: this.data }),
			...(this.resultMessage && { resultMessage: this.resultMessage }),
			...(this.errorMessages && { errorMessages: this.errorMessages }),
			...(this.isServerValidation && { isServerValidation: this.isServerValidation }),
			...(this.appliedInstallationPreferences && { appliedInstallationPreferences: this.appliedInstallationPreferences }),
			...(this.projectType && { projectType: this.projectType }),
			...(this.projectFolder && { projectFolder: this.projectFolder }),
			...(this.commandParameters && { commandParameters: this.commandParameters }),
			...(this.commandFlags && { commandFlags: this.commandFlags }),
		});
	}
}

module.exports = DeployActionResult;
