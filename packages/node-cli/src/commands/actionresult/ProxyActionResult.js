/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';
const assert = require('assert');
const ActionResult = require('./ActionResult');

class ProxyProjectActionResult extends ActionResult {

	constructor(build) {
		super(build)
		this._isSettingProxy = build.isSettingProxy;
		this._proxyUrl = build.proxyUrl;
		this._isProxyOverrided = build.isProxyOverrided;
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

	get isProxyOverrided() {
		return this._isProxyOverrided;
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


			isSettingProxy(isSettingProxy) {
				this.isSettingProxy = isSettingProxy;
				return this;
			}

			withProxyUrl(proxyUrl) {
				this.proxyUrl = proxyUrl;
				return this;
			}

			isProxyOverrided(isProxyOverrided) {
				this.isProxyOverrided = isProxyOverrided;
				return this;
			}

			build() {
				return new ProxyProjectActionResult({
					status: this.status,
					...(this.errorMessages && { errorMessages: this.errorMessages }),
					...(this.isSettingProxy && { isSettingProxy: this.isSettingProxy }),
					...(this.proxyUrl && { proxyUrl: this.proxyUrl }),
					...(this.isProxyOverrided && { proxyOverrided: this.isProxyOverrided })
				});
			}
		};
	}
};

module.exports = ProxyProjectActionResult;