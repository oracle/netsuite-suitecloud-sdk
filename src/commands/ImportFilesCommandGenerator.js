'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const CommandUtils = require('../utils/CommandUtils');
const SDKExecutionContext = require('../SDKExecutionContext');
const TranslationService = require('../services/TranslationService');
const executeWithSpinner = require('../ui/CliSpinner').executeWithSpinner;
const NodeUtils = require('../utils/NodeUtils');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const ProjectMetadataService = require('../services/ProjectMetadataService');
const { PROJECT_SUITEAPP } = require('../ApplicationConstants');
const {
	COMMAND_IMPORTFILES: {
		ERRORS,
		QUESTIONS,
		MESSAGES,
	},
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

		try {
			const executionContextListFolders = new SDKExecutionContext({
				command: COMMAND_NAMES.LISTFOLDERS,
				showOutput: false,
			});
			this._applyDefaultContextParams(executionContextListFolders);

			const resultListFolders = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContextListFolders),
				message: TranslationService.getMessage(MESSAGES.LOADING_FOLDERS),
			});

			const firstAnswers = await prompt([
				{
					type: CommandUtils.INQUIRER_TYPES.LIST,
					name: ANSWER_NAMES.FOLDER,
					message: TranslationService.getMessage(QUESTIONS.SELECT_FOLDER),
					default: SUITE_SCRIPTS_FOLDER,
					choices: this._getFileCabinetFolders(resultListFolders),
				},
			]);

			// quote folder path to preserve spaces
			firstAnswers.folder = `\"${firstAnswers.folder}\"`;
			const executionContextListFiles = new SDKExecutionContext({
				command: COMMAND_NAMES.LISTFILES,
				params: firstAnswers,
			});
			this._applyDefaultContextParams(executionContextListFiles);

			const listFilesResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContextListFiles),
				message: TranslationService.getMessage(MESSAGES.LOADING_FILES),
			});

			if (SDKOperationResultUtils.hasErrors(listFilesResult)) {
				return Promise.reject(SDKOperationResultUtils.getMessagesString(listFilesResult));
			}
			SDKOperationResultUtils.logMessages(listFilesResult);
			if (Array.isArray(listFilesResult.data) && listFilesResult.data.length === 0) {
				return {
					abortExecution: true,
					message: SDKOperationResultUtils.getMessagesString(listFilesResult),
					skipCommandOptionsValidation: true,
					paths: '',
				};
			}

			const questions = this._generateImportFilesQuestions(listFilesResult);

			const secondAnswers = await prompt(questions);
			return secondAnswers;
		} catch (error) {
			Promise.reject(
				TranslationService.getMessage(ERRORS.INTERNAL, this._commandMetadata.name, error)
			);
		}
	}

	_getFileCabinetFolders(listFoldersResponse) {
		return listFoldersResponse.data.map(folder => ({
			name: folder.path,
			value: folder.path,
			disabled: folder.isRestricted ? TranslationService.getMessage(MESSAGES.RESTRICTED_FOLDER) : '',
		}));
	}

	_generateImportFilesQuestions(listFilesResult) {
		return [
			{
				type: CommandUtils.INQUIRER_TYPES.CHECKBOX,
				name: ANSWER_NAMES.PATHS,
				message: TranslationService.getMessage(QUESTIONS.SELECT_FILES),
				choices: listFilesResult.data.map(path => ({ name: path, value: path })),
				validate: fieldValue => showValidationResults(fieldValue, validateArrayIsNotEmpty),
			},
		];
	}

	_preExecuteAction(args) {
		args.project = this._projectFolder;
		if (Array.isArray(args.paths)) {
			args.paths = args.paths.join(' ');
		}
		return args;
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
			successful.forEach(result => {
				NodeUtils.println(result.path, NodeUtils.COLORS.RESULT);
			});
			unsuccessful.forEach(result => {
				NodeUtils.println(result.path, NodeUtils.COLORS.WARNING);
			});
		}
	}
};
