/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const Command = require('../Command');
const assert = require('assert');
const NodeConsoleLogger = require('../../loggers/NodeConsoleLogger');
const CommandOptionsValidator = require('../../core/CommandOptionsValidator');
const { throwValidationException } = require('../../utils/ExceptionUtils');
const ActionResultUtils = require('../../utils/ActionResultUtils');
const { ActionResult } = require('../../services/actionresult/ActionResult');

module.exports = class BaseCommand {
	constructor(options) {

		assert(options);
		assert(options.commandMetadata);
		assert(options.projectFolder);
		assert(options.log);
		assert(typeof options.runInInteractiveMode === 'boolean');

		this._commandMetadata = options.commandMetadata;
		this._projectFolder = options.projectFolder;
		this._executionPath = options.executionPath;
		this._runInInteractiveMode = options.runInInteractiveMode;
		this._log = options.log;
	}

	async run(params) {
		assert(this._action, "Commands must have an action");
		assert(this._inputHandler, "Commands must have an input handler");
		assert(this._outputHandler, "Commands must have an output handler");

		console.log(`run with params:\n${JSON.stringify(params)}\ngetParameters Launched...`);
		const getParams = await this._inputHandler.getParameters(params);

		const groupedParams = { ...params, ...getParams };

		console.log(`getParameters answer:\n${JSON.stringify(getParams)}\nValidating parameters...`);
		this._validateParameters(groupedParams, this._commandMetadata, this._runInInteractiveMode);

		console.log(`parameters validated\npreExecute Launched...`);
		const preExec = await this._action.preExecute(groupedParams);

		console.log(`preExecute answer:\n${JSON.stringify(preExec)}\nExecute Launched...`);
		const exec = await this._action.execute(preExec);

		console.log(`Execute answer:\n${JSON.stringify(exec)}\npostExecute Launched...`);
		const actionResult = await this._action.postExecute(exec);

		if (!(actionResult instanceof ActionResult)) {
			throw 'INTERNAL ERROR: Command must return an ActionResult object.';
		}
		else if (actionResult.status === ActionResult.STATUS.ERROR) {
			throw ActionResultUtils.getErrorMessagesString(actionResult);
		}

		console.log(`postExecute answer:\n${JSON.stringify(actionResult)}\nFormatActionResult Launched...`);
		const result = await this._outputHandler.formatActionResult(actionResult);

		console.log(`FormatActionResult answer:\n${JSON.stringify(result)}\nFinished command run...`);
		return result;
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

		console.log(`command metadata: ${JSON.stringify(this._commandMetadata)}`);
		console.log(`execution parameters: ${JSON.stringify(params)}`);
		console.log(`validation errors: ${JSON.stringify(validationErrors)}`);

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
