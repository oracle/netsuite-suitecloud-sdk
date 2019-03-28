'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const SDKExecutionContext = require('../SDKExecutionContext');
const TranslationService = require('../services/TranslationService');
const executeWithSpinner = require('../ui/CliSpinner').executeWithSpinner;
const {
	LIST_FILES_COMMAND_LOADING_FOLDERS,
	LIST_FILES_COMMAND_LOADING_FILES,
	LIST_FILES_COMMAND_SELECT_FOLDER,
	LIST_FILES_COMMAND_RESTRICTED_FOLDER,
} = require('../services/TranslationKeys');

module.exports = class ListFilesCommandGenerator extends BaseCommandGenerator {

	constructor(options) {
		super(options);
	}

	_getCommandQuestions(prompt) {
		return new Promise(resolve => {
			const executionContext = new SDKExecutionContext({
				command: 'listfolders',
				showOutput: false,
			});
			this._applyDefaultContextParams(executionContext);

			return executeWithSpinner({
				action: this._sdkExecutor.execute(executionContext),
				message: TranslationService.getMessage(LIST_FILES_COMMAND_LOADING_FOLDERS),
			}).then(result => {
				resolve(prompt([
					{
						type: 'list',
						name: this._commandMetadata.options.folder.name,
						message: TranslationService.getMessage(LIST_FILES_COMMAND_SELECT_FOLDER),
						default: '/SuiteScripts',
						choices: this._getFileCabinetFolders(JSON.parse(result)),
					},
				]));
			});
		});
	}

	_getFileCabinetFolders(listFoldersResponse) {
		return listFoldersResponse.map(folder => {
			return {
				name: folder.path,
				value: folder.path,
				disabled: folder.restricted ?
					TranslationService.getMessage(LIST_FILES_COMMAND_RESTRICTED_FOLDER) : '',
			};
		});
	}

	_executeAction(answers) {
		// quote folder path to preserve spaces
		answers.folder = `\"${answers.folder}\"`;
		const executionContext = new SDKExecutionContext({
			command: this._commandMetadata.name,
			params: answers,
		});

		return executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: TranslationService.getMessage(LIST_FILES_COMMAND_LOADING_FILES),
		});
	}

};
