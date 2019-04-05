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

module.exports = class ListObjectsCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._projectMetadataService = new ProjectMetadataService();
		this._fileSystemService = new FileSystemService();
		this._commandsMetadataInfo = commandsMetadata.getCommandsMetadata();
	}

	_validateFieldIsNotEmpty(fieldValue) {
		return fieldValue !== ''
			? true
			: NodeUtils.formatString(getMessage(ERRORS.EMPTY_FIELD), {
					color: NodeUtils.COLORS.RED,
					bold: true,
			  });
	}

	_validateArrayIsNotEmpty(array) {
		return array.length > 0
			? true
			: NodeUtils.formatString(getMessage(ERRORS.CHOOSE_OPTION), {
					color: NodeUtils.COLORS.RED,
					bold: true,
			  });
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
				validate: this._validateArrayIsNotEmpty,
			};
			questions1.push(questionSpecifySuiteApp);

			const questionAppId = {
				when: function(response) {
					return response[ANSWERS_NAMES.SPECIFY_SUITEAPP];
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: ANSWERS_NAMES.APP_ID,
				message: getMessage(QUESTIONS.APPID),
				validate: this._validateFieldIsNotEmpty,
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
			validate: this._validateArrayIsNotEmpty,
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
			validate: this._validateFieldIsNotEmpty,
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
				}).then(result => {
                    const operationResult = JSON.parse(result);
                    const questions2 = [];

                    if (operationResult.status === 'ERROR' || operationResult.data.length == 0) {
                        NodeUtils.println(getMessage(MESSAGES.NO_OBJECTS_TO_LIST), NodeUtils.COLORS.INFO);
                        return;
                    }

                    const choicesToShow = operationResult.data.map(el =>({name: el.type+':'+el.scriptid, value: el}));

					const questionListObjectsSelection = {
						type: CommandUtils.INQUIRER_TYPES.CHECKBOX,
						name: ANSWERS_NAMES.OBJECTS_SELECTED,
						message: getMessage(QUESTIONS.SELECT_OBJECTS),
						choices: choicesToShow,
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
		answers[ANSWERS_NAMES.SCRIPT_ID] = answers[ANSWERS_NAMES.OBJECTS_SELECTED].map(el=>(el.scriptid)).join(' ');
		answers[ANSWERS_NAMES.PROJECT_FOLDER] = this._projectFolder;

		return answers;
	}

	_executeAction(answers) {

		if (!answers[ANSWERS_NAMES.OVERRITE_OBJECTS]) {
			return new Promise(resolve => console.log(getMessage(MESSAGES.CANCEL_IMPORT)));
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
};
