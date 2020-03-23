/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const CommandUtils = require('../utils/CommandUtils');
const { executeWithSpinner } = require('../ui/CliSpinner');
const FileSystemService = require('../services/FileSystemService');
const NodeUtils = require('../utils/NodeUtils');
const path = require('path');
const ProjectInfoService = require('../services/ProjectInfoService');
const { pathIsUnrestricted } = require('../validation/FileCabinetValidator');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const SDKExecutionContext = require('../SDKExecutionContext');
const TranslationService = require('../services/TranslationService');

const {
	COMMAND_UPLOADFILES: { QUESTIONS, MESSAGES, OUTPUT },
	NO,
	YES,
} = require('../services/TranslationKeys');

const ApplicationConstants = require('../ApplicationConstants');

const COMMAND_OPTIONS = {
	PATHS: 'paths',
	PROJECT: 'project',
};

const COMMAND_ANSWERS = {
	SELECTED_FOLDER: 'selectedFolder',
	OVERWRITE_FILES: 'overwrite',
};

const UPLOAD_FILE_RESULT_STATUS = {
	SUCCESS: 'SUCCESS',
	ERROR: 'ERROR',
};

const { validateArrayIsNotEmpty, showValidationResults } = require('../validation/InteractiveAnswersValidator');

module.exports = class UploadFilesCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._projectInfoService = new ProjectInfoService(this._projectFolder);
		this._fileSystemService = new FileSystemService();
		this.localFileCabinetFolder = path.join(this._projectFolder, ApplicationConstants.FOLDERS.FILE_CABINET);
	}

	async _getCommandQuestions(prompt) {
		const selectFolderQuestion = this._generateSelectFolderQuestion();
		const selectFolderAnswer = await prompt(selectFolderQuestion);

		const selectFilesQuestion = this._generateSelectFilesQuestion(selectFolderAnswer.selectedFolder);
		const selectFilesAnswer = await prompt(selectFilesQuestion);

		const overwriteAnswer = await prompt([this._generateOverwriteQuestion()]);
		if (overwriteAnswer[COMMAND_ANSWERS.OVERWRITE_FILES] === false) {
			throw TranslationService.getMessage(MESSAGES.CANCEL_UPLOAD);
		}

		return selectFilesAnswer;
	}

	_generateSelectFolderQuestion() {
		const localFileCabinetSubFolders = this._fileSystemService.getFoldersFromDirectoryRecursively(this.localFileCabinetFolder);

		const transformFoldersToChoicesFunc = folder => {
			const name = this._getFileCabinetRelativePath(folder);

			let disabledMessage = '';
			if (!pathIsUnrestricted(name)) {
				disabledMessage = TranslationService.getMessage(MESSAGES.RESTRICTED_FOLDER);
			} else if (!this._fileSystemService.getFilesFromDirectory(folder).length) {
				disabledMessage = TranslationService.getMessage(MESSAGES.EMPTY_FOLDER);
			}

			return {
				name: name,
				value: folder,
				disabled: disabledMessage,
			};
		};

		const localFileCabinetFoldersChoices = localFileCabinetSubFolders.map(transformFoldersToChoicesFunc);

		return [
			{
				message: TranslationService.getMessage(QUESTIONS.SELECT_FOLDER),
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND_ANSWERS.SELECTED_FOLDER,
				choices: localFileCabinetFoldersChoices,
			},
		];
	}

	_generateSelectFilesQuestion(selectedFolder) {
		const files = this._fileSystemService.getFilesFromDirectory(selectedFolder);

		const transformFilesToChoicesFunc = file => {
			const path = this._getFileCabinetRelativePath(file);
			return { name: path, value: path };
		};
		const filesChoices = files.map(transformFilesToChoicesFunc);

		return [
			{
				message: TranslationService.getMessage(QUESTIONS.SELECT_FILES),
				type: CommandUtils.INQUIRER_TYPES.CHECKBOX,
				name: COMMAND_OPTIONS.PATHS,
				choices: filesChoices,
				validate: fieldValue => showValidationResults(fieldValue, validateArrayIsNotEmpty),
			},
		];
	}

	_getFileCabinetRelativePath(file) {
		return file.replace(this.localFileCabinetFolder, '').replace(/\\/g, '/');
	}

	_generateOverwriteQuestion() {
		return {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: COMMAND_ANSWERS.OVERWRITE_FILES,
			message: TranslationService.getMessage(QUESTIONS.OVERWRITE_FILES),
			default: 0,
			choices: [
				{ name: TranslationService.getMessage(YES), value: true },
				{ name: TranslationService.getMessage(NO), value: false },
			],
		};
	}

	_preExecuteAction(answers) {
		const { PROJECT, PATHS } = COMMAND_OPTIONS;
		answers[PROJECT] = CommandUtils.quoteString(this._projectFolder);
		if (answers.hasOwnProperty(PATHS)) {
			if (Array.isArray(answers[PATHS])) {
				answers[PATHS] = answers[PATHS].map(CommandUtils.quoteString).join(' ');
			} else {
				answers[PATHS] = CommandUtils.quoteString(answers[PATHS]);
			}
		}
		return answers;
	}

	_executeAction(answers) {
		const executionContextUploadFiles = new SDKExecutionContext({
			command: this._commandMetadata.sdkCommand,
			includeProjectDefaultAuthId: true,
			params: answers,
		});

		return executeWithSpinner({
			action: this._sdkExecutor.execute(executionContextUploadFiles),
			message: TranslationService.getMessage(MESSAGES.UPLOADING_FILES),
		});
	}

	_formatOutput(operationResult) {
		const { data } = operationResult;

		if (SDKOperationResultUtils.hasErrors(operationResult)) {
			SDKOperationResultUtils.logResultMessage(operationResult);
			SDKOperationResultUtils.logErrors(operationResult);
			return;
		}

		if (Array.isArray(data)) {
			const successfulUploads = data.filter(result => result.type === UPLOAD_FILE_RESULT_STATUS.SUCCESS);
			const unsuccessfulUploads = data.filter(result => result.type === UPLOAD_FILE_RESULT_STATUS.ERROR);
			if (Array.isArray(successfulUploads) && successfulUploads.length) {
				NodeUtils.println(TranslationService.getMessage(OUTPUT.FILES_UPLOADED), NodeUtils.COLORS.RESULT);
				successfulUploads.forEach(result => {
					NodeUtils.println(this._getFileCabinetRelativePath(result.file.path), NodeUtils.COLORS.RESULT);
				});
			}
			if (Array.isArray(unsuccessfulUploads) && unsuccessfulUploads.length) {
				NodeUtils.println(TranslationService.getMessage(OUTPUT.FILES_NOT_UPLOADED), NodeUtils.COLORS.WARNING);
				unsuccessfulUploads.forEach(result => {
					NodeUtils.println(`${this._getFileCabinetRelativePath(result.file.path)}: ${result.errorMessage}`, NodeUtils.COLORS.WARNING);
				});
			}
		}
	}
};
