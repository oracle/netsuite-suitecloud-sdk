/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

module.exports = class BaseInputHandler {
	constructor(options) {
		this._projectFolder = options.projectFolder;
		this._commandMetadata = options.commandMetadata;
		this._executionPath = options.executionPath;
		this._log = options.log;
		this._runInInteractiveMode = options.runInInteractiveMode;
		this._executionEnvironmentContext = options.executionEnvironmentContext;
		this._sdkPath = options.sdkPath;
	}

	async getParameters(params) {
		return params;
	}
};
