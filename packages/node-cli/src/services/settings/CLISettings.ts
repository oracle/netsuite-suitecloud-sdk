/*
** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

export class CLISettings {

	readonly useProxy: Boolean;
	readonly proxyUrl: string;
	readonly isJavaVersionValid: boolean;

	constructor(options: {useProxy: boolean; proxyUrl: string; isJavaVersionValid: boolean}) {
		this.useProxy = options.useProxy;
		this.proxyUrl = options.proxyUrl;
		this.isJavaVersionValid = options.isJavaVersionValid;
	}

	toJSON() {
		return {
			proxyUrl: this.proxyUrl,
			useProxy: this.useProxy,
			isJavaVersionValid: this.isJavaVersionValid,
		};
	}

	static fromJson(json: {useProxy: boolean; proxyUrl: string; isJavaVersionValid: boolean}) {
		return new CLISettings({
			useProxy: json.useProxy,
			proxyUrl: json.proxyUrl,
			isJavaVersionValid: json.isJavaVersionValid,
		});
	}
};
