/*
** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';
const assert = require('assert');
const { ActionResult, ActionResultBuilder } = require('./ActionResult');

class ProxyActionResult extends ActionResult {

	constructor(parameters) {
		super(parameters);
		this._isSettingProxy = parameters.withSettingProxy;
		this._proxyUrl = parameters.proxyUrl;
		this._isProxyOverridden = parameters.isProxyOverridden;
	}

	validateParameters(parameters) {
		super.validateParameters(parameters);
		if (parameters.status === ActionResult.SUCCESS) {
			if (parameters.withSettingProxy) {
				assert(parameters.proxyUrl, "proxyUrl is required when ActionResult is a success.");
			}
		}
		if (parameters.status === ActionResult.ERROR) {
			assert(parameters.errorMessages, "errorMessages is required when ActionResult is an error.");
		}
	}

	get isSettingProxy() {
		return this._isSettingProxy;
	}

	get proxyUrl() {
		return this._proxyUrl;
	}

	get isProxyOverridden() {
		return this._isProxyOverridden;
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

	withSettingProxy(withSettingProxy) {
		this.withSettingProxy = withSettingProxy;
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
			...(this.withSettingProxy && { isSettingProxy: this.withSettingProxy }),
			...(this.proxyUrl && { proxyUrl: this.proxyUrl }),
			...(this.isProxyOverridden && { proxyOverridden: this.isProxyOverridden })
		});
	}
}

module.exports = ProxyActionResult;