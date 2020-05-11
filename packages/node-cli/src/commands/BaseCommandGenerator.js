/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const SdkExecutor = require('../SdkExecutor').SdkExecutor;
const Command = require('./Command');
const assert = require('assert');
const AuthenticationService = require('../core/authentication/AuthenticationService');
const NodeConsoleLogger = require('../loggers/NodeConsoleLogger');
const OutputFormatter = require('./outputFormatters/OutputFormatter');

module.exports = class BaseCommandGenerator {
	constructor(options) {
		assert(options);
		assert(options.commandMetadata);
		assert(options.projectFolder);
		assert(typeof options.runInInteractiveMode === 'boolean');
		assert(options.consoleLogger);
		assert(options.sdkPath);

		this._sdkExecutor = new SdkExecutor(new AuthenticationService(options.executionPath), options.sdkPath);

		this._commandMetadata = options.commandMetadata;
		this._projectFolder = options.projectFolder;
		this._executionPath = options.executionPath;
		this._runInInteractiveMode = options.runInInteractiveMode;
		this._consoleLogger = options.consoleLogger;
		this._outputFormatter = options.outputFormatter;
	}

	_getCommandQuestions(prompt) {
		return prompt([]);
	}

	_executeAction() {}

	_preExecuteAction(args) {
		return args;
	}

	create() {
		return new Command({
			commandMetadata: this._commandMetadata,
			projectFolder: this._projectFolder,
			getCommandQuestionsFunc: this._getCommandQuestions.bind(this),
			preActionFunc: this._preExecuteAction.bind(this),
			actionFunc: this._executeAction.bind(this),
			outputFormatter: this._outputFormatter ? this._outputFormatter : new OutputFormatter(this._consoleLogger),
			consoleLogger: this._consoleLogger ? this._consoleLogger : NodeConsoleLogger,			
		});
	}

	get consoleLogger() {
		return this._consoleLogger;
	}

	get outputFormatter() {
		return this._outputFormatter;
	}
};
