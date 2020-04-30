/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ActionResult } = require('../../services/actionresult/ActionResult');
const SDKExecutor = require('../../SDKExecutor');
const AuthenticationService = require('../../core/authentication/AuthenticationService');

module.exports = class BaseAction {
	constructor(options) {
		this._projectFolder = options.projectFolder;
		this._commandMetadata = options.commandMetadata;
		this._executionPath = options.executionPath;
		this._runInInteractiveMode = options.runInInteractiveMode;
		this._log = options.log;

		this._sdkExecutor = new SDKExecutor(new AuthenticationService(options.executionPath));
	}

	async preExecute(params) {
		return params;
	}

	async execute(params) {
		return ActionResult.Builder.withErrors(['BaseAction execute should never be called']);
	}

	async postExecute(actionResult) {
		return actionResult;
	}
};
