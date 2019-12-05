/*
 ** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const inquirer = require('inquirer');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const CommandUtils = require('../utils/CommandUtils');
const NodeUtils = require('../utils/NodeUtils');
const OBJECT_TYPES = require('../metadata/ObjectTypesMetadata');
const ProjectInfoService = require('../services/ProjectInfoService');
const TranslationService = require('../services/TranslationService');
const FileSystemService = require('../services/FileSystemService');
const { join } = require('path');
const CommandsMetadataService = require('../core/CommandsMetadataService');
const executeWithSpinner = require('../ui/CliSpinner').executeWithSpinner;
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const SDKExecutionContext = require('../SDKExecutionContext');
const ANSWERS_NAMES = {
	APP_ID: 'appid',
	SCRIPT_ID: 'scriptid',
	SPECIFY_SCRIPT_ID: 'specifyscriptid',
	SPECIFY_SUITEAPP: 'specifysuiteapp',
	OBJECT_TYPE: 'type',
	SPECIFY_OBJECT_TYPE: 'specifyObjectType',
	TYPE_CHOICES_ARRAY: 'typeChoicesArray',
	DESTINATION_FOLDER: 'destinationfolder',
	PROJECT_FOLDER: 'project',
	OBJECTS_SELECTED: 'objects_selected',
	OVERWRITE_OBJECTS: 'overwrite_objects',
};

const COMMAND_FLAGS = {
	EXCLUDE_FILES: 'excludefiles',
};

const { PROJECT_SUITEAPP, PROJECT_ACP, FOLDER_NAMES } = require('../ApplicationConstants');
const {
	COMMAND_IMPORTOBJECTS: { ERRORS, QUESTIONS, MESSAGES },
	ERRORS: { PROMPTING_INTERACTIVE_QUESTIONS_FAILED },
	YES,
	NO,
} = require('../services/TranslationKeys');

const { validateArrayIsNotEmpty, validateScriptId, validateSuiteApp, showValidationResults } = require('../validation/InteractiveAnswersValidator');
const LIST_OBJECTS_COMMAND_NAME = 'listobjects';

module.exports = class ListObjectsCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._projectInfoService = new ProjectInfoService(this._projectFolder);
		this._fileSystemService = new FileSystemService();
		const commandsMetadataService = new CommandsMetadataService();
		this._listObjectsMetadata = commandsMetadataService.getCommandMetadataByName(LIST_OBJECTS_COMMAND_NAME);
	}

	_getCommandQuestions(prompt) {
		const questions = this._generateListObjectQuestions();

		return new Promise((resolve, reject) => {
			prompt(questions)
				.then(firstAnswers => {
					const paramsForListObjects = this._arrangeAnswersForListObjects(firstAnswers);
					const executionContextForListObjects = new SDKExecutionContext({
						command: this._listObjectsMetadata.name,
						params: paramsForListObjects,
						includeProjectDefaultAuthId: true,
					});

					executeWithSpinner({
						action: this._sdkExecutor.execute(executionContextForListObjects),
						message: TranslationService.getMessage(MESSAGES.LOADING_OBJECTS),
					})
						.then(operationResult => {
							const { data } = operationResult;
							if (SDKOperationResultUtils.hasErrors(operationResult)) {
								SDKOperationResultUtils.logResultMessage(operationResult);
								SDKOperationResultUtils.logErrors(operationResult);
								return;
							}
							if (Array.isArray(data) && operationResult.data.length === 0) {
								NodeUtils.println(TranslationService.getMessage(MESSAGES.NO_OBJECTS_TO_LIST), NodeUtils.COLORS.RESULT);
								return;
							}

							const questions = this._generateSelectionObjectQuestions(operationResult);

							prompt(questions).then(secondAnswers => {
								const combinedAnswers = { ...firstAnswers, ...secondAnswers };
								const finalAnswers = this._arrangeAnswersForImportObjects(combinedAnswers);
								resolve(finalAnswers);
							});
						})
						.catch(error => {
							reject(TranslationService.getMessage(ERRORS.CALLING_LIST_OBJECTS, NodeUtils.lineBreak, error));
						});
				})
				.catch(error => reject(TranslationService.getMessage(PROMPTING_INTERACTIVE_QUESTIONS_FAILED, NodeUtils.lineBreak, error)));
		});
	}

	_generateListObjectQuestions() {
		const questions = [];
		if (this._projectInfoService.getProjectType() === PROJECT_SUITEAPP) {
			const questionSpecifySuiteApp = {
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: ANSWERS_NAMES.SPECIFY_SUITEAPP,
				message: TranslationService.getMessage(QUESTIONS.SPECIFIC_APPID),
				default: 0,
				choices: [
					{ name: TranslationService.getMessage(YES), value: true },
					{ name: TranslationService.getMessage(NO), value: false },
				],
				validate: fieldValue => showValidationResults(fieldValue, validateArrayIsNotEmpty),
			};
			questions.push(questionSpecifySuiteApp);

			const questionAppId = {
				when: function(response) {
					return response[ANSWERS_NAMES.SPECIFY_SUITEAPP];
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: ANSWERS_NAMES.APP_ID,
				message: TranslationService.getMessage(QUESTIONS.APPID),
				validate: fieldValue => showValidationResults(fieldValue, validateSuiteApp),
			};
			questions.push(questionAppId);
		}

		const questionShowAllObjects = {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: ANSWERS_NAMES.SPECIFY_OBJECT_TYPE,
			message: TranslationService.getMessage(QUESTIONS.SHOW_ALL_CUSTOM_OBJECTS),
			default: 0,
			choices: [
				{ name: TranslationService.getMessage(YES), value: false },
				{ name: TranslationService.getMessage(NO), value: true },
			],
		};
		questions.push(questionShowAllObjects);

		const questionCustomOjects = {
			when: function(answers) {
				return answers[ANSWERS_NAMES.SPECIFY_OBJECT_TYPE];
			},
			type: CommandUtils.INQUIRER_TYPES.CHECKBOX,
			name: ANSWERS_NAMES.TYPE_CHOICES_ARRAY,
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

		questions.push(questionCustomOjects);

		const questionSpecifyScriptId = {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: ANSWERS_NAMES.SPECIFY_SCRIPT_ID,
			message: TranslationService.getMessage(QUESTIONS.FILTER_BY_SCRIPT_ID),
			default: false,
			choices: [
				{ name: TranslationService.getMessage(YES), value: true },
				{ name: TranslationService.getMessage(NO), value: false },
			],
		};
		questions.push(questionSpecifyScriptId);

		const questionScriptId = {
			when: function(response) {
				return response[ANSWERS_NAMES.SPECIFY_SCRIPT_ID];
			},
			type: CommandUtils.INQUIRER_TYPES.INPUT,
			name: ANSWERS_NAMES.SCRIPT_ID,
			message: TranslationService.getMessage(QUESTIONS.SCRIPT_ID),
			validate: fieldValue => showValidationResults(fieldValue, validateScriptId),
		};
		questions.push(questionScriptId);
		return questions;
	}

	_generateSelectionObjectQuestions(operationResult) {
		const questions = [];
		const { data } = operationResult;

		const choicesToShow = data.map(object => ({
			name: object.type + ':' + object.scriptId,
			value: object,
		}));

		const questionListObjectsSelection = {
			type: CommandUtils.INQUIRER_TYPES.CHECKBOX,
			name: ANSWERS_NAMES.OBJECTS_SELECTED,
			message: TranslationService.getMessage(QUESTIONS.SELECT_OBJECTS),
			choices: choicesToShow,
			validate: fieldValue => showValidationResults(fieldValue, validateArrayIsNotEmpty),
		};
		questions.push(questionListObjectsSelection);

		if (this._projectInfoService.getProjectType() === PROJECT_ACP) {
			const questionImportReferencedSuiteScripts = {
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: ANSWERS_NAMES.IMPORT_REFERENCED_SUITESCRIPTS,
				message: TranslationService.getMessage(QUESTIONS.IMPORT_REFERENCED_SUITESCRIPTS),
				default: 0,
				choices: [
					{ name: TranslationService.getMessage(YES), value: true },
					{ name: TranslationService.getMessage(NO), value: false },
				],
			};
			questions.push(questionImportReferencedSuiteScripts);
		}

		// extracting root prefix
		// replacing '\' for '/', this is done because destinationfolder option in java-sdf works only with '/'
		// sourroundig "" to the folder string so it will handle blank spaces case
		const transformFoldersToChoicesFunc = folder => ({
			name: folder.replace(this._projectFolder, ''),
			value: `\"${folder.replace(this._projectFolder, '').replace(/\\/g, '/')}\"`,
		});
		const objectDirectoryChoices = this._fileSystemService
			.getFoldersFromDirectory(join(this._projectFolder, FOLDER_NAMES.OBJECTS))
			.map(transformFoldersToChoicesFunc);

		const questionDestinationFolder = {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: ANSWERS_NAMES.DESTINATION_FOLDER,
			message: TranslationService.getMessage(QUESTIONS.DESTINATION_FOLDER),
			choices: objectDirectoryChoices,
		};
		questions.push(questionDestinationFolder);

		const questionOverwriteConfirmation = {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: ANSWERS_NAMES.OVERWRITE_OBJECTS,
			message: TranslationService.getMessage(QUESTIONS.OVERWRITE_OBJECTS),
			default: 0,
			choices: [
				{ name: TranslationService.getMessage(YES), value: true },
				{ name: TranslationService.getMessage(NO), value: false },
			],
		};
		questions.push(questionOverwriteConfirmation);
		return questions;
	}

	_arrangeAnswersForListObjects(answers) {
		if (answers[ANSWERS_NAMES.SPECIFY_OBJECT_TYPE]) {
			answers[ANSWERS_NAMES.OBJECT_TYPE] = answers[ANSWERS_NAMES.TYPE_CHOICES_ARRAY].join(' ');
		}
		return CommandUtils.extractCommandOptions(answers, this._listObjectsMetadata);
	}

	_arrangeAnswersForImportObjects(answers) {
		if (!answers[ANSWERS_NAMES.SPECIFY_OBJECT_TYPE]) {
			answers[ANSWERS_NAMES.OBJECT_TYPE] = 'ALL';
		} else if (answers[ANSWERS_NAMES.TYPE_CHOICES_ARRAY].length > 1) {
			answers[ANSWERS_NAMES.OBJECT_TYPE] = 'ALL';
		}
		answers[ANSWERS_NAMES.SCRIPT_ID] = answers[ANSWERS_NAMES.OBJECTS_SELECTED].map(el => el.scriptId).join(' ');

		return answers;
	}

	_preExecuteAction(answers) {
		answers[ANSWERS_NAMES.PROJECT_FOLDER] = CommandUtils.quoteString(this._projectFolder);

		return answers;
	}

	_executeAction(answers) {
		if (answers[ANSWERS_NAMES.OVERWRITE_OBJECTS] === false) {
			throw TranslationService.getMessage(MESSAGES.CANCEL_IMPORT);
		}

		const flags = [];
		if (this._projectInfoService.getProjectType() === PROJECT_ACP && !answers[ANSWERS_NAMES.IMPORT_REFERENCED_SUITESCRIPTS]) {
			flags.push(COMMAND_FLAGS.EXCLUDE_FILES);
			delete answers[ANSWERS_NAMES.IMPORT_REFERENCED_SUITESCRIPTS];
		}

		const params = CommandUtils.extractCommandOptions(answers, this._commandMetadata);
		const executionContextForImportObjects = new SDKExecutionContext({
			command: this._commandMetadata.name,
			params,
			flags: flags,
			includeProjectDefaultAuthId: true,
		});

		return executeWithSpinner({
			action: this._sdkExecutor.execute(executionContextForImportObjects),
			message: TranslationService.getMessage(MESSAGES.IMPORTING_OBJECTS),
		});
	}

	_logImportedObjects(importedObjects) {
		if (importedObjects.length) {
			NodeUtils.println(TranslationService.getMessage(MESSAGES.IMPORTED_OBJECTS), NodeUtils.COLORS.RESULT);
			importedObjects.forEach(objectImport => {
				NodeUtils.println(`    - ${objectImport.customObject.type}:${objectImport.customObject.id}`, NodeUtils.COLORS.RESULT);
				this._logReferencedFileImportResult(objectImport.referencedFileImportResult);
			});
		}
	}

	_logUnImportedObjects(unImportedObjects) {
		if (unImportedObjects.length) {
			NodeUtils.println(TranslationService.getMessage(MESSAGES.UNIMPORTED_OBJECTS), NodeUtils.COLORS.WARNING);
			unImportedObjects.forEach(objectImport => {
				NodeUtils.println(`    - ${objectImport.customObject.type}:${objectImport.customObject.id}`, NodeUtils.COLORS.WARNING);
			});
		}
	}

	_logReferencedFileImportResult(referencedFileImportResult) {
		const importedFiles = referencedFileImportResult.successfulImports;
		const unImportedFiles = referencedFileImportResult.failedImports;

		if (importedFiles.length || unImportedFiles.length) {
			const referencedFilesLogMessage = `        - ${TranslationService.getMessage(MESSAGES.REFERENCED_SUITESCRIPT_FILES)}`;
			NodeUtils.println(referencedFilesLogMessage, NodeUtils.COLORS.RESULT);

			importedFiles.forEach(importedFile => {
				const importedFileLogMessage = `            - ${TranslationService.getMessage(
					MESSAGES.REFERENCED_SUITESCRIPT_FILE_IMPORTED,
					importedFile.path
				)}`;
				NodeUtils.println(importedFileLogMessage, NodeUtils.COLORS.RESULT);
			});

			unImportedFiles.forEach(unImportedFile => {
				const unimportedFileLogMessage = `            - ${TranslationService.getMessage(
					MESSAGES.REFERENCED_SUITESCRIPT_FILE_IMPORT_FAILED,
					unImportedFile.path,
					unImportedFile.message
				)}`;
				NodeUtils.println(unimportedFileLogMessage, NodeUtils.COLORS.WARNING);
			});
		}
	}

	_formatOutput(operationResult) {
		const { data } = operationResult;

		if (SDKOperationResultUtils.hasErrors(operationResult)) {
			SDKOperationResultUtils.logResultMessage(operationResult);
			SDKOperationResultUtils.logErrors(operationResult);
			return;
		}

		if (!operationResult.data) {
			SDKOperationResultUtils.logResultMessage(operationResult);
			return;
		}

		this._logImportedObjects(data.successfulImports);
		this._logUnImportedObjects(data.failedImports);
	}
};
