'use strict';

const inquirer = require('inquirer');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const CommandUtils = require('../utils/CommandUtils');
const NodeUtils = require('../utils/NodeUtils');
const OBJECT_TYPES = require('../metadata/ObjectTypesMetadata');
const ProjectMetadataService = require('../services/ProjectMetadataService');
const SDKExecutionContext = require('../SDKExecutionContext');
const { getMessage } = require('../services/TranslationService');
const FileSystemService = require('../services/FileSystemService');
const { join } = require('path');
const commandsMetadata = require('../metadata/CommandsMetadataService');
const executeWithSpinner = require('../ui/CliSpinner').executeWithSpinner;
const CLIException = require('../CLIException');

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
	OVERRITE_OBJECTS: 'overwrite_objects',
};
const { PROJECT_SUITEAPP, OBJECTS_FOLDER } = require('../ApplicationConstants');
const {
	COMMAND_IMPORTOBJECTS: { QUESTIONS, MESSAGES },
	ERRORS,
	YES,
	NO,
} = require('../services/TranslationKeys');

const {
	validateArrayIsNotEmpty,
	validateFieldIsNotEmpty,
	validateSuiteApp,
	showValidationResults,
} = require('../validation/InteractiveAnswersValidator');

module.exports = class ListObjectsCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._projectMetadataService = new ProjectMetadataService();
		this._fileSystemService = new FileSystemService();
		this._commandsMetadataInfo = commandsMetadata.getCommandsMetadata();
	}

	_getCommandQuestions(prompt) {
		var questions1 = [];
		if (this._projectMetadataService.getProjectType(this._projectFolder) === PROJECT_SUITEAPP) {
			let message = getMessage(QUESTIONS.SPECIFIC_APPID);

			const questionSpecifySuiteApp = {
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: ANSWERS_NAMES.SPECIFY_SUITEAPP,
				message,
				default: 0,
				choices: [
					{ name: getMessage(YES), value: true },
					{ name: getMessage(NO), value: false	}
				],
				validate: fieldValue => showValidationResults(fieldValue, validateArrayIsNotEmpty),
			};
			questions1.push(questionSpecifySuiteApp);

			const questionAppId = {
				when: function(response) {
					return response[ANSWERS_NAMES.SPECIFY_SUITEAPP];
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: ANSWERS_NAMES.APP_ID,
				message: getMessage(QUESTIONS.APPID),
				validate: fieldValue => showValidationResults(fieldValue, validateSuiteApp),
			};
			questions1.push(questionAppId);
		}

		const questionShowAllObjects = {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: ANSWERS_NAMES.SPECIFY_OBJECT_TYPE,
			message: getMessage(QUESTIONS.SHOW_ALL_CUSTOM_OBJECTS),
			default: 0,
			choices: [
				{ name: getMessage(YES), value: false },
				{ name: getMessage(NO), value: true },
			]
		};
		questions1.push(questionShowAllObjects);

		const questionCustomOjects = {
			when: function(answers) {
				return answers[ANSWERS_NAMES.SPECIFY_OBJECT_TYPE];
			},
			type: CommandUtils.INQUIRER_TYPES.CHECKBOX,
			name: ANSWERS_NAMES.TYPE_CHOICES_ARRAY,
			message: getMessage(QUESTIONS.FILTER_BY_CUSTOM_OBJECTS),
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

		questions1.push(questionCustomOjects);

		const questionSpecifyScriptId = {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: ANSWERS_NAMES.SPECIFY_SCRIPT_ID,
			message: getMessage(QUESTIONS.FILTER_BY_SCRIPT_ID),
			default: false,
			choices: [
				{ name: getMessage(YES), value: true },
				{ name: getMessage(NO), value: false },
			],
		};
		questions1.push(questionSpecifyScriptId);

		const questionScriptId = {
			when: function(response) {
				return response[ANSWERS_NAMES.SPECIFY_SCRIPT_ID];
			},
			type: CommandUtils.INQUIRER_TYPES.INPUT,
			name: ANSWERS_NAMES.SCRIPT_ID,
			message: getMessage(QUESTIONS.SCRIPT_ID),
			validate: fieldValue => showValidationResults(fieldValue, validateFieldIsNotEmpty),
		};
		questions1.push(questionScriptId);

		return prompt(questions1).then(firstAnswers => {
			const paramsForListObjects = this._arrangeAnswersForListObjects(firstAnswers);

			return new Promise(resolve => {
				const executionContextForListObjects = new SDKExecutionContext({
					command: this._commandsMetadataInfo.listobjects.name,
					showOutput: false,
					params: paramsForListObjects,
				});
				this._applyDefaultContextParams(executionContextForListObjects);

				return executeWithSpinner({
					action: this._sdkExecutor.execute(executionContextForListObjects),
					message: getMessage(MESSAGES.LOADING_OBJECTS),
				}).then(operationResult => {
                    const questions2 = [];
                    if (operationResult.status === 'ERROR') {
                        NodeUtils.println(operationResult.message, NodeUtils.COLORS.ERROR);
                        return;
                    }
                    if (operationResult.data.length == 0) {
                        NodeUtils.println(getMessage(MESSAGES.NO_OBJECTS_TO_LIST), NodeUtils.COLORS.INFO);
                        return;
                    }

                    const choicesToShow = operationResult.data.map(el =>({name: el.type+':'+el.scriptId, value: el}));

					const questionListObjectsSelection = {
						type: CommandUtils.INQUIRER_TYPES.CHECKBOX,
						name: ANSWERS_NAMES.OBJECTS_SELECTED,
						message: getMessage(QUESTIONS.SELECT_OBJECTS),
                        choices: choicesToShow,
                        validate: fieldValue => showValidationResults(fieldValue, validateArrayIsNotEmpty)
					};
					questions2.push(questionListObjectsSelection);

					const transformFoldersToChoicesFunc = folder => ({
						name: folder.replace(this._projectFolder, ''),
						// extracting root prefix
						// replacing '\' for '/', this is done because destinationfolder option in java-sdf works only with '/'
						value: folder.replace(this._projectFolder, '').replace(/\\/g, '/'),
					});
					const objectDirectoryChoices = this._fileSystemService
						.getFoldersFromDirectory(join(this._projectFolder, OBJECTS_FOLDER))
						.map(transformFoldersToChoicesFunc);

					const questionDestinationFolder = {
						type: CommandUtils.INQUIRER_TYPES.LIST,
						name: ANSWERS_NAMES.DESTINATION_FOLDER,
						message: getMessage(QUESTIONS.DESTINATION_FOLDER),
						choices: objectDirectoryChoices,
					};
					questions2.push(questionDestinationFolder);

					const questionOverwriteConfirmation = {
						type: CommandUtils.INQUIRER_TYPES.LIST,
						name: ANSWERS_NAMES.OVERRITE_OBJECTS,
						message: getMessage(QUESTIONS.OVERRITE_OBJECTS),
						default: 0,
						choices: [
							{ name: getMessage(YES), value: true },
							{ name: getMessage(NO), value: false }
						]
					};
					questions2.push(questionOverwriteConfirmation);

					resolve(prompt(questions2));
				}).catch(error => {
                    throw new CLIException(
                        -10,
                        `Error while loading calling listobjects. Details:${NodeUtils.lineBreak}${error}`
                    );
                });
			}).then(secondAnswers => {
                const combinedAnswers = { ...firstAnswers, ...secondAnswers };
                const finalAnswers =  this._arrangeAnswersForImportObjects(combinedAnswers);
				return finalAnswers;
			});

		});
	}

	_arrangeAnswersForListObjects(answers) {
		if (answers[ANSWERS_NAMES.SPECIFY_OBJECT_TYPE]) {
			answers[ANSWERS_NAMES.OBJECT_TYPE] = answers[ANSWERS_NAMES.TYPE_CHOICES_ARRAY].join(' ');
		}
		const listObjectsOptions = Object.keys(this._commandsMetadataInfo.listobjects.options);
		const params = CommandUtils.extractOnlyOptionsFromObject(answers, listObjectsOptions);

		return params;
	}

	_arrangeAnswersForImportObjects(answers) {
		if (!answers[ANSWERS_NAMES.SPECIFY_OBJECT_TYPE]) {
			answers[ANSWERS_NAMES.OBJECT_TYPE] = 'ALL';
		} else if (answers[ANSWERS_NAMES.TYPE_CHOICES_ARRAY].length > 1) {
			answers[ANSWERS_NAMES.OBJECT_TYPE] = 'ALL';
        }
		answers[ANSWERS_NAMES.SCRIPT_ID] = answers[ANSWERS_NAMES.OBJECTS_SELECTED].map(el=>(el.scriptId)).join(' ');
		answers[ANSWERS_NAMES.PROJECT_FOLDER] = this._projectFolder;

		return answers;
	}

	_executeAction(answers) {

		if (!answers[ANSWERS_NAMES.OVERRITE_OBJECTS]) {
			return new Promise((resolve, reject) => reject(getMessage(MESSAGES.CANCEL_IMPORT)));
		}

		const options = Object.keys(this._commandMetadata.options);
		var params = CommandUtils.extractOnlyOptionsFromObject(answers, options);
		const executionContextForImportObjects = new SDKExecutionContext({
			command: this._commandMetadata.name,
			params
        });
        
        return executeWithSpinner({
            action: this._sdkExecutor.execute(executionContextForImportObjects),
            message: getMessage(MESSAGES.IMPORTING_OBJECTS),
        })
    }
    
    _formatOutput(operationResult) {
        const {status, message, data} = operationResult;

		if (status == 'ERROR') {
			NodeUtils.println(message, NodeUtils.COLORS.ERROR);
			return;
        }
        
        const importedObjects = data.customObjects.filter(el => el.result.code === 'SUCCESS');
        const unImportedObjects = data.customObjects.filter(el => el.result.code === 'FAILED');
        
        if (importedObjects.length) {
            NodeUtils.println('The following object(s) were imported successfully:', NodeUtils.COLORS.RESULT);
            importedObjects.forEach(el => NodeUtils.println(`${el.type}:${el.id}`, NodeUtils.COLORS.RESULT));
        }
        if (unImportedObjects.length) {
            NodeUtils.println('The following object(s) were not imported:', NodeUtils.COLORS.WARNING);
            unImportedObjects.forEach((el, index, arr) => 
                NodeUtils.println(`${el.type}:${el.id}:${el.result.message}`, NodeUtils.COLORS.WARNING)
                );
        }
    }
};
