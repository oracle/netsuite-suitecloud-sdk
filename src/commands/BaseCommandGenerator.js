'use strict';

const SDKExecutor = require('../SDKExecutor').SDKExecutor;
const AccountDetailsService = require('./../core/accountsetup/AccountDetailsService');
const Command = require('./Command');
const assert = require('assert');

module.exports = class BaseCommandGenerator {
	constructor(options) {
		assert(options);
		assert(options.commandMetadata);
		assert(options.projectFolder);

		this._sdkExecutor = new SDKExecutor();
		this._accountDetailsService = new AccountDetailsService();

		this._commandMetadata = options.commandMetadata;
		this._projectFolder = options.projectFolder;
		this._executionPath = options.executionPath;
	}

	_getCommandQuestions(prompt) {
		return prompt([]);
	}
	_executeAction() {}

	_applyDefaultContextParams(sdkExecutionContext) {
		const accountDetails = this._accountDetailsService.get();
		sdkExecutionContext.addParam('account', accountDetails.accountId);
		sdkExecutionContext.addParam('role', accountDetails.roleId);
		sdkExecutionContext.addParam('email', accountDetails.email);
		sdkExecutionContext.addParam('url', accountDetails.netSuiteUrl);
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
