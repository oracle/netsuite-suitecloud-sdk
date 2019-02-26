'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const SDKExecutionContext = require('../SDKExecutor').SDKExecutionContext;

const ACP_PROJECT_TYPE = 'ACCOUNTCUSTOMIZATION';
const SUITEAPP_PROJECT_TYPE = 'SUITEAPP';

module.exports = class CreateProjectCommandGenerator extends BaseCommandGenerator {
	constructor(commandMetadata, customizedCommandOptions) {
		super(commandMetadata, customizedCommandOptions);
	}

	_getCommandQuestions() {
		return [
			{
				type: 'list',
				name: 'type',
				message: 'Choose project type',
				default: 0,
				choices: [
					{
						name: 'Account Customization Project',
						value: ACP_PROJECT_TYPE,
					},
					{
						name: 'SuiteApp',
						value: SUITEAPP_PROJECT_TYPE,
					},
				],
			},
			{
				type: 'input',
				name: 'projectname',
				message: 'Please enter the name of your project',
			},
			{
				type: 'list',
				name: 'overwrite',
				message: 'Would you like to overwrite the project if found in the same location?',
				default: 0,
				choices: [{ name: 'No', value: false }, { name: 'Yes', value: true }],
			},
			{
				when: function(response) {
					return response.type === SUITEAPP_PROJECT_TYPE;
				},
				type: 'input',
				name: 'publisherid',
				message: 'Please enter your NetSuite publisher ID',
			},
			{
				when: function(response) {
					return response.type === SUITEAPP_PROJECT_TYPE;
				},
				type: 'input',
				name: 'projectid',
				message: 'Please enter project ID',
			},
			{
				when: function(response) {
					return response.type === SUITEAPP_PROJECT_TYPE;
				},
				type: 'input',
				name: 'projectversion',
				message: 'Please enter project version',
			},
		];
	}

	_preExecuteAction(args) {
		args.parentdirectory = process.cwd() + '\\';
		return args;
	}

	_executeAction(args) {
		let params = {
			parentdirectory: args.parentdirectory,
			type: args.type,
			projectname: args.projectname,
			...(args.overwrite && { '-overwrite': '' }),
			...(args.type === SUITEAPP_PROJECT_TYPE && {
				publisherid: args.publisherid,
			}),
			...(args.type === SUITEAPP_PROJECT_TYPE && {
				projectid: args.projectid,
			}),
			...(args.type === SUITEAPP_PROJECT_TYPE && {
				projectversion: args.projectversion,
			}),
		};

		let executionContext = new SDKExecutionContext(this._commandMetadata.name, params);
		return this._sdkExecutor.execute(executionContext);
	}
};
