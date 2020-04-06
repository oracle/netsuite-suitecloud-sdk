/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const SDKExecutor = require('../../SDKExecutor').SDKExecutor;
const Command = require('../Command');
const assert = require('assert');
const AuthenticationService = require('../../core/authentication/AuthenticationService');
const NodeConsoleLogger = require('../../loggers/NodeConsoleLogger');
const CommandOptionsValidator = require('../../core/CommandOptionsValidator');
const { throwValidationException } = require('../../utils/ExceptionUtils');

module.exports = class BaseCommand {
	constructor(options) {
		assert(options);
		assert(options.commandMetadata);
		assert(options.projectFolder);
		assert(options.log);
		assert(typeof options.runInInteractiveMode === 'boolean');

		this._sdkExecutor = new SDKExecutor(new AuthenticationService(options.executionPath));

		this._commandMetadata = options.commandMetadata;
		this._projectFolder = options.projectFolder;
		this._executionPath = options.executionPath;
		this._runInInteractiveMode = options.runInInteractiveMode;
		this._log = options.log;
	}

	_execute() {}

	_preExecute(params) {
		return params;
	}

	_postExecute(actionResult) {
		return actionResult;
	}

	async run() {
		assert(this._action, "Commands must have an action");
		assert(this._inputHandler, "Commands must have an input handler");
		assert(this._outputHandler, "Commands must have an output handler");
		const params = await this._inputHandler.getParameters({
			projectFolder: this._projectFolder,
			executionPath: this._executionPath
		});
		this._validateParameters(params, this._commandMetadata, this._runInInteractiveMode);
		const preExec = await this._action.preExecute(params);
		const exec = await this._action.execute(preExec);
		const postExec = await this._action.postExecute(exec);
		await this._outputHandler.formatActionResult(postExec);
	}

	create() {
		return new Command({
			commandMetadata: this._commandMetadata,
			projectFolder: this._projectFolder,
			run: this.run.bind(this),
			log: this._log ? this._log : NodeConsoleLogger
		});
	}

	_validateParameters(params) {
		const commandOptionsValidator = new CommandOptionsValidator();
		const validationErrors = commandOptionsValidator.validate({
			commandOptions: this._commandMetadata.options,
			arguments: params,
		});

		if (validationErrors.length > 0) {
			throwValidationException(validationErrors, this._runInInteractiveMode, this._commandMetadata);
		}
	}

	/*create() {
		return new Command({
			commandMetadata: this._commandMetadata,
			projectFolder: this._projectFolder,
			preActionFunc: this._preExecute.bind(this),
			actionFunc: this._execute.bind(this),
			outputFormatter: this._outputFormatter ? this._outputFormatter : new OutputFormatter(this._consoleLogger),
			consoleLogger: this._consoleLogger ? this._consoleLogger : NodeConsoleLogger,			
		});
	}*/

};
