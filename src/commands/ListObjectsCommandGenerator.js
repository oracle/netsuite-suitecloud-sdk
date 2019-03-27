'use strict';

const inquirer = require('inquirer');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const CLIException = require('../CLIException');
const CommandUtils = require('../utils/CommandUtils');
const NodeUtils = require('../utils/NodeUtils');
const OBJECT_TYPES = require('../metadata/ObjectTypesMetadata');
const ProjectContextService = require('../services/ProjectContextService');
const SDKExecutionContext = require('../SDKExecutor').SDKExecutionContext;
const TranslationService = require('../services/TranslationService');
const COMMAND_OPTIONS_NAMES = {
	APP_ID: 'appid',
	SCRIPT_ID: 'scriptid',
	SPECIFY_SCRIPT_ID: 'specifyscriptid',
	SPECIFY_SUITEAPP: 'specifysuiteapp',
	TYPE: 'type',
	TYPE_ALL: 'typeall',
};
const { MANIFEST_XML, PROJECT_SUITEAPP } = require('../ApplicationConstants');
const {
	COMMAND_LISTOBJECTS: { QUESTIONS },
	ERRORS,
	YES,
	NO,
} = require('../services/TranslationKeys');

module.exports = class ListObjectsCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
	}

	_validateFieldIsNotEmpty(fieldName) {
		return fieldName !== ''
			? true
			: NodeUtils.formatString(TranslationService.getMessage(ERRORS.EMPTY_FIELD), {
					color: NodeUtils.COLORS.RED,
					bold: true,
			  });
	}

	_validateArrayIsNotEmpty(array) {
		return array.length > 0
			? true
			: NodeUtils.formatString(TranslationService.getMessage(ERRORS.CHOOSE_OPTION), {
					color: NodeUtils.COLORS.RED,
					bold: true,
			  });
	}

	_getCommandQuestions(prompt) {
		var questions = [];
		//create a class to see type based on manifest.
		if (ProjectContextService.getProjectType() === PROJECT_SUITEAPP) {
			let message = TranslationService.getMessage(QUESTIONS.SPECIFIC_APPID);

			const questionSpecificSuiteApp = {
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND_OPTIONS_NAMES.SPECIFY_SUITEAPP,
				message,
				default: 0,
				choices: [
					{
						name: TranslationService.getMessage(YES),
						value: true,
					},
					{
						name: TranslationService.getMessage(NO),
						value: false,
					},
				],
				validate: this._validateArrayIsNotEmpty,
			};
			questions.push(questionSpecificSuiteApp);

			const questionAppId = {
				when: function(response) {
					return response.specifysuiteapp;
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: COMMAND_OPTIONS_NAMES.APP_ID,
				message: TranslationService.getMessage(QUESTIONS.APPID),
				validate: this._validateFieldIsNotEmpty,
			};
			questions.push(questionAppId);
		}

		const questionFilterByCustomObjects = {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: COMMAND_OPTIONS_NAMES.TYPE_ALL,
			message: TranslationService.getMessage(QUESTIONS.SHOW_ALL_CUSTOM_OBJECTS),
			default: 0,
			choices: [
				{
					name: TranslationService.getMessage(YES),
					value: true,
				},
				{
					name: TranslationService.getMessage(NO),
					value: false,
				},
			],
		};
		questions.push(questionFilterByCustomObjects);

		const questionCustomOjects = {
			when: function(answers) {
				return !answers.typeall;
			},
			type: CommandUtils.INQUIRER_TYPES.CHECKBOX,
			name: COMMAND_OPTIONS_NAMES.TYPE,
			message: TranslationService.getMessage(QUESTIONS.FILTER_BY_CUSTOM_OBJECTS),
			pageSize: 15,
			choices: [
				...OBJECT_TYPES.map(customObject => ({
					name: customObject.name,
					value: customObject.value.type,
				})),
				new inquirer.Separator(),
			],

			validate: this._validateArrayIsNotEmpty,
		};

		questions.push(questionCustomOjects);

		const questionSpecificScriptId = {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: COMMAND_OPTIONS_NAMES.SPECIFY_SCRIPT_ID,
			message: TranslationService.getMessage(QUESTIONS.FILTER_BY_SCRIPT_ID),
			default: false,
			choices: [
				{
					name: TranslationService.getMessage(YES),
					value: true,
				},
				{
					name: TranslationService.getMessage(NO),
					value: false,
				},
			],
		};
		questions.push(questionSpecificScriptId);

		const questionScriptId = {
			when: function(response) {
				return response.specifyscriptid;
			},
			type: CommandUtils.INQUIRER_TYPES.INPUT,
			name: COMMAND_OPTIONS_NAMES.SCRIPT_ID,
			message: TranslationService.getMessage(QUESTIONS.SCRIPT_ID),
			validate: this._validateFieldIsNotEmpty,
		};
		questions.push(questionScriptId);

		return prompt(questions);
	}

	_executeAction(answers) {
		let options = Object.keys(this._commandMetadata.options);
		var params = CommandUtils.extractOnlyOptionsFromObject(answers, options);
		if (params.type != null) {
			params.type = params.type.join(' ');
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
				TranslationService.getMessage(
					ERRORS.RUN_SETUP_ACCOUNT,
					MANIFEST_XML,
					this._projectFolder
				)
			);
		}
	}
};
