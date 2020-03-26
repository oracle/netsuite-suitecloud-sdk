/*
** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';
const assert = require('assert');
const { ActionResult, ActionResultBuilder } = require('./ActionResult');

class ProxyActionResult extends ActionResult {

	constructor(build) {
		super(build);
		this._isSettingProxy = build.isSettingProxy;
		this._proxyUrl = build.proxyUrl;
		this._isProxyOverrided = build.isProxyOverridden;
	}

	validateBuild(build) {
		assert(build);
		assert(build.status, "status is required when creating an ActionResult object.");
		if (build.status === ActionResult.SUCCESS) {
			if (build.isSettingProxy) {
				assert(build.proxyUrl, "proxyUrl is required when ActionResult is a success.");
			}
		}
		if (build.status === ActionResult.ERROR) {
			assert(build.errorMessages, "errorMessages is required when ActionResult is an error.");
		}
	}

	get isSettingProxy() {
		return this._isSettingProxy;
	}

	get proxyUrl() {
		return this._proxyUrl;
	}

	get isProxyOverridden() {
		return this._isProxyOverrided;
	}

	static get Builder() {
		return new ProxyActionResultBuilder();
	}
}

class ProxyActionResultBuilder extends ActionResultBuilder {
	constructor() {
		super();
	}

	success() {
		this.status = super.SUCCESS;
		return this;
	}

	isSettingProxy(isSettingProxy) {
		this.isSettingProxy = isSettingProxy;
		return this;
	}

	withProxyUrl(proxyUrl) {
		this.proxyUrl = proxyUrl;
		return this;
	}

	isProxyOverridden(isProxyOverridden) {
		this.isProxyOverridden = isProxyOverridden;
		return this;
	}

	build() {
		return new ProxyActionResult({
			status: this.status,
			...(this.errorMessages && { errorMessages: this.errorMessages }),
			...(this.isSettingProxy && { isSettingProxy: this.isSettingProxy }),
			...(this.proxyUrl && { proxyUrl: this.proxyUrl }),
			...(this.isProxyOverridden && { proxyOverridden: this.isProxyOverridden })
		});
	}
}

module.exports = ProxyActionResult;