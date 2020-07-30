/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
import { ActionResult, ActionResultBuilder } from './ActionResult';

type DeployDataType = any;

export class DeployActionResult extends ActionResult<DeployDataType> {

	readonly isServerValidation: boolean;
	readonly appliedContentProtection: boolean;
	readonly projectType: string;

	constructor(builder: DeployActionResultBuilder) {
		super(builder);
		this.isServerValidation = builder.isServerValidation ? true : false;
		this.appliedContentProtection = builder.appliedContentProtection ? true : false;
		this.projectType = builder.projectType;
	}

	static get Builder() {
		return new DeployActionResultBuilder();
	}
}

export class DeployActionResultBuilder extends ActionResultBuilder<DeployDataType> {

	isServerValidation?: boolean;
	appliedContentProtection?: boolean;
	projectType!: string;

	constructor() {
		super();
	}

	withServerValidation(isServerValidation: boolean) {
		this.isServerValidation = isServerValidation;
		return this;
	}

	withAppliedContentProtection(appliedContentProtection: boolean) {
		this.appliedContentProtection = appliedContentProtection;
		return this;
	}

	withProjectType(projectType: string) {
		this.projectType = projectType;
		return this;
	}

	build() {
		return new DeployActionResult(this);
	}
}
