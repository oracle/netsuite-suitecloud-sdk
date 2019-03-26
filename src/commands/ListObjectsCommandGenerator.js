'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const NodeUtils = require('../utils/NodeUtils');
const CLIException = require('../CLIException');
const inquirer = require('inquirer');
const ProjectContextService = require('../services/ProjectContextService');
const OBJECT_TYPES = require('../metadata/ObjectTypesMetadata');
const SDKExecutionContext = require('../SDKExecutor').SDKExecutionContext;
const {MANIFEST_XML, PROJECT_SUITEAPP} = require("../ApplicationConstants");

module.exports = class ListObjectsCommandGenerator extends BaseCommandGenerator {
	
	constructor(options) {
		super(options);
	}

	_validateFieldIsNotEmpty(fieldName) {
		return fieldName !== '' ? true : NodeUtils.formatString("Error: This field cannot be empty.", {color: NodeUtils.COLORS.RED, bold: true})
	}
	
	
	_validateArrayIsNotEmpty(array){
		return array.length > 0 ? true : NodeUtils.formatString("Error: You should choose at least one option.", {color: NodeUtils.COLORS.RED, bold: true})
	}

	pick(object, keys) {
		return keys.reduce((obj, key) => {
			if (object[key]) {
				obj[key] = object[key];
			}
			return obj;
		}, {});
	}

	_getCommandQuestions(prompt) {
		var questions = []
		//create a class to see type based on manifest.
		if(ProjectContextService.getProjectType() === PROJECT_SUITEAPP){
			const questionSpecificSuiteApp = {	
				type: 'list',
				name: 'specifysuiteapp',
				message: `Would you like to list objects from a specific ${NodeUtils.formatString("SuiteApp", {color: NodeUtils.COLORS.GREEN, bold: true})}? `,
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
				validate: this._validateArrayIsNotEmpty
			}
			questions.push(questionSpecificSuiteApp)

			const questionAppId = {	
				when: function(response) {
					return response.specifysuiteapp;
				},
				type: 'input',
				name: 'appid',
				message: `Introduce the ${NodeUtils.formatString("appId", {color: NodeUtils.COLORS.GREEN, bold: true})}`,
				validate: this._validateFieldIsNotEmpty
				
			}
			questions.push(questionAppId)
		}

		const questionFilterByCustomObjects = {	
			type: 'confirm',
			name: 'typeall',
			message: `Would you like to list ${NodeUtils.formatString("all", {color: NodeUtils.COLORS.YELLOW})} types of ${NodeUtils.formatString("custom objects", {color: NodeUtils.COLORS.GREEN, bold: true})}? (Yes/No)`,
			
		}
		questions.push(questionFilterByCustomObjects)


		const questionCustomOjects = {	
			when: function(answers) {
				return answers.typeall;
			},
			type: 'checkbox',
			name: 'type',
			searchable: true,
			message: `Which ${NodeUtils.formatString("custom objects", {color: NodeUtils.COLORS.GREEN, bold: true})} would you like to include in your list?`,
			pageSize: 15,
			choices: [
				...OBJECT_TYPES.map((a) =>  ({name: a.name, value: a.value.type })),
				new inquirer.Separator()
			],
			
			validate: this._validateArrayIsNotEmpty
		}
		
		questions.push(questionCustomOjects)

		const questionSpecificScriptId = {	
			type: 'list',
			name: 'specifyscriptid',
			message: `Would you like to specify a partial or explicit ${NodeUtils.formatString("scriptId", {color: NodeUtils.COLORS.GREEN, bold: true})} for custom objects?`,
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
			validate: this._validateFieldIsNotEmpty
		}
		questions.push(questionScriptId)

		return prompt(questions)
	}

	_executeAction(answers) {
		// We will pass only the answers that are an option of the "listobject" command
		let options = Object.keys(this._commandMetadata.options)
		// var params = _.pick(answers, options)
		var params = this.pick(answers,options)
		if(params.type != null){
			params.type = params.type.join(" ")
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