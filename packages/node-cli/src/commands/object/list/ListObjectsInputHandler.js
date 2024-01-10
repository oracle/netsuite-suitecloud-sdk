/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { prompt, Separator } = require('inquirer');
const CommandUtils = require('../../../utils/CommandUtils');
const OBJECT_TYPES = require('../../../metadata/ObjectTypesMetadata');
const ProjectInfoService = require('../../../services/ProjectInfoService');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const { PROJECT_SUITEAPP } = require('../../../ApplicationConstants');
const BaseInputHandler = require('../../base/BaseInputHandler');
const {
	validateArrayIsNotEmpty,
	validateFieldIsNotEmpty,
	validateSuiteApp,
	showValidationResults,
} = require('../../../validation/InteractiveAnswersValidator');
const {
	COMMAND_LISTOBJECTS: { QUESTIONS },
	YES,
	NO,
} = require('../../../services/TranslationKeys');

const COMMAND_QUESTIONS_NAMES = {
	APP_ID: 'appid',
	SCRIPT_ID: 'scriptid',
	SPECIFY_SCRIPT_ID: 'specifyscriptid',
	SPECIFY_SUITEAPP: 'specifysuiteapp',
	TYPE: 'type',
	TYPE_ALL: 'typeall',
};

module.exports = class ListObjectsInputHandler extends BaseInputHandler {
	constructor(options) {
		super(options);
		this._projectInfoService = new ProjectInfoService(this._projectFolder);
	}

	async getParameters(params) {
		const questions = [];
		//create a class to see type based on manifest.
		if (this._projectInfoService.getProjectType() === PROJECT_SUITEAPP) {
			let message = NodeTranslationService.getMessage(QUESTIONS.SPECIFIC_APPID);

			const questionSpecificSuiteApp = {
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND_QUESTIONS_NAMES.SPECIFY_SUITEAPP,
				message,
				default: 0,
				choices: [
					{
						name: NodeTranslationService.getMessage(YES),
						value: true,
					},
					{
						name: NodeTranslationService.getMessage(NO),
						value: false,
					},
				],
				validate: (fieldValue) => showValidationResults(fieldValue, validateFieldIsNotEmpty),
			};
			questions.push(questionSpecificSuiteApp);

			const questionAppId = {
				when: function (response) {
					return response.specifysuiteapp;
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: COMMAND_QUESTIONS_NAMES.APP_ID,
				message: NodeTranslationService.getMessage(QUESTIONS.APPID),
				validate: (fieldValue) => showValidationResults(fieldValue, validateSuiteApp),
			};
			questions.push(questionAppId);
		}

		const questionFilterByCustomObjects = {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: COMMAND_QUESTIONS_NAMES.TYPE_ALL,
			message: NodeTranslationService.getMessage(QUESTIONS.SHOW_ALL_CUSTOM_OBJECTS),
			default: 0,
			choices: [
				{
					name: NodeTranslationService.getMessage(YES),
					value: true,
				},
				{
					name: NodeTranslationService.getMessage(NO),
					value: false,
				},
			],
		};
		questions.push(questionFilterByCustomObjects);

		const questionCustomObjects = {
			when: function (answers) {
				return !answers.typeall;
			},
			type: CommandUtils.INQUIRER_TYPES.CHECKBOX,
			name: COMMAND_QUESTIONS_NAMES.TYPE,
			message: NodeTranslationService.getMessage(QUESTIONS.FILTER_BY_CUSTOM_OBJECTS),
			pageSize: 15,
			choices: [
				...OBJECT_TYPES.map((customObject) => ({
					name: customObject.name,
					value: customObject.value.type,
				})),
				new Separator(),
			],

			validate: (fieldValue) => showValidationResults(fieldValue, validateArrayIsNotEmpty),
		};

		questions.push(questionCustomObjects);

		const questionSpecificScriptId = {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: COMMAND_QUESTIONS_NAMES.SPECIFY_SCRIPT_ID,
			message: NodeTranslationService.getMessage(QUESTIONS.FILTER_BY_SCRIPT_ID),
			default: false,
			choices: [
				{
					name: NodeTranslationService.getMessage(YES),
					value: true,
				},
				{
					name: NodeTranslationService.getMessage(NO),
					value: false,
				},
			],
		};
		questions.push(questionSpecificScriptId);

		const questionScriptId = {
			when: function (response) {
				return response.specifyscriptid;
			},
			type: CommandUtils.INQUIRER_TYPES.INPUT,
			name: COMMAND_QUESTIONS_NAMES.SCRIPT_ID,
			message: NodeTranslationService.getMessage(QUESTIONS.SCRIPT_ID),
			validate: (fieldValue) => showValidationResults(fieldValue, validateFieldIsNotEmpty),
		};
		questions.push(questionScriptId);
		let answers = await prompt(questions);
		return answers;
	}
};
