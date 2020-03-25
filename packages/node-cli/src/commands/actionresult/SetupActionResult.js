/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';
const assert = require('assert');
const { ActionResult, ActionResultBuilder } = require('./ActionResult');

class SetupCommandActionResult extends ActionResult {

	constructor(build) {
		super(build)
		this._mode = build.mode;
		this._authId = build.authId;
		this._accountInfo = build.accountInfo;
	}

	validateBuild(build) {
		assert(build);
		assert(build.status, "status is required when creating an ActionResult object.");
		if (build.status === ActionResult.SUCCESS) {
			assert(build.mode, "mode is required when ActionResult is a success.");
			assert(build.authId, "authId is required when ActionResult is a success.");
			assert(build.accountInfo, "accountInfo is required when ActionResult is a success.");
		}
		if (build.status === ActionResult.ERROR) {
			assert(build.errorMessages, "errorMessages is required when ActionResult is an error.");
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
		return new SetupActionResultBuilder();
	}
};

class SetupActionResultBuilder extends ActionResultBuilder {
	constructor() {
		super();
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
		return new SetupCommandActionResult({
			status: this.status,
			...(this.errorMessages && { errorMessages: this.errorMessages }),
			...(this.mode && { mode: this.mode }),
			...(this.authId && { authId: this.authId }),
			...(this.accountInfo && { accountInfo: this.accountInfo })
		});
	}
};

module.exports = SetupCommandActionResult;