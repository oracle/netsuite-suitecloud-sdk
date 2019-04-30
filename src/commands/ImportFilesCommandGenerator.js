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
	COMMAND_IMPORTFILES: { IMPORTING_FILES, LOADING_FOLDERS, LOADING_FILES, SELECT_FOLDER, RESTRICTED_FOLDER, ERROR },
	
} = require('../services/TranslationKeys');

const SUITE_SCRIPTS_FOLDER = '/SuiteScripts';

const ANSWER_NAMES = {
	FOLDER: 'folder',
	PATHS: 'paths'
}

const COMMAND_NAMES = {
	LISTFILES: 'listfiles',
	LISTFOLDERS: 'listfolders'
}

module.exports = class ImportFilesCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._projectMetadataService = new ProjectMetadataService();
	}

	_getCommandQuestions(prompt) {
		return new Promise((resolve,reject) => {
			if (this._projectMetadataService.getProjectType(this._projectFolder) === PROJECT_SUITEAPP) {
				reject('The files could not be imported. You are trying to import files from a SuiteApp project. You can only import files from Account Customization Projects.');
				return;
			}

			const executionContextListFolders = new SDKExecutionContext({
				command: COMMAND_NAMES.LISTFOLDERS,
				showOutput: false,
			});
			this._applyDefaultContextParams(executionContextListFolders);

			executeWithSpinner({
				action: this._sdkExecutor.execute(executionContextListFolders),
				message: TranslationService.getMessage(LOADING_FOLDERS),
			})
				.then(resultListFolders => {
					prompt([
						{
							type: CommandUtils.INQUIRER_TYPES.LIST,
							name: ANSWER_NAMES.FOLDER,
							message: TranslationService.getMessage(SELECT_FOLDER),
							default: SUITE_SCRIPTS_FOLDER,
							choices: this._getFileCabinetFolders(resultListFolders),
						},
					]).then(firstAnswers => {
						// quote folder path to preserve spaces
						firstAnswers.folder = `\"${firstAnswers.folder}\"`;
						const executionContextListFiles = new SDKExecutionContext({
							command: COMMAND_NAMES.LISTFILES,
							params: firstAnswers,
						});
						this._applyDefaultContextParams(executionContextListFiles);

						executeWithSpinner({
							action: this._sdkExecutor.execute(executionContextListFiles),
							message: TranslationService.getMessage(LOADING_FILES),
						}).then(listFilesResult => {
							// TODO : validate that there is files to show
							const questions = this._generateImportFilesQuestions(listFilesResult);
							prompt(questions).then(secondAnswers =>{
								//prepare answers to be treated in _executeAction
								resolve(secondAnswers);
							})
							//preapare next prompt with the answers
						})
					});
				})
				// TODO : find right mecanism to treat the error
				.catch(error => {
					NodeUtils.println(
						TranslationService.getMessage(ERROR, this._commandMetadata.name, error),
						NodeUtils.COLORS.ERROR
					);
				});
		});
	}

	_checkProjectIsSuiteApp(reject) {
		if (this._projectMetadataService.getProjectType(this._projectFolder) === PROJECT_SUITEAPP) {
			reject('The files could not be imported. You are trying to import files from a SuiteApp project. You can only import files from Account Customization Projects.');
			return;
		}
	}

	_getFileCabinetFolders(listFoldersResponse) {
		return listFoldersResponse.data.map(folder => {
			return {
				name: folder.path,
				value: folder.path,
				disabled: folder.isRestricted
					? TranslationService.getMessage(RESTRICTED_FOLDER)
					: '',
			};
		});
	}

	_generateImportFilesQuestions(listFilesResult) {

		return [{
			type: CommandUtils.INQUIRER_TYPES.CHECKBOX,
			name: ANSWER_NAMES.PATHS,
			message: 'Select the files you want to import',
			choices: listFilesResult.data.map(path => ({name: path, value: path})),
		}]
	}

	_preExecuteAction(args) {
		args.project = this._projectFolder;
		if(Array.isArray(args.paths)) {
			args.paths = args.paths.join(' ');
		}
		return args;
	}

	_executeAction(answers) {
		if (this._projectMetadataService.getProjectType(this._projectFolder) === PROJECT_SUITEAPP) {
			reject('The files could not be imported. You are trying to import files from a SuiteApp project. You can only import files from Account Customization Projects.');
			return;
		}

		const executionContextImportObjects = new SDKExecutionContext({
			command: this._commandMetadata.name,
			params: answers,
		});

		return executeWithSpinner({
			action: this._sdkExecutor.execute(executionContextImportObjects),
			message: TranslationService.getMessage(IMPORTING_FILES),
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
			const unsuccessful = data.results.filter(result => result.loaded != true)			
			successful.forEach(result => {
				NodeUtils.println(result.path, NodeUtils.COLORS.RESULT);
			});
			unsuccessful.forEach(result => {
				NodeUtils.println(result.path, NodeUtils.COLORS.WARNING);
			});
		}
	}
};
