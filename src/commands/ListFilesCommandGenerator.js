'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const SDKExecutionContext = require('../SDKExecutionContext');
const TranslationService = require('../services/TranslationService');
const CliSpinnerExecutionContext = require('../ux/CliSpinnerExecutionContext');
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
			const cliSpinnerExecutionContext = new CliSpinnerExecutionContext({
				message: TranslationService.getMessage(LIST_FILES_COMMAND_LOADING_FOLDERS),
			});
			const executionContext = new SDKExecutionContext({
				command: 'listfolders',
				showOutput: false,
				cliSpinnerExecutionContext: cliSpinnerExecutionContext,
			});
			this._applyDefaultContextParams(executionContext);

			return this._sdkExecutor.execute(executionContext).then(result => {
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
		const choices = [];
		for (const o of listFoldersResponse) {
			const choice = {
				name: o.path,
				value: o.path,
				disabled: o.restricted ?
					TranslationService.getMessage(LIST_FILES_COMMAND_RESTRICTED_FOLDER) : '',
			};
			choices.push(choice);
		}
		return choices;
	}

	_executeAction(answers) {
		const cliSpinnerExecutionContext = new CliSpinnerExecutionContext({
			message: TranslationService.getMessage(LIST_FILES_COMMAND_LOADING_FILES),
		});
		// quote folder path to preserve spaces
		answers.folder = `\"${answers.folder}\"`;
		const executionContext = new SDKExecutionContext({
			command: this._commandMetadata.name,
			params: answers,
			cliSpinnerExecutionContext: cliSpinnerExecutionContext,
		});

		return this._sdkExecutor.execute(executionContext);
	}

};
