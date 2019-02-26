'use strict';

const SDKExecutor = require('../SDKExecutor').SDKExecutor;
const Command = require('./Command');
const Context = require('../Context');

module.exports = class BaseCommandGenerator {
	constructor(commandMetadata, commandUserExtension) {
		this._sdkExecutor = new SDKExecutor();
		this._commandMetadata = commandMetadata;
		this._commandUserExtension = commandUserExtension;
	}

	_getCommandQuestions() {
		return [];
	}
	_executeAction() {}

	_supportsInteractiveMode() {
		return true;
	}

	_applyDefaultContextParams(sdkExecutionContext) {
		sdkExecutionContext.addParam('account', Context.CurrentAccountDetails.getCompId());
		sdkExecutionContext.addParam('role', Context.CurrentAccountDetails.getRoleId());
		sdkExecutionContext.addParam('email', Context.CurrentAccountDetails.getEmail());
		sdkExecutionContext.addParam('url', Context.CurrentAccountDetails.getNetSuiteUrl());
	}

	_preExecuteAction(args) {
		return args;
	}

	create(runInInteractiveMode) {
		return new Command({
			name: this._commandMetadata.name,
			alias: this._commandMetadata.alias,
			description: this._commandMetadata.description,
			preActionFunc: this._preExecuteAction.bind(this),
			actionFunc: this._executeAction.bind(this),
			getCommandQuestionsFunc: this._getCommandQuestions.bind(this),
			isSetupRequired: this._commandMetadata.isSetupRequired,
			runInInteractiveMode: runInInteractiveMode,
			options: this._commandMetadata.options,
			commandUserExtension: this._commandUserExtension,
			supportsInteractiveMode: this._supportsInteractiveMode(),
		});
	}
};
