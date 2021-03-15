/*
** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const DEFAULT_CLI_SETTINGS = {
	useProxy: false,
	proxyUrl: '',
	isJavaVersionValid: false,
}

module.exports = class CLISettings {
	// should not be directly used, use static fromJson(json) method
	constructor(options) {
		this._useProxy = options.useProxy ? options.useProxy : DEFAULT_CLI_SETTINGS.useProxy;
		this._proxyUrl = options.proxyUrl ? options.proxyUrl : DEFAULT_CLI_SETTINGS.proxyUrl;
		this._isJavaVersionValid = options.isJavaVersionValid ? options.isJavaVersionValid : DEFAULT_CLI_SETTINGS.isJavaVersionValid;
		// we only accept an object as a value for vmOptions
		if (options.hasOwnProperty("vmOptions")) {
			if (options.vmOptions !== null && typeof options.vmOptions === 'object') {
				this._vmOptions = options.vmOptions;
			} else {
				this._vmOptions = {};
			}
		}
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

	get vmOptions() {
		return this._vmOptions;
	}

	toJSON() {
		return {
			proxyUrl: this._proxyUrl,
			useProxy: this._useProxy,
			isJavaVersionValid: this._isJavaVersionValid,
			...(this._vmOptions && { vmOptions: this._vmOptions }),
		};
	}

	static fromJson(json) {
		return new CLISettings({
			useProxy: json.useProxy,
			proxyUrl: json.proxyUrl,
			isJavaVersionValid: json.isJavaVersionValid,
			...(json.hasOwnProperty("vmOptions") && { vmOptions: json.vmOptions })
		});
	}
};
