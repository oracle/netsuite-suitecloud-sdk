/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
import assert from 'assert';
import { ActionResult, ActionResultBuilder, STATUS } from './ActionResult';

type CreateProjectData = any;

export class CreateProjectActionResult extends ActionResult<CreateProjectData> {
	readonly projectType: string;
	readonly projectName?: string;
	readonly projectDirectory: string;
	readonly includeUnitTesting?: boolean;
	readonly npmPackageInitialized?: boolean;

	constructor(builder: CreateProjectActionResultBuilder) {
		super(builder);
		this.projectType = builder.projectType;
		this.projectName = builder.projectName;
		this.projectDirectory = builder.projectDirectory;
		this.includeUnitTesting = builder.includeUnitTesting;
		this.npmPackageInitialized = builder.npmPackageIntitialized;
	}

	static get Builder() {
		return new CreateProjectActionResultBuilder();
	}
}

class CreateProjectActionResultBuilder extends ActionResultBuilder<CreateProjectData> {

	projectType!: string;
	projectName?: string;
	projectDirectory!: string;
	includeUnitTesting?: boolean;
	npmPackageIntitialized?: boolean;

	constructor() {
		super();
	}

	withProjectType(projectType: string) {
		this.projectType = projectType;
		return this;
	}

	withProjectName(projectName: string) {
		this.projectName = projectName;
		return this;
	}

	withProjectDirectory(projectDirectory: string) {
		this.projectDirectory = projectDirectory;
		return this;
	}

	withUnitTesting(includeUnitTesting: boolean) {
		this.includeUnitTesting = includeUnitTesting;
		return this;
	}

	withNpmPackageInitialized(npmPackageInitialized: boolean) {
		this.npmPackageIntitialized = npmPackageInitialized;
		return this;
	}

	validate() {
		super.validate();
		if (this.status === STATUS.SUCCESS) {
			assert(this.projectDirectory, 'projectDirectory is required when ActionResult is a success.');
			assert(this.projectType, 'projectType is required when ActionResult is a success.');
		}
	}

	build() {
		this.validate();
		return new CreateProjectActionResult(this);
	}
}

