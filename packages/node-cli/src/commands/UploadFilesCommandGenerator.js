/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const CommandUtils = require('../utils/CommandUtils');
const { executeWithSpinner } = require('../ui/CliSpinner');
const FileCabinetService = require('../services/FileCabinetService');
const FileSystemService = require('../services/FileSystemService');
const path = require('path');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const ActionResultUtils = require('../utils/ActionResultUtils');
const SDKExecutionContext = require('../SDKExecutionContext');
const NodeTranslationService = require('../services/NodeTranslationService');
const { ActionResult } = require('../commands/actionresult/ActionResult');
const UploadFilesOutputFormatter = require('./outputFormatters/UploadFilesOutputFormatter');

const {
	COMMAND_UPLOADFILES: { QUESTIONS, MESSAGES },
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

const { validateArrayIsNotEmpty, showValidationResults } = require('../validation/InteractiveAnswersValidator');

module.exports = class UploadFilesCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._fileSystemService = new FileSystemService();
		this._localFileCabinetFolder = path.join(this._projectFolder, ApplicationConstants.FOLDERS.FILE_CABINET);
		this._fileCabinetService = new FileCabinetService(this._localFileCabinetFolder);
	}

	async _getCommandQuestions(prompt) {
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
		const localFileCabinetSubFolders = this._fileCabinetService.getFileCabinetFoldersRecursively(this._localFileCabinetFolder);

		const transformFoldersToChoicesFunc = folder => {
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

		if (!localFileCabinetFoldersChoices.some(choice => !choice.disabled)) {
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

		const transformFilesToChoicesFunc = file => {
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
				validate: fieldValue => showValidationResults(fieldValue, validateArrayIsNotEmpty),
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

	async _executeAction(answers) {
		try {
			const executionContextUploadFiles = new SDKExecutionContext({
				command: this._commandMetadata.sdkCommand,
				includeProjectDefaultAuthId: true,
				params: answers,
			});

			const operationResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContextUploadFiles),
				message: NodeTranslationService.getMessage(MESSAGES.UPLOADING_FILES),
			});
			return operationResult.status === SDKOperationResultUtils.SUCCESS
				? ActionResult.Builder.withData(operationResult.data)
						.withResultMessage(operationResult.resultMessage)
						.build()
				: ActionResult.Builder.withErrors(ActionResultUtils.collectErrorMessages(operationResult)).build();
		} catch (error) {
			return ActionResult.Builder.withErrors([error]).build();
		}
	}

	_formatActionResult(actionResult) {
		new UploadFilesOutputFormatter(this.consoleLogger, this._fileCabinetService).formatActionResult(actionResult);
	}
};
