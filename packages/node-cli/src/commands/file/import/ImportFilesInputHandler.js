/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const CommandUtils = require('../../../utils/CommandUtils');
const { prompt } = require('inquirer');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');
const AccountFileCabinetService = require('../../../services/AccountFileCabinetService');
const ProjectInfoService = require('../../../services/ProjectInfoService');
const { PROJECT_SUITEAPP } = require('../../../ApplicationConstants');
const { getProjectDefaultAuthId } = require('../../../utils/AuthenticationUtils');
const BaseInputHandler = require('../../base/BaseInputHandler');
const SdkExecutor = require('../../../SdkExecutor');
const { showValidationResults, validateArrayIsNotEmpty } = require('../../../validation/InteractiveAnswersValidator');
const {
	COMMAND_IMPORTFILES: { ERRORS, QUESTIONS, MESSAGES },
	NO,
	YES,
} = require('../../../services/TranslationKeys');

const SUITE_SCRIPTS_FOLDER = '/SuiteScripts';
const COMMAND_OPTIONS = {
	AUTH_ID: 'authid',
	FOLDER: 'folder',
	PATHS: 'paths',
	EXCLUDE_PROPERTIES: 'excludeproperties',
	PROJECT: 'project',
};

const COMMAND_ANSWERS = {
	OVERWRITE_FILES: 'overwrite',
};

module.exports = class ImportFilesInputHandler extends BaseInputHandler {
	constructor(options) {
		super(options);
		// TODO input handlers shouldn't execute actions. rework this
		this._sdkExecutor = new SdkExecutor(this._sdkPath, this._executionEnvironmentContext);

		this._projectInfoService = new ProjectInfoService(this._projectFolder);
		this._authId = getProjectDefaultAuthId(this._executionPath);
	}

	async getParameters(params) {
		if (this._projectInfoService.getProjectType() === PROJECT_SUITEAPP) {
			throw NodeTranslationService.getMessage(ERRORS.IS_SUITEAPP);
		}

		const accountFileCabinetService = new AccountFileCabinetService(this._sdkPath, this._executionEnvironmentContext, this._authId);
		
		const listFoldersResult = await accountFileCabinetService.getAccountFileCabinetFolders();
		if (listFoldersResult.length === 0) {
			throw NodeTranslationService.getMessage(ERRORS.NO_FOLDERS_FOUND);
		}

		const selectFolderQuestion = this._generateSelectFolderQuestion(listFoldersResult);
		const selectFolderAnswer = await prompt([selectFolderQuestion]);
		const listFilesResult = await accountFileCabinetService.listFiles(selectFolderAnswer.folder);

		if (listFilesResult.status === SdkOperationResultUtils.STATUS.ERROR) {
			throw listFilesResult.errorMessages;
		}
		if (Array.isArray(listFilesResult.data) && listFilesResult.data.length === 0) {
			throw SdkOperationResultUtils.getResultMessage(listFilesResult);
		}

		const selectFilesQuestions = this._generateSelectFilesQuestions(listFilesResult);
		const selectFilesAnswer = await prompt(selectFilesQuestions);

		const overwriteAnswer = await prompt([this._generateOverwriteQuestion()]);
		if (overwriteAnswer[COMMAND_ANSWERS.OVERWRITE_FILES] === false) {
			throw NodeTranslationService.getMessage(MESSAGES.CANCEL_IMPORT);
		}

		return selectFilesAnswer;
	}

	_generateSelectFolderQuestion(listFoldersResult) {
		return {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: COMMAND_OPTIONS.FOLDER,
			message: NodeTranslationService.getMessage(QUESTIONS.SELECT_FOLDER),
			default: SUITE_SCRIPTS_FOLDER,
			choices: this._getFileCabinetFolders(listFoldersResult),
		};
	}

	_getFileCabinetFolders(listFoldersResponse) {
		return listFoldersResponse.map((folderPath) => ({
			name: folderPath,
			value: folderPath,
		}));
	}

	_generateSelectFilesQuestions(listFilesResult) {
		return [
			{
				type: CommandUtils.INQUIRER_TYPES.CHECKBOX,
				name: COMMAND_OPTIONS.PATHS,
				message: NodeTranslationService.getMessage(QUESTIONS.SELECT_FILES),
				choices: listFilesResult.data.map((path) => ({ name: path, value: path })),
				validate: (fieldValue) => showValidationResults(fieldValue, validateArrayIsNotEmpty),
			},
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND_OPTIONS.EXCLUDE_PROPERTIES,
				message: NodeTranslationService.getMessage(QUESTIONS.EXCLUDE_PROPERTIES),
				choices: [
					{ name: NodeTranslationService.getMessage(YES), value: true },
					{ name: NodeTranslationService.getMessage(NO), value: false },
				],
			},
		];
	}

	_generateOverwriteQuestion() {
		return {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: COMMAND_ANSWERS.OVERWRITE_FILES,
			message: NodeTranslationService.getMessage(QUESTIONS.OVERWRITE_FILES),
			default: 0,
			choices: [
				{ name: NodeTranslationService.getMessage(YES), value: true },
				{ name: NodeTranslationService.getMessage(NO), value: false },
			],
		};
	}
};
