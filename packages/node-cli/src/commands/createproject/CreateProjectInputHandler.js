/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { prompt } = require('inquirer');
const NodeTranslationService = require('../../services/NodeTranslationService');
const CommandUtils = require('../../utils/CommandUtils');
const ApplicationConstants = require('../../ApplicationConstants');
const FileSystemService = require('../../services/FileSystemService');

const COMMAND_OPTIONS = {
	OVERWRITE: 'overwrite',
	PARENT_DIRECTORY: 'parentdirectory',
	PROJECT_ID: 'projectid',
	PROJECT_NAME: 'projectname',
	PROJECT_VERSION: 'projectversion',
	PUBLISHER_ID: 'publisherid',
	TYPE: 'type',
	INCLUDE_UNIT_TESTING: 'includeunittesting',
};

const ACP_PROJECT_TYPE_DISPLAY = 'Account Customization Project';
const SUITEAPP_PROJECT_TYPE_DISPLAY = 'SuiteApp';
const DEFAULT_PROJECT_VERSION = '1.0.0';

module.exports = class CreateObjectInputHandler {
	constructor(options) {
		this._executionPath = options.projectFolder;
		this._fileSystemService = new FileSystemService();
	}

	async getParameters() {
		const answers = await prompt([
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND_OPTIONS.TYPE,
				message: NodeTranslationService.getMessage(QUESTIONS.CHOOSE_PROJECT_TYPE),
				default: 0,
				choices: [
					{
						name: ACP_PROJECT_TYPE_DISPLAY,
						value: ApplicationConstants.PROJECT_ACP,
					},
					{
						name: SUITEAPP_PROJECT_TYPE_DISPLAY,
						value: ApplicationConstants.PROJECT_SUITEAPP,
					},
				],
			},
			{
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: COMMAND_OPTIONS.PROJECT_NAME,
				message: NodeTranslationService.getMessage(QUESTIONS.ENTER_PROJECT_NAME),
				filter: (fieldValue) => fieldValue.trim(),
				validate: (fieldValue) => showValidationResults(fieldValue, validateFieldIsNotEmpty, validateFolder),
			},
			{
				when: function (response) {
					return response[COMMAND_OPTIONS.TYPE] === ApplicationConstants.PROJECT_SUITEAPP;
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: COMMAND_OPTIONS.PUBLISHER_ID,
				message: NodeTranslationService.getMessage(QUESTIONS.ENTER_PUBLISHER_ID),
				validate: (fieldValue) => showValidationResults(fieldValue, validatePublisherId),
			},
			{
				when: function (response) {
					return response.type === ApplicationConstants.PROJECT_SUITEAPP;
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: COMMAND_OPTIONS.PROJECT_ID,
				message: NodeTranslationService.getMessage(QUESTIONS.ENTER_PROJECT_ID),
				validate: (fieldValue) =>
					showValidationResults(fieldValue, validateFieldIsNotEmpty, validateFieldHasNoSpaces, (fieldValue) =>
						validateFieldIsLowerCase(COMMAND_OPTIONS.PROJECT_ID, fieldValue)
					),
			},
			{
				when: function (response) {
					return response.type === ApplicationConstants.PROJECT_SUITEAPP;
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: COMMAND_OPTIONS.PROJECT_VERSION,
				message: NodeTranslationService.getMessage(QUESTIONS.ENTER_PROJECT_VERSION),
				default: DEFAULT_PROJECT_VERSION,
				validate: (fieldValue) => showValidationResults(fieldValue, validateProjectVersion),
			},
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND_OPTIONS.INCLUDE_UNIT_TESTING,
				message: NodeTranslationService.getMessage(QUESTIONS.INCLUDE_UNIT_TESTING),
				default: 0,
				choices: [
					{ name: NodeTranslationService.getMessage(YES), value: true },
					{ name: NodeTranslationService.getMessage(NO), value: false },
				],
			},
		]);

		const projectFolderName = this._getProjectFolderName(answers);
		const projectAbsolutePath = path.join(this._executionPath, projectFolderName);

		if (this._fileSystemService.folderExists(projectAbsolutePath) && !this._fileSystemService.isFolderEmpty(projectAbsolutePath)) {
			const overwriteAnswer = await prompt([
				{
					type: CommandUtils.INQUIRER_TYPES.LIST,
					name: COMMAND_OPTIONS.OVERWRITE,
					message: NodeTranslationService.getMessage(QUESTIONS.OVERWRITE_PROJECT, projectAbsolutePath),
					default: 0,
					choices: [
						{ name: NodeTranslationService.getMessage(NO), value: false },
						{ name: NodeTranslationService.getMessage(YES), value: true },
					],
				},
			]);
			answers[COMMAND_OPTIONS.OVERWRITE] = overwriteAnswer[COMMAND_OPTIONS.OVERWRITE];
			if (!overwriteAnswer[COMMAND_OPTIONS.OVERWRITE]) {
				throw NodeTranslationService.getMessage(MESSAGES.PROJECT_CREATION_CANCELED);
			}
		}
		return answers;
	}

	_getProjectFolderName(answers) {
		return answers[COMMAND_OPTIONS.TYPE] === ApplicationConstants.PROJECT_SUITEAPP
			? answers[COMMAND_OPTIONS.PUBLISHER_ID] + '.' + answers[COMMAND_OPTIONS.PROJECT_ID]
			: answers[COMMAND_OPTIONS.PROJECT_NAME];
	}
};
