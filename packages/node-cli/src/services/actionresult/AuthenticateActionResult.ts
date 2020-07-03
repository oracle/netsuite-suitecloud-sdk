/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
import assert from 'assert';
import { ActionResult, ActionResultBuilder, STATUS } from './ActionResult';

export class AuthenticateActionResult extends ActionResult<undefined> {
	readonly mode: string;
	readonly authId: string;
	readonly accountInfo: any;
	constructor(parameters: AuthenticateActionResultBuilder) {
		super(parameters);
		this.mode = parameters.mode;
		this.authId = parameters.authId;
		this.accountInfo = parameters.accountInfo;
	}

	static get Builder() {
		return new AuthenticateActionResultBuilder();
	}
}

export class AuthenticateActionResultBuilder extends ActionResultBuilder<undefined> {
	mode!: string;
	authId!: string;
	accountInfo!: string;
	constructor() {
		super();
	}

	success() {
		this.status = STATUS.SUCCESS;
		return this;
	}

	withMode(mode: string) {
		this.mode = mode;
		return this;
	}

	withAuthId(authId: string) {
		this.authId = authId;
		return this;
	}

	withAccountInfo(accountInfo: any) {
		this.accountInfo = accountInfo;
		return this;
	}

	validate() {
		assert(this);
		assert(this.status, 'status is required when creating an ActionResult object.');
		if (this.status === STATUS.SUCCESS) {
			assert(this.mode, 'mode is required when ActionResult is a success.');
			assert(this.authId, 'authId is required when ActionResult is a success.');
			assert(this.accountInfo, 'accountInfo is required when ActionResult is a success.');
		} else {
			assert(this.errorMessages, 'errorMessages is required when ActionResult is an error.');
			assert(Array.isArray(this.errorMessages), 'errorMessages argument must be an array');
		}
	}

	build() {
		this.validate();
		return new AuthenticateActionResult(this);
	}
}
