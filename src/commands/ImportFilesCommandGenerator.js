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
	COMMAND_IMPORTFILES: { ERRORS, QUESTIONS, MESSAGES, OUTPUT },
	NO,
	YES,
} = require('../services/TranslationKeys');

const SUITE_SCRIPTS_FOLDER = '/SuiteScripts';
const COMMAND_OPTIONS = {
	FOLDER: 'folder',
	PATHS: 'paths',
	EXCLUDE_PROPERTIES: 'excludeproperties',
	PROJECT: 'project',
};
const INTERMEDIATE_COMMANDS = {
	LISTFILES: 'listfiles',
	LISTFOLDERS: 'listfolders',
};
const COMMAND_ANSWERS = {
	OVERWRITE_FILES: 'overwrite',
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
			throw TranslationService.getMessage(ERRORS.IS_SUITEAPP);
		}

		const listFoldersResult = await this._listFolders();

		if (SDKOperationResultUtils.hasErrors(listFoldersResult)) {
			throw SDKOperationResultUtils.getMessagesString(listFoldersResult);
		}

		const selectFolderQuestion = this._generateSelectFolderQuestion(listFoldersResult);
		const selectFolderAnswer = await prompt([selectFolderQuestion]);
		const listFilesResult = await this._listFiles(selectFolderAnswer);

		if (SDKOperationResultUtils.hasErrors(listFilesResult)) {
			throw SDKOperationResultUtils.getMessagesString(listFilesResult);
		}
		if (Array.isArray(listFilesResult.data) && listFilesResult.data.length === 0) {
			throw SDKOperationResultUtils.getMessagesString(listFilesResult);
		}

		const selectFilesQuestions = this._generateSelectFilesQuestions(listFilesResult);
		const selectFilesAnswer = await prompt(selectFilesQuestions);

		const overwriteAnswer = await prompt([this._generateOverwriteQuestion()]);
		if (overwriteAnswer[COMMAND_ANSWERS.OVERWRITE_FILES] === false) {
			throw TranslationService.getMessage(MESSAGES.CANCEL_IMPORT);
		}

		return selectFilesAnswer;
	}

	_listFolders() {
		const executionContextListFolders = new SDKExecutionContext({
			command: INTERMEDIATE_COMMANDS.LISTFOLDERS,
			showOutput: false,
		});
		this._applyDefaultContextParams(executionContextListFolders);

		return executeWithSpinner({
			action: this._sdkExecutor.execute(executionContextListFolders),
			message: TranslationService.getMessage(MESSAGES.LOADING_FOLDERS),
		});
	}

	_generateSelectFolderQuestion(listFoldersResult) {
		return {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: COMMAND_OPTIONS.FOLDER,
			message: TranslationService.getMessage(QUESTIONS.SELECT_FOLDER),
			default: SUITE_SCRIPTS_FOLDER,
			choices: this._getFileCabinetFolders(listFoldersResult),
		};
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

	_listFiles(selectFolderAnswer) {
		// quote folder path to preserve spaces
		selectFolderAnswer.folder = CommandUtils.quoteString(selectFolderAnswer.folder);
		const executionContextListFiles = new SDKExecutionContext({
			command: INTERMEDIATE_COMMANDS.LISTFILES,
			params: selectFolderAnswer,
		});
		this._applyDefaultContextParams(executionContextListFiles);

		return executeWithSpinner({
			action: this._sdkExecutor.execute(executionContextListFiles),
			message: TranslationService.getMessage(MESSAGES.LOADING_FILES),
		});
	}

	_generateSelectFilesQuestions(listFilesResult) {
		return [
			{
				type: CommandUtils.INQUIRER_TYPES.CHECKBOX,
				name: COMMAND_OPTIONS.PATHS,
				message: TranslationService.getMessage(QUESTIONS.SELECT_FILES),
				choices: listFilesResult.data.map(path => ({ name: path, value: path })),
				validate: fieldValue => showValidationResults(fieldValue, validateArrayIsNotEmpty),
			},
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND_OPTIONS.EXCLUDE_PROPERTIES,
				message: TranslationService.getMessage(QUESTIONS.EXCLUDE_PROPERTIES),
				choices: [
					{ name: TranslationService.getMessage(YES), value: true },
					{ name: TranslationService.getMessage(NO), value: false },
				],
			},
		];
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
		const { PROJECT, PATHS, EXCLUDE_PROPERTIES } = COMMAND_OPTIONS;
		answers[PROJECT] = CommandUtils.quoteString(this._projectFolder);
		if (answers.hasOwnProperty(PATHS)) {
			if (Array.isArray(answers[PATHS])) {
				answers[PATHS] = answers[PATHS].map(CommandUtils.quoteString).join(' ');
			} else {
				answers[PATHS] = CommandUtils.quoteString(answers[PATHS]);
			}
		}
		if (answers[EXCLUDE_PROPERTIES]) {
			answers[EXCLUDE_PROPERTIES] = '';
		} else {
			delete answers[EXCLUDE_PROPERTIES];
		}
		return answers;
	}

	_executeAction(answers) {
		if (this._projectMetadataService.getProjectType(this._projectFolder) === PROJECT_SUITEAPP) {
			throw TranslationService.getMessage(ERRORS.IS_SUITEAPP);
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
				NodeUtils.println(
					TranslationService.getMessage(OUTPUT.FILES_IMPORTED),
					NodeUtils.COLORS.RESULT
				);
				successful.forEach(result => {
					NodeUtils.println(result.path, NodeUtils.COLORS.RESULT);
				});
			}
			if (unsuccessful.length) {
				NodeUtils.println(
					TranslationService.getMessage(OUTPUT.FILES_NOT_IMPORTED),
					NodeUtils.COLORS.WARNING
				);
				unsuccessful.forEach(result => {
					NodeUtils.println(
						`${result.path}, ${result.message}`,
						NodeUtils.COLORS.WARNING
					);
				});
			}
		}
	}
};
