/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const assert = require('assert');
const CommandOptionsValidator = require('../core/CommandOptionsValidator');
const { throwValidationException } = require('../utils/ExceptionUtils');
const { ActionResult } = require('../services/actionresult/ActionResult');

const BaseAction = require('./base/BaseAction');
const BaseInputHandler = require('./base/BaseInputHandler');
const BaseOutputHandler = require('./base/BaseOutputHandler');

class Command {
	constructor(options, action, inputHandler, outputHandler) {
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

		this._action = new action(options);
		this._inputHandler = new inputHandler(options);
		this._outputHandler = new outputHandler(options);
	}

	async run(params) {
		assert(this._action, 'Commands must have an action');
		assert(this._inputHandler, 'Commands must have an input handler');
		assert(this._outputHandler, 'Commands must have an output handler');

		const getParams = await this._inputHandler.getParameters(params);
		const groupedParams = { ...params, ...getParams };

		this._validateActionParameters(groupedParams, this._commandMetadata, this._runInInteractiveMode);

		const preExec = await this._action.preExecute(groupedParams);
		const exec = await this._action.execute(preExec);
		const actionResult = await this._action.postExecute(exec);

		if (!(actionResult instanceof ActionResult)) {
			throw 'INTERNAL ERROR: Command must return an ActionResult object.';
		} else if (actionResult.status === ActionResult.STATUS.ERROR) {
			return this._outputHandler.parseError(actionResult);
		} else {
			return this._outputHandler.parse(actionResult);
		}
	}

	_validateActionParameters(params) {
		const commandOptionsValidator = new CommandOptionsValidator();
		const validationErrors = commandOptionsValidator.validate({
			commandOptions: this._commandMetadata.options,
			arguments: params,
		});
		if (validationErrors.length > 0) {
			throwValidationException(validationErrors, this._runInInteractiveMode, this._commandMetadata);
		}
	}

	static get Builder() {
		return new CommandBuilder();
	}

};

class CommandBuilder {
	constructor() {
		this._options = {};
		this._action = BaseAction;
		this._input = BaseInputHandler;
		this._output = BaseOutputHandler;
	};

	withOptions(options) {
		this._options = options;
		return this;
	}

	withAction(action) {
		this._action = action;
		return this;
	}

	withInput(input) {
		this._input = input;
		return this;
	}

	withOutput(output) {
		this._output = output;
		return this;
	}

	build() {
		return new Command(this._options, this._action, this._input, this._output);
	}
}

module.exports = Command;