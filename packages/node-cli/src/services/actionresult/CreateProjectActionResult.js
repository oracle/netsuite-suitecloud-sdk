/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const assert = require('assert');
const { ActionResult, ActionResultBuilder } = require('./ActionResult');

class CreateProjectActionResult extends ActionResult {
	constructor(parameters) {
		super(parameters);
		this._projectType = parameters.projectType;
		this._projectName = parameters.projectName;
		this._projectDirectory = parameters.projectDirectory;
		this._includeUnitTesting = parameters.includeUnitTesting;
		this._npmPackageInitialized = parameters.npmPackageInitialized;
	}

	validateParameters(parameters) {
		super.validateParameters(parameters);
		if (this.isSuccess()) {
			assert(parameters.projectDirectory, 'projectDirectory is required when ActionResult is a success.');
			assert(parameters.projectType, 'projectType is required when ActionResult is a success.');
		}
	}

	get projectType() {
		return this._projectType;
	}

	get projectName() {
		return this._projectName;
	}

	get projectDirectory() {
		return this._projectDirectory;
	}

	get includeUnitTesting() {
		return this._includeUnitTesting;
	}

	get npmPackageInitialized() {
		return this._npmPackageInitialized;
	}

	static get Builder() {
		return new CreateProjectActionResultBuilder();
	}
}

class CreateProjectActionResultBuilder extends ActionResultBuilder {
	constructor() {
		super();
	}

	withProjectType(projectType) {
		this.projectType = projectType;
		return this;
	}

	withProjectName(projectName) {
		this.projectName = projectName;
		return this;
	}

	withProjectDirectory(projectDirectory) {
		this.projectDirectory = projectDirectory;
		return this;
	}

	withUnitTesting(includeUnitTesting) {
		this.includeUnitTesting = includeUnitTesting;
		return this;
	}

	withNpmPackageInitialized(npmPackageInitialized) {
		this.npmPackageInitialized = npmPackageInitialized;
		return this;
	}

	build() {
		return new CreateProjectActionResult({
			status: this.status,
			...(this.data && { data: this.data }),
			...(this.resultMessage && { resultMessage: this.resultMessage }),
			...(this.errorMessages && { errorMessages: this.errorMessages }),
			...(this.projectType && { projectType: this.projectType }),
			...(this.projectName && { projectName: this.projectName }),
			...(this.projectDirectory && { projectDirectory: this.projectDirectory }),
			...(this.includeUnitTesting && { includeUnitTesting: this.includeUnitTesting }),
			...(this.npmPackageInitialized && { npmPackageInitialized: this.npmPackageInitialized }),
			...(this.projectFolder && { projectFolder: this.projectFolder }),
			...(this.commandParameters && { commandParameters: this.commandParameters }),
			...(this.commandFlags && { commandFlags: this.commandFlags }),
		});
	}
}

module.exports = CreateProjectActionResult;
