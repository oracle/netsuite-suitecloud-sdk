/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { prompt } = require('inquirer');
const CommandUtils = require('../../utils/CommandUtils');
const NodeTranslationService = require('../../services/NodeTranslationService');
const { executeWithSpinner } = require('../../ui/CliSpinner');
const SdkOperationResultUtils = require('../../utils/SdkOperationResultUtils');
const SdkExecutionContext = require('../../SdkExecutionContext');
const ProjectInfoService = require('../../services/ProjectInfoService');
const { PROJECT_SUITEAPP } = require('../../ApplicationConstants');
const BaseInputHandler = require('../base/BaseInputHandler');
const SdkExecutor = require('../../SdkExecutor');
const AuthenticationService = require('../../core/authentication/AuthenticationService');
const { validateArrayIsNotEmpty, showValidationResults } = require('../../validation/InteractiveAnswersValidator');

const {
	COMMAND_IMPORTFILES: { ERRORS, QUESTIONS, MESSAGES },
	NO,
	YES,
} = require('../../services/TranslationKeys');

const SUITE_SCRIPTS_FOLDER = '/SuiteScripts';
const COMMAND_OPTIONS = {
	FOLDER: 'folder',
	PATHS: 'paths',
	EXCLUDE_PROPERTIES: 'excludeproperties',
	PROJECT: 'project',
};
const INTERMEDIATE_COMMANDS = {
	LISTFILES: 'listfiles',
	LISTFOLDERS: 'listfolders',
};
const COMMAND_ANSWERS = {
	OVERWRITE_FILES: 'overwrite',
};

module.exports = class ImportFilesInputHandler extends BaseInputHandler {
	constructor(options) {
		super(options);
		// TODO input handlers shouldn't execute actions. rework this
		this._sdkExecutor = new SDKExecutor(new AuthenticationService(this._executionPath));

		this._projectInfoService = new ProjectInfoService(this._projectFolder);
	}

	async getParameters(params) {
		if (this._projectInfoService.getProjectType() === PROJECT_SUITEAPP) {
			throw NodeTranslationService.getMessage(ERRORS.IS_SUITEAPP);
		}

		const listFoldersResult = await this._listFolders();

		if (listFoldersResult.status === SdkOperationResultUtils.STATUS.ERROR) {
			throw SdkOperationResultUtils.collectErrorMessages(listFoldersResult);
		}

		const selectFolderQuestion = this._generateSelectFolderQuestion(listFoldersResult);
		const selectFolderAnswer = await prompt([selectFolderQuestion]);
		const listFilesResult = await this._listFiles(selectFolderAnswer);

		if (listFilesResult.status === SdkOperationResultUtils.STATUS.ERROR) {
			throw SdkOperationResultUtils.collectErrorMessages(listFilesResult);
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

	_listFolders() {
		const executionContext = new SdkExecutionContext({
			command: INTERMEDIATE_COMMANDS.LISTFOLDERS,
			includeProjectDefaultAuthId: true,
		});

		return executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: NodeTranslationService.getMessage(MESSAGES.LOADING_FOLDERS),
		});
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
		return listFoldersResponse.data.map((folder) => ({
			name: folder.path,
			value: folder.path,
			disabled: folder.isRestricted ? NodeTranslationService.getMessage(MESSAGES.RESTRICTED_FOLDER) : '',
		}));
	}

	_listFiles(selectFolderAnswer) {
		// quote folder path to preserve spaces
		selectFolderAnswer.folder = CommandUtils.quoteString(selectFolderAnswer.folder);
		const executionContext = new SdkExecutionContext({
			command: INTERMEDIATE_COMMANDS.LISTFILES,
			includeProjectDefaultAuthId: true,
			params: selectFolderAnswer,
		});

		return executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: NodeTranslationService.getMessage(MESSAGES.LOADING_FILES),
		});
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
