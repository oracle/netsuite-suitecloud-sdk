/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const assert = require('assert');
const { ActionResult, ActionResultBuilder, STATUS } = require('./ActionResult');

class AuthenticateActionResult extends ActionResult {
	constructor(parameters) {
		super(parameters);
		this._mode = parameters.mode;
		this._authId = parameters.authId;
		this._accountInfo = parameters.accountInfo;
	}

	validateParameters(parameters) {
		assert(parameters);
		assert(parameters.status, 'status is required when creating an ActionResult object.');
		if (parameters.status === STATUS.SUCCESS) {
			assert(parameters.mode, 'mode is required when ActionResult is a success.');
			assert(parameters.authId, 'authId is required when ActionResult is a success.');
			assert(parameters.accountInfo, 'accountInfo is required when ActionResult is a success.');
		} else {
			assert(parameters.errorMessages, 'errorMessages is required when ActionResult is an error.');
			assert(Array.isArray(parameters.errorMessages), 'errorMessages argument must be an array');
		}
	}

	get mode() {
		return this._mode;
	}

	get authId() {
		return this._authId;
	}

	get accountInfo() {
		return this._accountInfo;
	}

	static get Builder() {
		return new AuthenticateActionResultBuilder();
	}
}

class AuthenticateActionResultBuilder extends ActionResultBuilder {
	constructor() {
		super();
	}

	success() {
		this.status = STATUS.SUCCESS;
		return this;
	}

	withMode(mode) {
		this.mode = mode;
		return this;
	}

	withAuthId(authId) {
		this.authId = authId;
		return this;
	}

	withAccountInfo(accountInfo) {
		this.accountInfo = accountInfo;
		return this;
	}

	build() {
		return new AuthenticateActionResult({
			status: this.status,
			...(this.errorMessages && { errorMessages: this.errorMessages }),
			...(this.mode && { mode: this.mode }),
			...(this.authId && { authId: this.authId }),
			...(this.accountInfo && { accountInfo: this.accountInfo }),
			...(this.projectFolder && { projectFolder: this.projectFolder }),
			...(this.commandParameters && { commandParameters: this.commandParameters }),
		});
	}
}

module.exports = AuthenticateActionResult;
