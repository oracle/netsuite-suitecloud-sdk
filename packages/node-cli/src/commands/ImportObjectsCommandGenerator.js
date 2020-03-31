/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const inquirer = require('inquirer');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const { ActionResult } = require('../commands/actionresult/ActionResult');
const CommandUtils = require('../utils/CommandUtils');
const OBJECT_TYPES = require('../metadata/ObjectTypesMetadata');
const ProjectInfoService = require('../services/ProjectInfoService');
const TranslationService = require('../services/TranslationService');
const FileSystemService = require('../services/FileSystemService');
const { join } = require('path');
const CommandsMetadataService = require('../core/CommandsMetadataService');
const executeWithSpinner = require('../ui/CliSpinner').executeWithSpinner;
const ActionResultUtils = require('../utils/ActionResultUtils');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const SDKExecutionContext = require('../SDKExecutionContext');
const ImportObjectsOutputFormatter = require('./formatOutput/ImportObjectsOutputFormatter');
const { lineBreak } = require('../loggers/ConsoleLogger');
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
	IMPORT_REFERENCED_SUITESCRIPTS: 'import_referenced_suitescripts',
};

const COMMAND_FLAGS = {
	EXCLUDE_FILES: 'excludefiles',
};

const { PROJECT_SUITEAPP, PROJECT_ACP, FOLDERS } = require('../ApplicationConstants');
const {
	COMMAND_IMPORTOBJECTS: { ERRORS, QUESTIONS, MESSAGES },
	ERRORS: { PROMPTING_INTERACTIVE_QUESTIONS_FAILED },
	YES,
	NO,
} = require('../services/TranslationKeys');

const { validateArrayIsNotEmpty, validateScriptId, validateSuiteApp, showValidationResults } = require('../validation/InteractiveAnswersValidator');
const LIST_OBJECTS_COMMAND_NAME = 'object:list';

const CUSTOM_SCRIPT_PREFIX = 'customscript';

module.exports = class ImportObjectsCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._projectInfoService = new ProjectInfoService(this._projectFolder);
		this._fileSystemService = new FileSystemService();
		const commandsMetadataService = new CommandsMetadataService();
		this._listObjectsMetadata = commandsMetadataService.getCommandMetadataByName(LIST_OBJECTS_COMMAND_NAME);
	}

	async _getCommandQuestions(prompt) {
		const listObjectQuestions = this._generateListObjectQuestions();
		const listObjectAnswers = await prompt(listObjectQuestions);

		const paramsForListObjects = this._arrangeAnswersForListObjects(listObjectAnswers);
		const executionContextForListObjects = new SDKExecutionContext({
			command: this._listObjectsMetadata.sdkCommand,
			params: paramsForListObjects,
			includeProjectDefaultAuthId: true,
		});

		let listObjectsResult;
		try {
			listObjectsResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContextForListObjects),
				message: TranslationService.getMessage(MESSAGES.LOADING_OBJECTS),
			});
		} catch (error) {
			throw TranslationService.getMessage(ERRORS.CALLING_LIST_OBJECTS, lineBreak, error);
		}

		const { data } = listObjectsResult;
		if (SDKOperationResultUtils.hasErrors(listObjectsResult)) {
			SDKOperationResultUtils.logResultMessage(listObjectsResult, this.consoleLogger);
			this.consoleLogger.logErrors(listObjectsResult.errorMessages);
			throw SDKOperationResultUtils.getErrorMessagesString(listObjectsResult);
		}
		if (Array.isArray(data) && listObjectsResult.data.length === 0) {
			throw TranslationService.getMessage(MESSAGES.NO_OBJECTS_TO_LIST);
		}

		let selectionObjectAnswers;
		let answersAfterObjectSelection;
		let overwriteConfirmationAnswer;
		try {
			const selectionObjectQuestions = this._generateSelectionObjectQuestions(listObjectsResult);
			selectionObjectAnswers = await prompt(selectionObjectQuestions);

			const questionsAfterObjectSelection = this._generateQuestionsAfterObjectSelection(selectionObjectAnswers);
			answersAfterObjectSelection = await prompt(questionsAfterObjectSelection);

			const overwriteConfirmationQuestion = this._generateOverwriteConfirmationQuestion(answersAfterObjectSelection);
			overwriteConfirmationAnswer = await prompt(overwriteConfirmationQuestion);
		} catch (error) {
			throw TranslationService.getMessage(PROMPTING_INTERACTIVE_QUESTIONS_FAILED, lineBreak, error);
		}

		const combinedAnswers = { ...listObjectAnswers, ...selectionObjectAnswers, ...answersAfterObjectSelection, ...overwriteConfirmationAnswer };

		return this._arrangeAnswersForImportObjects(combinedAnswers);
	}

	_generateListObjectQuestions() {
		const questions = [];
		if (this._projectInfoService.getProjectType() === PROJECT_SUITEAPP) {
			const specifySuiteApp = {
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
			questions.push(specifySuiteApp);

			const specifyAppId = {
				when: function(response) {
					return response[ANSWERS_NAMES.SPECIFY_SUITEAPP];
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: ANSWERS_NAMES.APP_ID,
				message: TranslationService.getMessage(QUESTIONS.APPID),
				validate: fieldValue => showValidationResults(fieldValue, validateSuiteApp),
			};
			questions.push(specifyAppId);
		}

		const showAllObjects = {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: ANSWERS_NAMES.SPECIFY_OBJECT_TYPE,
			message: TranslationService.getMessage(QUESTIONS.SHOW_ALL_CUSTOM_OBJECTS),
			default: 0,
			choices: [
				{ name: TranslationService.getMessage(YES), value: false },
				{ name: TranslationService.getMessage(NO), value: true },
			],
		};
		questions.push(showAllObjects);

		const selectObjectType = {
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
		questions.push(selectObjectType);

		const filterByScriptId = {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: ANSWERS_NAMES.SPECIFY_SCRIPT_ID,
			message: TranslationService.getMessage(QUESTIONS.FILTER_BY_SCRIPT_ID),
			default: false,
			choices: [
				{ name: TranslationService.getMessage(YES), value: true },
				{ name: TranslationService.getMessage(NO), value: false },
			],
		};
		questions.push(filterByScriptId);

		const specifyScriptId = {
			when: function(response) {
				return response[ANSWERS_NAMES.SPECIFY_SCRIPT_ID];
			},
			type: CommandUtils.INQUIRER_TYPES.INPUT,
			name: ANSWERS_NAMES.SCRIPT_ID,
			message: TranslationService.getMessage(QUESTIONS.SCRIPT_ID),
			validate: fieldValue => showValidationResults(fieldValue, validateScriptId),
		};
		questions.push(specifyScriptId);

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
		return questions;
	}

	_generateQuestionsAfterObjectSelection(selectionObjectAnswers) {
		const questions = [];

		const hasCustomScript = selectionObjectAnswers.objects_selected.some(element => element.scriptId.startsWith(CUSTOM_SCRIPT_PREFIX));
		if (this._projectInfoService.getProjectType() === PROJECT_ACP && hasCustomScript) {
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
		const objectsFolder = join(this._projectFolder, FOLDERS.OBJECTS);
		const objectsSubFolders = this._fileSystemService.getFoldersFromDirectory(objectsFolder);
		const objectDirectoryChoices = [objectsFolder, ...objectsSubFolders].map(transformFoldersToChoicesFunc);

		const questionDestinationFolder = {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: ANSWERS_NAMES.DESTINATION_FOLDER,
			message: TranslationService.getMessage(QUESTIONS.DESTINATION_FOLDER),
			choices: objectDirectoryChoices,
		};
		questions.push(questionDestinationFolder);
		return questions;
	}

	_generateOverwriteConfirmationQuestion(answersAfterObjectSelection) {
		const questions = [];

		let overwriteConfirmationMessageKey;
		if (
			answersAfterObjectSelection[ANSWERS_NAMES.IMPORT_REFERENCED_SUITESCRIPTS] !== undefined &&
			answersAfterObjectSelection[ANSWERS_NAMES.IMPORT_REFERENCED_SUITESCRIPTS]
		) {
			overwriteConfirmationMessageKey = QUESTIONS.OVERWRITE_OBJECTS_AND_FILES;
		} else {
			overwriteConfirmationMessageKey = QUESTIONS.OVERWRITE_OBJECTS;
		}

		const questionOverwriteConfirmation = {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: ANSWERS_NAMES.OVERWRITE_OBJECTS,
			message: TranslationService.getMessage(overwriteConfirmationMessageKey),
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

	async _executeAction(answers) {
		if (answers[ANSWERS_NAMES.OVERWRITE_OBJECTS] === false) {
			throw TranslationService.getMessage(MESSAGES.CANCEL_IMPORT);
		}

		try {
			const flags = [];
			if (this._runInInteractiveMode) {
				if (answers[ANSWERS_NAMES.IMPORT_REFERENCED_SUITESCRIPTS] !== undefined && !answers[ANSWERS_NAMES.IMPORT_REFERENCED_SUITESCRIPTS]) {
					flags.push(COMMAND_FLAGS.EXCLUDE_FILES);
					delete answers[ANSWERS_NAMES.IMPORT_REFERENCED_SUITESCRIPTS];
				}
			} else {
				if (answers[COMMAND_FLAGS.EXCLUDE_FILES]) {
					flags.push(COMMAND_FLAGS.EXCLUDE_FILES);
					delete answers[COMMAND_FLAGS.EXCLUDE_FILES];
				}
			}

			const params = CommandUtils.extractCommandOptions(answers, this._commandMetadata);
			const executionContextForImportObjects = new SDKExecutionContext({
				command: this._commandMetadata.sdkCommand,
				params,
				flags,
				includeProjectDefaultAuthId: true,
			});

			const operationResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContextForImportObjects),
				message: TranslationService.getMessage(MESSAGES.IMPORTING_OBJECTS),
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

	_formatOutput(actionResult) {
		new ImportObjectsOutputFormatter(this.consoleLogger).formatOutput(actionResult);
	}
};
