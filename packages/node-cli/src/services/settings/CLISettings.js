/*
** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const DEFAULT_CLI_SETTINGS = {
	isJavaVersionValid: false,
}

module.exports = class CLISettings {
	// should not be directly used, use static fromJson(json) method
	constructor(options) {
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

	get vmOptions() {
		return this._vmOptions;
	}

	toJSON() {
		return {
			isJavaVersionValid: this._isJavaVersionValid,
			...(this._vmOptions && { vmOptions: this._vmOptions }),
		};
	}

	static fromJson(json) {
		return new CLISettings({
			isJavaVersionValid: json.isJavaVersionValid,
			...(json.hasOwnProperty("vmOptions") && { vmOptions: json.vmOptions })
		});
	}
};
