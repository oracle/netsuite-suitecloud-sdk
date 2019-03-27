'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const NodeUtils = require('../utils/NodeUtils');
const CommandUtils = require('../utils/CommandUtils');
const CLIException = require('../CLIException');
const inquirer = require('inquirer');
const ProjectContextService = require('../services/ProjectContextService');
const OBJECT_TYPES = require('../metadata/ObjectTypesMetadata');
const SDKExecutionContext = require('../SDKExecutor').SDKExecutionContext;
const {MANIFEST_XML, PROJECT_SUITEAPP} = require("../ApplicationConstants");
const TranslationService = require('../services/TranslationService');
const { COMMAND_LISTOBJECTS: {QUESTIONS} } = require('../services/TranslationKeys');
const WORDS = {
	ALL: 'all',
	APLICATION_ID: 'application ID',
	OBJECT_TYPES: 'object types',
	SCRIPT_ID: 'scritp ID',
	SUITE_APP: 'SuiteApp'
};


module.exports = class ListObjectsCommandGenerator extends BaseCommandGenerator {
	
	constructor(options) {
		super(options);
	}

	_validateFieldIsNotEmpty(fieldName) {
		return fieldName !== '' ? true : NodeUtils.formatString(TranslationService.getMessage(TranslationKeys.ERROR_EMPTY_FIELD), {color: NodeUtils.COLORS.RED, bold: true})
	}
	
	
	_validateArrayIsNotEmpty(array) {
		return array.length > 0 ? true : NodeUtils.formatString(TranslationService.getMessageTranslationKeys(TranslationKeys.ERROR_CHOOSE_OPTION), {color: NodeUtils.COLORS.RED, bold: true})
	}

	

	_getCommandQuestions(prompt) {
		var questions = []
		//create a class to see type based on manifest.
		if (ProjectContextService.getProjectType() === PROJECT_SUITEAPP) {
			let message = TranslationService.getMessage(QUESTIONS.SPECIFIC_APPID,
				NodeUtils.formatString(WORDS.SUITE_APP, {color: NodeUtils.COLORS.GREEN, bold: true}));

			const questionSpecificSuiteApp = {	
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: 'specifysuiteapp',
				message,
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
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: 'appid',
				message: TranslationService.getMessage(QUESTIONS.APPID,
					NodeUtils.formatString(WORDS.APLICATION_ID, {color: NodeUtils.COLORS.GREEN, bold: true})),
				validate: this._validateFieldIsNotEmpty
				
			}
			questions.push(questionAppId)
		}

		const questionFilterByCustomObjects = {	
			type: 'list',
			name: 'typeall',
			message: TranslationService.getMessage(QUESTIONS.SHOW_ALL_CUSTOM_OBJECTS,
				NodeUtils.formatString(WORDS.ALL, {color: NodeUtils.COLORS.YELLOW})),
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
			]
			
		}
		questions.push(questionFilterByCustomObjects)


		const questionCustomOjects = {	
			when: function(answers) {
				return !answers.typeall;
			},
			type: CommandUtils.INQUIRER_TYPES.CHECKBOX,
			name: 'type',
			message: TranslationService.getMessage(QUESTIONS.FILTER_BY_CUSTOM_OBJECTS,
				NodeUtils.formatString(WORDS.OBJECT_TYPES, {color: NodeUtils.COLORS.GREEN, bold: true})),
			pageSize: 15,
			choices: [
				...OBJECT_TYPES.map((customObject) =>  ({name: customObject.name, value: customObject.value.type })),
				new inquirer.Separator()
			],
			
			validate: this._validateArrayIsNotEmpty
		}
		
		questions.push(questionCustomOjects)

		const questionSpecificScriptId = {	
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: 'specifyscriptid',
			message: TranslationService.getMessage(QUESTIONS.FILTER_BY_SCRIPT_ID,
				NodeUtils.formatString(WORDS.SCRIPT_ID, {color: NodeUtils.COLORS.GREEN, bold: true})),
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
			type: CommandUtils.INQUIRER_TYPES.INPUT,
			name: 'scriptid',
			message: TranslationService.getMessage(QUESTIONS.SCRIPT_ID,
				NodeUtils.formatString(WORDS.SCRIPT_ID, {color: NodeUtils.COLORS.GREEN, bold: true})),
			validate: this._validateFieldIsNotEmpty
		}
		questions.push(questionScriptId)

		return prompt(questions)
	}

	_executeAction(answers) {
		let options = Object.keys(this._commandMetadata.options)
		var params = CommandUtils.pick(answers,options)
		if (params.type != null) {
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