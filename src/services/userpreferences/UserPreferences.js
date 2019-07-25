/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

module.exports = class UserPreferences {
	constructor(options) {
		this._useProxy = options.useProxy;
		this._proxyUrl = options.proxyUrl;
	}

	get proxyUrl() {
		return this._proxyUrl;
	}

	get useProxy() {
		return this._useProxy;
	}

	toJSON() {
		return {
			proxyUrl: this._proxyUrl,
			useProxy: this._useProxy,
		};
	}

	static fromJson(json) {
		return new UserPreferences({
			useProxy: json.useProxy,
			proxyUrl: json.proxyUrl,
		});
	}
};
