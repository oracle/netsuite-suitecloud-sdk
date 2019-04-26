'use strict';

const inquirer = require('inquirer');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const CommandUtils = require('../utils/CommandUtils');
const executeWithSpinner = require('../ui/CliSpinner').executeWithSpinner;
const NodeUtils = require('../utils/NodeUtils');
const OBJECT_TYPES = require('../metadata/ObjectTypesMetadata');
const ProjectMetadataService = require('../services/ProjectMetadataService');
const SDKExecutionContext = require('../SDKExecutionContext');
const TranslationService = require('../services/TranslationService');
const OperationResult = require('./OperationResultStatus');
const {
	validateArrayIsNotEmpty,
	validateFieldIsNotEmpty,
	validateSuiteApp,
	showValidationResults,
} = require('../validation/InteractiveAnswersValidator');
const COMMAND_QUESTIONS_NAMES = {
	APP_ID: 'appid',
	SCRIPT_ID: 'scriptid',
	SPECIFY_SCRIPT_ID: 'specifyscriptid',
	SPECIFY_SUITEAPP: 'specifysuiteapp',
	TYPE: 'type',
	TYPE_ALL: 'typeall',
};
const { PROJECT_SUITEAPP } = require('../ApplicationConstants');
const {
	COMMAND_LISTOBJECTS: { LISTING_OBJECTS, QUESTIONS, SUCCESS_OBJECTS_IMPORTED, SUCCESS_NO_OBJECTS },
	YES,
	NO,
	ERRORS,
} = require('../services/TranslationKeys');

module.exports = class ListObjectsCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._projectMetadataService = new ProjectMetadataService();
	}

	_getCommandQuestions(prompt) {
		var questions = [];
		//create a class to see type based on manifest.
		if (this._projectMetadataService.getProjectType(this._projectFolder) === PROJECT_SUITEAPP) {
			let message = TranslationService.getMessage(QUESTIONS.SPECIFIC_APPID);

			const questionSpecificSuiteApp = {
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND_QUESTIONS_NAMES.SPECIFY_SUITEAPP,
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
				validate: fieldValue => showValidationResults(fieldValue, validateFieldIsNotEmpty),
			};
			questions.push(questionSpecificSuiteApp);

			const questionAppId = {
				when: function(response) {
					return response.specifysuiteapp;
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: COMMAND_QUESTIONS_NAMES.APP_ID,
				message: TranslationService.getMessage(QUESTIONS.APPID),
				validate: fieldValue => showValidationResults(fieldValue, validateSuiteApp),
			};
			questions.push(questionAppId);
		}

		const questionFilterByCustomObjects = {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: COMMAND_QUESTIONS_NAMES.TYPE_ALL,
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

		const questionCustomObjects = {
			when: function(answers) {
				return !answers.typeall;
			},
			type: CommandUtils.INQUIRER_TYPES.CHECKBOX,
			name: COMMAND_QUESTIONS_NAMES.TYPE,
			message: TranslationService.getMessage(QUESTIONS.FILTER_BY_CUSTOM_OBJECTS),
			pageSize: 15,
			choices: [
				...OBJECT_TYPES.map(customObject => ({
					name: customObject.name,
					value: customObject.value.type,
				})),
				new inquirer.Separator(),
			],

			validate: fieldValue => showValidationResults(fieldValue, validateArrayIsNotEmpty),
		};

		questions.push(questionCustomObjects);

		const questionSpecificScriptId = {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: COMMAND_QUESTIONS_NAMES.SPECIFY_SCRIPT_ID,
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
			name: COMMAND_QUESTIONS_NAMES.SCRIPT_ID,
			message: TranslationService.getMessage(QUESTIONS.SCRIPT_ID),
			validate: fieldValue => showValidationResults(fieldValue, validateFieldIsNotEmpty),
		};
		questions.push(questionScriptId);

		return prompt(questions);
	}

	_executeAction(answers) {
		let options = Object.keys(this._commandMetadata.options);
		var params = CommandUtils.extractOnlyOptionsFromObject(answers, options);
		if (params.type && params.type instanceof Array) {
			params.type = params.type.join(' ');
		}
		let executionContext = new SDKExecutionContext({
			command: this._commandMetadata.name,
			params,
			showOutput: false,
		});

		const actionListObjects = this._sdkExecutor.execute(executionContext);

		return executeWithSpinner({
			action: actionListObjects,
			message: TranslationService.getMessage(LISTING_OBJECTS),
		});
	}

	_formatOutput(operationResult) {
		const { status, messages, data } = operationResult;

		if (status == OperationResult.ERROR) {
			if (messages instanceof Array && messages.length > 0) {
				messages.forEach(message => NodeUtils.println(message, NodeUtils.COLORS.ERROR));
			} else {
				NodeUtils.println(TranslationService.getMessage(ERRORS.PROCESS_FAILED), NodeUtils.COLORS.ERROR);
			}
			return;
		}

		if (messages) {
			messages.forEach(message => NodeUtils.println(message, NodeUtils.COLORS.RESULT));
		}

		if (data.length) {
			NodeUtils.println(TranslationService.getMessage(SUCCESS_OBJECTS_IMPORTED), NodeUtils.COLORS.RESULT);
			data.forEach(el => NodeUtils.println(`${el.type}:${el.scriptId}`, NodeUtils.COLORS.RESULT));
		} else {
			NodeUtils.println(TranslationService.getMessage(SUCCESS_NO_OBJECTS), NodeUtils.COLORS.RESULT);
		}
	}
};
