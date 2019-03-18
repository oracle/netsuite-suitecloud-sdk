'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const SDKExecutionContext = require('../SDKExecutor').SDKExecutionContext;

module.exports = class ValidateCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
	}

	_getCommandQuestions(prompt) {
		return prompt([
			{
				type: 'list',
				name: 'server',
				message: 'Would you like to perform validation server side?',
				default: 0,
				choices: [
					{
						name: 'Yes',
						value: true,
					},
					{
						name: 'No',
						value: false,
					},
				],
			},
			{
				type: 'list',
				name: 'accountspecificvalues',
				message: 'Would you like to flag account-specific values as an error or a warning?',
				default: 0,
				choices: [
					{
						name: 'Flag as an error',
						value: 'ERROR',
					},
					{
						name: 'Flag as a warning',
						value: 'WARNING',
					},
				],
			},
			{
				type: 'list',
				name: 'applycontentprotection',
				message: 'Would you like to apply content protection?',
				default: 0,
				choices: [
					{
						name: 'No',
						value: false,
					},
					{
						name: 'Yes',
						value: true,
					},
				],
			},
		]);
	}

	_preExecuteAction(args) {
		args.project = this._projectFolder;
		args.log = currentProjectPath;
		return args;
	}

	_executeAction(answers) {
		if (!answers.applycontentprotection) {
			delete answers.applycontentprotection;
		}
		if (!answers.server) {
			delete answers.server;
		}

		let executionContext = new SDKExecutionContext({
			command: this._commandMetadata.name,
			params: params,
		});
		return this._sdkExecutor.execute(executionContext);
	}
};
