/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

module.exports = class BaseInputHandler {
	constructor(options) {
		this._projectFolder = options.projectFolder;
		this._sdkExecutor = options.sdkExecutor;
		this._commandMetadata = options.commandMetadata;
		this._log = options.log;
    }

	async getParameters() {
		return {};
	}
};
