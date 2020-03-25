/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';
const assert = require('assert');
const ActionResult = require('./ActionResult');

class CreateProjectActionResult extends ActionResult {

	constructor(build) {
		super(build)
		this._projectType = build.projectType;
		this._projectDirectory = build.projectDirectory;
		this._includeUnitTesting = build.includeUnitTesting;
		this._npmInstallSuccess = build.npmInstallSuccess;
	}

	validateBuild(build) {
		super.validateBuild(build);
		if (build.status === ActionResult.SUCCESS) {
			assert(build.projectDirectory, "projectDirectory is required when ActionResult is a success.");
			assert(build.projectType, "projectType is required when ActionResult is a success.");
		}
	}

	get projectType() {
		return this._projectType;
	}

	get projectDirectory() {
		return this._projectDirectory;
	}

	get includeUnitTesting() {
		return this._includeUnitTesting;
	}

	get npmInstallSuccess() {
		return this._npmInstallSuccess;
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

			withProjectType(projectType) {
				this.projectType = projectType;
				return this;
			}

			fromDirectory(projectDirectory) {
				this.projectDirectory = projectDirectory;
				return this;
			}

			withUnitTesting(includeUnitTesting) {
				this.includeUnitTesting = includeUnitTesting;
				return this;
			}

			withSuccessfullNpmInstalled(npmInstallSuccess) {
				this.npmInstallSuccess = npmInstallSuccess;
				return this;
			}

			build() {
				return new CreateProjectActionResult({
					status: this.status,
					...(this.data && { data: this.data }),
					...(this.resultMessage && { resultMessage: this.resultMessage }),
					...(this.errorMessages && { errorMessages: this.errorMessages }),
					...(this.projectType && { projectType: this.projectType }),
					...(this.projectDirectory && { projectDirectory: this.projectDirectory }),
					...(this.includeUnitTesting && { includeUnitTesting: this.includeUnitTesting }),
					...(this.npmInstallSuccess && { npmInstallSuccess: this.npmInstallSuccess })
				});
			}
		};
	}
};

module.exports = CreateProjectActionResult;