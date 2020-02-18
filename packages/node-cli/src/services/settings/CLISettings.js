/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

module.exports = class CLISettings {
	constructor(options) {
		this._useProxy = options.useProxy;
		this._proxyUrl = options.proxyUrl;
		this._isJavaVersionValid = options.isJavaVersionValid;
		this._isSdkDownloaded = options.isSdkDownloaded;
	}

	get isJavaVersionValid() {
		return this._isJavaVersionValid;
	}

	get proxyUrl() {
		return this._proxyUrl;
	}

	get useProxy() {
		return this._useProxy;
	}

	get isSdkDownloaded() {
		return this._isSdkDownloaded;
	}

	toJSON() {
		return {
			proxyUrl: this._proxyUrl,
			useProxy: this._useProxy,
			isJavaVersionValid: this._isJavaVersionValid,
			isSdkDownloaded: this._isSdkDownloaded
		};
	}

	static fromJson(json) {
		return new CLISettings({
			useProxy: json.useProxy,
			proxyUrl: json.proxyUrl,
			isJavaVersionValid: json.isJavaVersionValid,
			isSdkDownloaded: json.isSdkDownloaded
		});
	}
};
