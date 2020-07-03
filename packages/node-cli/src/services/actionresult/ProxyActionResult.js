/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const assert = require('assert');
const { ActionResult, ActionResultBuilder, STATUS } = require('./ActionResult');

class ProxyActionResult extends ActionResult {
	constructor(parameters) {
		super(parameters);
		this._isSettingProxy = parameters.isSettingProxy;
		this._proxyUrl = parameters.proxyUrl;
		this._isProxyOverridden = parameters.isProxyOverridden;
	}

	validateParameters(parameters) {
		assert(parameters);
		assert(parameters.status, 'status is required when creating an ActionResult object.');
		if (parameters.status === STATUS.SUCCESS) {
			if (parameters.isSettingProxy) {
				assert(parameters.proxyUrl, 'proxyUrl is required when ActionResult is a success.');
			}
		} else {
			assert(parameters.errorMessages, 'errorMessages is required when ActionResult is an error.');
			assert(Array.isArray(parameters.errorMessages), 'errorMessages argument must be an array');
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
		this.status = STATUS.SUCCESS;
		return this;
	}

	withProxySetOption(isSettingProxy) {
		this.isSettingProxy = isSettingProxy;
		return this;
	}

	withProxyUrl(proxyUrl) {
		this.proxyUrl = proxyUrl;
		return this;
	}

	withProxyOverridden(isProxyOverridden) {
		this.isProxyOverridden = isProxyOverridden;
		return this;
	}

	build() {
		return new ProxyActionResult({
			status: this.status,
			isSettingProxy: this.isSettingProxy,
			isProxyOverridden: this.isProxyOverridden,
			...(this.errorMessages && { errorMessages: this.errorMessages }),
			...(this.proxyUrl && { proxyUrl: this.proxyUrl }),
			...(this.projectFolder && { projectFolder: this.projectFolder }),
		});
	}
}

module.exports = ProxyActionResult;
