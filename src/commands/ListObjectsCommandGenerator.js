'use strict';
const NodeUtils = require('../utils/NodeUtils');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const chalk = require('chalk');
const CLIException = require('../CLIException');
const inquirer = require('inquirer');
const ProjectContextService = require('../services/ProjectContextService');
const OBJECT_TYPES = require('../metadata/ObjectTypesMetadata');
const SDKExecutionContext = require('../SDKExecutor').SDKExecutionContext;
const {MANIFEST_XML, PROJECT_SUITEAPP} = require("../ApplicationConstants");
const _ = require('lodash');

function validateName(name) {
	return name !== '' ? true : `${chalk.red.bold("Error: You should provide a value")}`
}

function validateTypes(types){
	return types.length > 0 ? true : `${chalk.red.bold("Error: You should choose at least one option")}`
}


module.exports = class ListObjectsCommandGenerator extends BaseCommandGenerator {
	
	constructor(options) {
		super(options);
	}

	_getCommandQuestions(prompt) {

		var questions = []
		//create a class to see type based on manifest.
		if(ProjectContextService.getProjectType() === PROJECT_SUITEAPP){
			const questionSpecificSuiteApp = {	
				type: 'list',
				name: 'specifysuiteapp',
				message: `Would you like to list objects from a specific ${chalk.green.bold("SuiteApp")}? `,
				default: 0,
				choices: [
					{
						name: 'YES',
						value: true,
					},
					{
						name: 'NO',
						value: false,
					},
				],
				validate: validateTypes
			}
			questions.push(questionSpecificSuiteApp)

			const questionAppId = {	
				when: function(response) {
					return response.specifysuiteapp;
				},
				type: 'input',
				name: 'appid',
				message: `Introduce the ${chalk.green.bold("appId")}`,
				validate: validateName
				
			}
			questions.push(questionAppId)
		}

		const questionCustomOjects = {	
			type: 'checkbox',
			name: 'type',
			searchable: true,
			message: `Which ${chalk.green.bold("custom objects")} would you like to include in your list?`,
			pageSize: 15,
			choices: [
				{
					name: 'All',
					value: 'all',
					checked: true
				},
				new inquirer.Separator(),
				...OBJECT_TYPES.map((a) =>  ({name: a.name, value: a.value.type })),
				new inquirer.Separator()
			],
			
			validate: validateTypes
		}
		
		questions.push(questionCustomOjects)

		const questionSpecificScriptId = {	
			type: 'list',
			name: 'specifyscriptid',
			message: `Would like to specify a partial or explicit ${chalk.green.bold("scriptId")} for custom objects?`,
			default : false,
			choices: [
				{
					name: 'YES',
					value: true,
				},
				{
					name: 'NO',
					value: false,
				},
			],
		}
		questions.push(questionSpecificScriptId)

		const questionScriptId = {	
			when: function(response) {
				return response.specifyscriptid;
			},
			type: 'input',
			name: 'scriptid',
			message: 'Introduce the ScriptId filter',
			validate: validateName
		}
		questions.push(questionScriptId)

		return prompt(questions)
	}

	_executeAction(answers) {
		// We will pass only the answers that are an option of the "listobject" command
		let options = Object.keys(this._commandMetadata.options)
		var params = _.pick(answers, options)
		params.type = params.type.join(" ")
		console.log(params)
		if(params.type == [] || params.type.includes('all')){
			delete params.type
		}
		let executionContext = new SDKExecutionContext({
			command: this._commandMetadata.name,
			params,
		});
		return this._sdkExecutor.execute(executionContext);
	}

	_checkWorkingDirectoryContainsValidProject() {
		if (!FileUtils.exists(path.join(this._projectFolder, MANIFEST_XML))) {
			throw new CLIException(
				0,
				`Please run setupaccount in a valid folder. Could not find a ${MANIFEST_XML} file in the project folder ${this._projectFolder}`
			);
		}
	}
};
