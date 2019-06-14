'use strict';

const SDKExecutor = require('../SDKExecutor').SDKExecutor;
const Command = require('./Command');
const Context = require('../Context');
const assert = require('assert');

module.exports = class BaseCommandGenerator {
	constructor(options) {
		assert(options);
		assert(options.commandMetadata);
		assert(options.projectFolder);

		this._sdkExecutor = new SDKExecutor();
		this._commandMetadata = options.commandMetadata;
		this._projectFolder = options.projectFolder;
		this._executionPath = options.executionPath;
	}

	_getCommandQuestions(prompt) {
		return prompt([]);
	}
	_executeAction() {}

	_applyDefaultContextParams(sdkExecutionContext) {
		sdkExecutionContext.addParam('account', Context.CurrentAccountDetails.getAccountId());
		sdkExecutionContext.addParam('role', Context.CurrentAccountDetails.getRoleId());
		sdkExecutionContext.addParam('email', Context.CurrentAccountDetails.getEmail());
		sdkExecutionContext.addParam('url', Context.CurrentAccountDetails.getNetSuiteUrl());
	}

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
			formatOutputFunc: this._formatOutput ? this._formatOutput.bind(this) : null,
		});
	}
};
