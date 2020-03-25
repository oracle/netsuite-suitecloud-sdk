/*
** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const { ActionResult } = require('../commands/actionresult/ActionResult');
const CommandUtils = require('../utils/CommandUtils');
const SDKExecutionContext = require('../SDKExecutionContext');
const TranslationService = require('../services/TranslationService');
const executeWithSpinner = require('../ui/CliSpinner').executeWithSpinner;
const NodeUtils = require('../utils/NodeUtils');
const ActionResultUtils = require('../utils/ActionResultUtils');
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
				includeProjectDefaultAuthId: true,
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
				.catch(error => {
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

	async _executeAction(answers) {
		try {
			// quote folder path to preserve spaces
			answers.folder = `\"${answers.folder}\"`;
			const executionContext = new SDKExecutionContext({
				command: this._commandMetadata.sdkCommand,
				params: answers,
				includeProjectDefaultAuthId: true
			});

			const operationResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContext),
				message: TranslationService.getMessage(LOADING_FILES),
			});

			return operationResult.status === SDKOperationResultUtils.SUCCESS
				? ActionResult.Builder
					.success()
					.withData(operationResult.data)
					.withResultMessage(operationResult.resultMessage)
					.build()
				: ActionResult.Builder
					.error(operationResult.errorMessages)
					.withResultMessage(operationResult.resultMessage)
					.build();
		} catch (error) {
			return ActionResult.Builder.error(error).build();
		}
	}

	_formatOutput(actionResult) {

		if (ActionResultUtils.hasErrors(actionResult)) {
			ActionResultUtils.logResultMessage(actionResult);
			ActionResultUtils.logErrors(actionResult.errorMessages);
			return;
		}

		ActionResultUtils.logResultMessage(actionResult);

		if (Array.isArray(actionResult.data)) {
			actionResult.data.forEach(fileName => {
				NodeUtils.println(fileName, NodeUtils.COLORS.RESULT)
			});
		}
	}
};
