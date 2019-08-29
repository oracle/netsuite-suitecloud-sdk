/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const CommandUtils = require('../utils/CommandUtils');
const SDKExecutionContext = require('../SDKExecutionContext');
const TranslationService = require('../services/TranslationService');
const executeWithSpinner = require('../ui/CliSpinner').executeWithSpinner;
const NodeUtils = require('../utils/NodeUtils');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const {
	COMMAND_LISTFILES: { LOADING_FOLDERS, LOADING_FILES, SELECT_FOLDER, RESTRICTED_FOLDER, ERROR_INTERNAL }
} = require('../services/TranslationKeys');

const LIST_FOLDERS_COMMAND = 'listfolders';
const SUITE_SCRIPTS_FOLDER = '/SuiteScripts';

module.exports = class ListFilesCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
	}

	_getCommandQuestions(prompt) {
		return new Promise(resolve => {
			const executionContext = new SDKExecutionContext({
				command: LIST_FOLDERS_COMMAND,
				includeAccountDetailsParams: true,
			});

			return executeWithSpinner({
				action: this._sdkExecutor.execute(executionContext),
				message: TranslationService.getMessage(LOADING_FOLDERS),
			})
			.then(operationResult => {
				resolve(
					prompt([
						{
							type: CommandUtils.INQUIRER_TYPES.LIST,
							name: this._commandMetadata.options.folder.name,
							message: TranslationService.getMessage(SELECT_FOLDER),
							default: SUITE_SCRIPTS_FOLDER,
							choices: this._getFileCabinetFolders(operationResult),
						},
					])
				);
			})
			// TODO : find right mecanism to treat the error
			.catch( error => {
				NodeUtils.println(TranslationService.getMessage(ERROR_INTERNAL, this._commandMetadata.name, error), NodeUtils.COLORS.ERROR);
			})
		});
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

	_executeAction(answers) {
		// quote folder path to preserve spaces
		answers.folder = `\"${answers.folder}\"`;
		const executionContext = new SDKExecutionContext({
			command: this._commandMetadata.name,
			params: answers,
			includeAccountDetails: true
		});

		return executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: TranslationService.getMessage(LOADING_FILES),
		});
	}

	_formatOutput(operationResult) {
		const { data } = operationResult;

		if (SDKOperationResultUtils.hasErrors(operationResult)) {
			SDKOperationResultUtils.logResultMessage(operationResult);
			SDKOperationResultUtils.logErrors(operationResult)
			return;
		}

		SDKOperationResultUtils.logResultMessage(operationResult);

		if (Array.isArray(data)) {
			data.forEach(fileName => {
				NodeUtils.println(fileName, NodeUtils.COLORS.RESULT)
			});
		}
	}
};
