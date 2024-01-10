/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { join } = require('path');
const { prompt, Separator } = require('inquirer');
const CommandsMetadataService = require('../../../core/CommandsMetadataService');
const executeWithSpinner = require('../../../ui/CliSpinner').executeWithSpinner;
const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');
const SdkExecutionContext = require('../../../SdkExecutionContext');
const { lineBreak } = require('../../../loggers/LoggerConstants');
const { getProjectDefaultAuthId } = require('../../../utils/AuthenticationUtils');
const BaseInputHandler = require('../../base/BaseInputHandler');
const SdkExecutor = require('../../../SdkExecutor');
const ProjectInfoService = require('../../../services/ProjectInfoService');
const FileSystemService = require('../../../services/FileSystemService');
const CommandUtils = require('../../../utils/CommandUtils');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const { PROJECT_SUITEAPP, PROJECT_ACP, FOLDERS } = require('../../../ApplicationConstants');
const OBJECT_TYPES = require('../../../metadata/ObjectTypesMetadata');
const {
	COMMAND_IMPORTOBJECTS: { MESSAGES, QUESTIONS, ERRORS },
	YES,
	NO,
	ERRORS: { PROMPTING_INTERACTIVE_QUESTIONS_FAILED },
} = require('../../../services/TranslationKeys');
const {
	validateArrayIsNotEmpty,
	showValidationResults,
	validateSuiteApp,
	validateScriptId,
} = require('../../../validation/InteractiveAnswersValidator');
const FileUtils = require('../../../utils/FileUtils');

const ANSWERS_NAMES = {
	AUTH_ID: 'authid',
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

const LIST_OBJECTS_COMMAND_NAME = 'object:list';
const CUSTOM_SCRIPT_PREFIX = 'customscript';

module.exports = class ImportObjectsInputHandler extends BaseInputHandler {
	constructor(options) {
		super(options);

		// TODO input handlers shouldn't execute actions. rework this
		this._sdkExecutor = new SdkExecutor(this._sdkPath, this._executionEnvironmentContext);

		this._projectInfoService = new ProjectInfoService(this._projectFolder);
		this._fileSystemService = new FileSystemService();
		const commandsMetadataService = new CommandsMetadataService();
		this._listObjectsMetadata = commandsMetadataService.getCommandMetadataByName(LIST_OBJECTS_COMMAND_NAME);
		this._authId = getProjectDefaultAuthId(this._executionPath);
	}

	async getParameters(params) {
		const listObjectQuestions = this._generateListObjectQuestions();
		const listObjectAnswers = await prompt(listObjectQuestions);

		const paramsForListObjects = this._arrangeAnswersForListObjects(listObjectAnswers);
		const executionContextForListObjects = SdkExecutionContext.Builder.forCommand(this._listObjectsMetadata.sdkCommand)
			.integration()
			.addParams(paramsForListObjects)
			.build();

		let listObjectsResult;
		try {
			listObjectsResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContextForListObjects),
				message: NodeTranslationService.getMessage(MESSAGES.LOADING_LIST_OF_OBJECTS),
			});
		} catch (error) {
			throw NodeTranslationService.getMessage(ERRORS.CALLING_LIST_OBJECTS, lineBreak, error);
		}

		if (listObjectsResult.status === SdkOperationResultUtils.STATUS.ERROR) {
			throw listObjectsResult.errorMessages;
		}
		const { data } = listObjectsResult;

		if (Array.isArray(data) && listObjectsResult.data.length === 0) {
			throw NodeTranslationService.getMessage(MESSAGES.NO_OBJECTS_TO_LIST);
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
			throw NodeTranslationService.getMessage(PROMPTING_INTERACTIVE_QUESTIONS_FAILED, lineBreak, error);
		}

		const combinedAnswers = { ...listObjectAnswers, ...selectionObjectAnswers, ...answersAfterObjectSelection, ...overwriteConfirmationAnswer };

		const answers = this._arrangeAnswersForImportObjects(combinedAnswers);
		return answers;
	}

	_generateListObjectQuestions() {
		const questions = [];
		if (this._projectInfoService.getProjectType() === PROJECT_SUITEAPP) {
			const specifySuiteApp = {
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: ANSWERS_NAMES.SPECIFY_SUITEAPP,
				message: NodeTranslationService.getMessage(QUESTIONS.SPECIFIC_APPID),
				default: 0,
				choices: [
					{ name: NodeTranslationService.getMessage(YES), value: true },
					{ name: NodeTranslationService.getMessage(NO), value: false },
				],
				validate: (fieldValue) => showValidationResults(fieldValue, validateArrayIsNotEmpty),
			};
			questions.push(specifySuiteApp);

			const specifyAppId = {
				when: function (response) {
					return response[ANSWERS_NAMES.SPECIFY_SUITEAPP];
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: ANSWERS_NAMES.APP_ID,
				message: NodeTranslationService.getMessage(QUESTIONS.APPID),
				validate: (fieldValue) => showValidationResults(fieldValue, validateSuiteApp),
			};
			questions.push(specifyAppId);
		}

		const showAllObjects = {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: ANSWERS_NAMES.SPECIFY_OBJECT_TYPE,
			message: NodeTranslationService.getMessage(QUESTIONS.SHOW_ALL_CUSTOM_OBJECTS),
			default: 0,
			choices: [
				{ name: NodeTranslationService.getMessage(YES), value: false },
				{ name: NodeTranslationService.getMessage(NO), value: true },
			],
		};
		questions.push(showAllObjects);

		const selectObjectType = {
			when: function (answers) {
				return answers[ANSWERS_NAMES.SPECIFY_OBJECT_TYPE];
			},
			type: CommandUtils.INQUIRER_TYPES.CHECKBOX,
			name: ANSWERS_NAMES.TYPE_CHOICES_ARRAY,
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
		questions.push(selectObjectType);

		const filterByScriptId = {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: ANSWERS_NAMES.SPECIFY_SCRIPT_ID,
			message: NodeTranslationService.getMessage(QUESTIONS.FILTER_BY_SCRIPT_ID),
			default: false,
			choices: [
				{ name: NodeTranslationService.getMessage(YES), value: true },
				{ name: NodeTranslationService.getMessage(NO), value: false },
			],
		};
		questions.push(filterByScriptId);

		const specifyScriptId = {
			when: function (response) {
				return response[ANSWERS_NAMES.SPECIFY_SCRIPT_ID];
			},
			type: CommandUtils.INQUIRER_TYPES.INPUT,
			name: ANSWERS_NAMES.SCRIPT_ID,
			message: NodeTranslationService.getMessage(QUESTIONS.SCRIPT_ID),
			validate: (fieldValue) => showValidationResults(fieldValue, validateScriptId),
		};
		questions.push(specifyScriptId);

		return questions;
	}

	_generateSelectionObjectQuestions(operationResult) {
		const questions = [];
		const { data } = operationResult;

		const choicesToShow = data.map((object) => ({
			name: object.type + ':' + object.scriptId,
			value: object,
		}));

		const questionListObjectsSelection = {
			type: CommandUtils.INQUIRER_TYPES.CHECKBOX,
			name: ANSWERS_NAMES.OBJECTS_SELECTED,
			message: NodeTranslationService.getMessage(QUESTIONS.SELECT_OBJECTS),
			choices: choicesToShow,
			validate: (fieldValue) => showValidationResults(fieldValue, validateArrayIsNotEmpty),
		};
		questions.push(questionListObjectsSelection);
		return questions;
	}

	_generateQuestionsAfterObjectSelection(selectionObjectAnswers) {
		const questions = [];

		const hasCustomScript = selectionObjectAnswers.objects_selected.some((element) => element.scriptId.startsWith(CUSTOM_SCRIPT_PREFIX));
		if (this._projectInfoService.getProjectType() === PROJECT_ACP && hasCustomScript) {
			const questionImportReferencedSuiteScripts = {
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: ANSWERS_NAMES.IMPORT_REFERENCED_SUITESCRIPTS,
				message: NodeTranslationService.getMessage(QUESTIONS.IMPORT_REFERENCED_SUITESCRIPTS),
				default: 0,
				choices: [
					{ name: NodeTranslationService.getMessage(YES), value: true },
					{ name: NodeTranslationService.getMessage(NO), value: false },
				],
			};
			questions.push(questionImportReferencedSuiteScripts);
		}

		// extracting root prefix
		// replacing '\' for '/', this is done because destinationfolder option in java-sdf works only with '/'
		// sourroundig "" to the folder string so it will handle blank spaces case
		const transformFoldersToChoicesFunc = (folder) => ({
			name: folder.replace(this._projectFolder, '').replace(/\\/g, '/'),
			value: `\"${folder.replace(this._projectFolder, '').replace(/\\/g, '/')}\"`,
		});
		const objectsFolder = join(this._projectFolder, FOLDERS.OBJECTS);
		if (!FileUtils.exists(objectsFolder)) {
			FileUtils.createDirectory(objectsFolder);
		}
		const objectsSubFolders = this._fileSystemService.getFoldersFromDirectory(objectsFolder);
		const objectDirectoryChoices = [objectsFolder, ...objectsSubFolders].map(transformFoldersToChoicesFunc);

		const questionDestinationFolder = {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: ANSWERS_NAMES.DESTINATION_FOLDER,
			message: NodeTranslationService.getMessage(QUESTIONS.DESTINATION_FOLDER),
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
			message: NodeTranslationService.getMessage(overwriteConfirmationMessageKey),
			default: 0,
			choices: [
				{ name: NodeTranslationService.getMessage(YES), value: true },
				{ name: NodeTranslationService.getMessage(NO), value: false },
			],
		};
		questions.push(questionOverwriteConfirmation);
		return questions;
	}

	_arrangeAnswersForListObjects(answers) {
		answers[ANSWERS_NAMES.AUTH_ID] = getProjectDefaultAuthId(this._executionPath);
		if (answers[ANSWERS_NAMES.SPECIFY_OBJECT_TYPE]) {
			answers[ANSWERS_NAMES.OBJECT_TYPE] = answers[ANSWERS_NAMES.TYPE_CHOICES_ARRAY].join(' ');
		}
		return CommandUtils.extractCommandOptions(answers, this._listObjectsMetadata);
	}

	_arrangeAnswersForImportObjects(answers) {
		if (!answers[ANSWERS_NAMES.SPECIFY_OBJECT_TYPE] || answers[ANSWERS_NAMES.TYPE_CHOICES_ARRAY].length > 1) {
			answers[ANSWERS_NAMES.OBJECT_TYPE] = 'ALL';
		}
		answers[ANSWERS_NAMES.SCRIPT_ID] = answers[ANSWERS_NAMES.OBJECTS_SELECTED].map((el) => el.scriptId);

		return answers;
	}
};
