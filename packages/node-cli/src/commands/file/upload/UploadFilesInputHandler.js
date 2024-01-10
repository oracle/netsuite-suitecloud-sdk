/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { prompt } = require('inquirer');
const BaseInputHandler = require('../../base/BaseInputHandler');
const CommandUtils = require('../../../utils/CommandUtils');
const FileCabinetService = require('../../../services/FileCabinetService');
const FileSystemService = require('../../../services/FileSystemService');
const path = require('path');
const NodeTranslationService = require('../../../services/NodeTranslationService');

const {
	COMMAND_UPLOADFILES: { QUESTIONS, MESSAGES, ERRORS },
	NO,
	YES,
} = require('../../../services/TranslationKeys');

const { FILE_CABINET } = require('../../../ApplicationConstants').FOLDERS;
const { validateArrayIsNotEmpty, showValidationResults } = require('../../../validation/InteractiveAnswersValidator');

const COMMAND_OPTIONS = {
	PATHS: 'paths',
	PROJECT: 'project',
	AUTH_ID: 'authid',
};

const COMMAND_ANSWERS = {
	SELECTED_FOLDER: 'selectedFolder',
	OVERWRITE_FILES: 'overwrite',
};

module.exports = class UploadFilesInputHandler extends BaseInputHandler {
	constructor(options) {
		super(options);
		this._fileSystemService = new FileSystemService();
		this._fileCabinetService = new FileCabinetService(path.join(this._projectFolder, FILE_CABINET));
	}

	async getParameters(params) {
		const selectFolderQuestion = this._generateSelectFolderQuestion();
		const selectFolderAnswer = await prompt(selectFolderQuestion);

		const selectFilesQuestion = this._generateSelectFilesQuestion(selectFolderAnswer.selectedFolder);
		const selectFilesAnswer = await prompt(selectFilesQuestion);

		const overwriteAnswer = await prompt([this._generateOverwriteQuestion()]);
		if (overwriteAnswer[COMMAND_ANSWERS.OVERWRITE_FILES] === false) {
			throw NodeTranslationService.getMessage(MESSAGES.CANCEL_UPLOAD);
		}

		return selectFilesAnswer;
	}

	_generateSelectFolderQuestion() {
		const localFileCabinetSubFolders = this._fileCabinetService.getFileCabinetFolders();

		const transformFoldersToChoicesFunc = (folder) => {
			const name = this._fileCabinetService.getFileCabinetRelativePath(folder);

			let disabledMessage = '';
			if (!this._fileCabinetService.isUnrestrictedPath(name)) {
				disabledMessage = NodeTranslationService.getMessage(MESSAGES.RESTRICTED_FOLDER);
			} else if (!this._fileSystemService.getFilesFromDirectory(folder).length) {
				disabledMessage = NodeTranslationService.getMessage(MESSAGES.EMPTY_FOLDER);
			}

			return {
				name: name,
				value: folder,
				disabled: disabledMessage,
			};
		};

		const localFileCabinetFoldersChoices = localFileCabinetSubFolders.map(transformFoldersToChoicesFunc);

		if (!localFileCabinetFoldersChoices.some((choice) => !choice.disabled)) {
			throw NodeTranslationService.getMessage(MESSAGES.NOTHING_TO_UPLOAD);
		}

		return [
			{
				message: NodeTranslationService.getMessage(QUESTIONS.SELECT_FOLDER),
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND_ANSWERS.SELECTED_FOLDER,
				choices: localFileCabinetFoldersChoices,
			},
		];
	}

	_generateSelectFilesQuestion(selectedFolder) {
		const files = this._fileSystemService.getFilesFromDirectory(selectedFolder);

		const transformFilesToChoicesFunc = (file) => {
			const path = this._fileCabinetService.getFileCabinetRelativePath(file);
			return { name: path, value: path };
		};
		const filesChoices = files.map(transformFilesToChoicesFunc);

		return [
			{
				message: NodeTranslationService.getMessage(QUESTIONS.SELECT_FILES),
				type: CommandUtils.INQUIRER_TYPES.CHECKBOX,
				name: COMMAND_OPTIONS.PATHS,
				choices: filesChoices,
				validate: (fieldValue) => showValidationResults(fieldValue, validateArrayIsNotEmpty),
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
