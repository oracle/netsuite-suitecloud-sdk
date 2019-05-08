'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const CommandUtils = require('../utils/CommandUtils');
const SDKExecutionContext = require('../SDKExecutionContext');
const TranslationService = require('../services/TranslationService');
const { executeWithSpinner } = require('../ui/CliSpinner');
const NodeUtils = require('../utils/NodeUtils');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const ProjectMetadataService = require('../services/ProjectMetadataService');
const { PROJECT_SUITEAPP } = require('../ApplicationConstants');
const {
	COMMAND_IMPORTFILES: { ERRORS, QUESTIONS, MESSAGES },
} = require('../services/TranslationKeys');

const SUITE_SCRIPTS_FOLDER = '/SuiteScripts';
const ANSWER_NAMES = {
	FOLDER: 'folder',
	PATHS: 'paths',
};
const COMMAND_NAMES = {
	LISTFILES: 'listfiles',
	LISTFOLDERS: 'listfolders',
};

const {
	validateArrayIsNotEmpty,
	showValidationResults,
} = require('../validation/InteractiveAnswersValidator');

module.exports = class ImportFilesCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._projectMetadataService = new ProjectMetadataService();
	}

	async _getCommandQuestions(prompt) {
		if (this._projectMetadataService.getProjectType(this._projectFolder) === PROJECT_SUITEAPP) {
			return Promise.reject(TranslationService.getMessage(ERRORS.IS_SUITEAPP));
		}

		const executionContextListFolders = new SDKExecutionContext({
			command: COMMAND_NAMES.LISTFOLDERS,
			showOutput: false,
		});
		this._applyDefaultContextParams(executionContextListFolders);

		const listFoldersResult = await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContextListFolders),
			message: TranslationService.getMessage(MESSAGES.LOADING_FOLDERS),
		});

		if (SDKOperationResultUtils.hasErrors(listFoldersResult)) {
			return Promise.reject(SDKOperationResultUtils.getMessagesString(listFoldersResult));
		}

		const firstQuestion = this._generateSelectFolderQuestion(listFoldersResult);
		const firstAnswer = await prompt([firstQuestion]);

		// quote folder path to preserve spaces
		firstAnswer.folder = `\"${firstAnswer.folder}\"`;
		const executionContextListFiles = new SDKExecutionContext({
			command: COMMAND_NAMES.LISTFILES,
			params: firstAnswer,
		});
		this._applyDefaultContextParams(executionContextListFiles);

		const listFilesResult = await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContextListFiles),
			message: TranslationService.getMessage(MESSAGES.LOADING_FILES),
		});

		if (SDKOperationResultUtils.hasErrors(listFilesResult)) {
			return Promise.reject(SDKOperationResultUtils.getMessagesString(listFilesResult));
		}
		if (Array.isArray(listFilesResult.data) && listFilesResult.data.length === 0) {
			return Promise.reject(SDKOperationResultUtils.getMessagesString(listFilesResult));
		}

		const secondQuestion = this._generateSelectFilesQuestion(listFilesResult);
		return await prompt([secondQuestion]);
	}

	_getFileCabinetFolders(listFoldersResponse) {
		return listFoldersResponse.data.map(folder => ({
			name: folder.path,
			value: folder.path,
			disabled: folder.isRestricted
				? TranslationService.getMessage(MESSAGES.RESTRICTED_FOLDER)
				: '',
		}));
	}

	_generateSelectFolderQuestion(listFoldersResult) {
		return {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: ANSWER_NAMES.FOLDER,
			message: TranslationService.getMessage(QUESTIONS.SELECT_FOLDER),
			default: SUITE_SCRIPTS_FOLDER,
			choices: this._getFileCabinetFolders(listFoldersResult),
		};
	}

	_generateSelectFilesQuestion(listFilesResult) {
		return {
			type: CommandUtils.INQUIRER_TYPES.CHECKBOX,
			name: ANSWER_NAMES.PATHS,
			message: TranslationService.getMessage(QUESTIONS.SELECT_FILES),
			choices: listFilesResult.data.map(path => ({ name: path, value: path })),
			validate: fieldValue => showValidationResults(fieldValue, validateArrayIsNotEmpty),
		};
	}

	_preExecuteAction(answers) {
		answers.project = this._projectFolder;
		if (Array.isArray(answers.paths)) {
			answers.paths = answers.paths.join(' ');
		}
		return answers;
	}

	_executeAction(answers) {
		if (this._projectMetadataService.getProjectType(this._projectFolder) === PROJECT_SUITEAPP) {
			return Promise.reject(TranslationService.getMessage(ERRORS.IS_SUITEAPP));
		}

		const executionContextImportObjects = new SDKExecutionContext({
			command: this._commandMetadata.name,
			params: answers,
		});

		return executeWithSpinner({
			action: this._sdkExecutor.execute(executionContextImportObjects),
			message: TranslationService.getMessage(MESSAGES.IMPORTING_FILES),
		});
	}

	_formatOutput(operationResult) {
		const { data } = operationResult;

		if (SDKOperationResultUtils.hasErrors(operationResult)) {
			SDKOperationResultUtils.logErrors(operationResult);
			return;
		}

		SDKOperationResultUtils.logMessages(operationResult);

		if (Array.isArray(data.results)) {
			const successful = data.results.filter(result => result.loaded === true);
			const unsuccessful = data.results.filter(result => result.loaded !== true);
			if (successful.length) {
				NodeUtils.println('The following objects were imported:', NodeUtils.COLORS.RESULT);
				successful.forEach(result => {
					NodeUtils.println(result.path, NodeUtils.COLORS.RESULT);
				});
			}
			if (unsuccessful.length) {
				NodeUtils.println(
					'The following objects were NOT imported:',
					NodeUtils.COLORS.WARNING
				);
				unsuccessful.forEach(result => {
					NodeUtils.println(`${result.path} ${result.message}`, NodeUtils.COLORS.WARNING);
				});
			}
		}
	}
};
