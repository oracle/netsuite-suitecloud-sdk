'use strict';

const SDKExecutor = require('../SDKExecutor').SDKExecutor;
const Command = require('./Command');
const Context = require('../Context');
const assert = require('assert');

module.exports = class BaseCommandGenerator {
	constructor(options) {
        assert(options);
        assert(options.commandMetadata);
        assert(options.commandUserExtension);
        assert(options.projectFolder);
        
        this._sdkExecutor = new SDKExecutor();
		this._commandMetadata = options.commandMetadata;
        this._commandUserExtension = options.commandUserExtension;
        this._projectFolder = options.projectFolder;
	}

	_getCommandQuestions(prompt) {
		return prompt([]);
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

	_formatOutput(result){
		console.log(result); 
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
			projectFolder: this._projectFolder,
			commandOutputFormater :this._formatOutput
		});
	}
};
