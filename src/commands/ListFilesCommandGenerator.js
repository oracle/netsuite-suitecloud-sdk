'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const SDKExecutionContext = require('../SDKExecutor').SDKExecutionContext;

module.exports = class ListFilesCommandGenerator extends BaseCommandGenerator {
	constructor(commandMetadata, customizedCommandOptions) {
		super(commandMetadata, customizedCommandOptions);
	}

	_getCommandQuestions() {
		return [
			{
				type: 'list',
				name: this._commandMetadata.options.folder.name,
				message: 'Choose the FileCabinet folder',
				default: '/SuiteScripts',
				choices: [
					{
						name: 'SuiteScripts',
						value: '/SuiteScripts',
					},
					{
						name: 'SuiteScripts/Deploy_Extensions',
						value: '/SuiteScripts/Deploy_Extensions',
					},
				],
			},
		];
	}

	_executeAction(answers) {
		let executionContext = new SDKExecutionContext(this._commandMetadata.name, answers);
		return this._sdkExecutor.execute(executionContext);
	}
};
