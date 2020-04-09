/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const { ActionResult } = require('../commands/actionresult/ActionResult');
const CommandUtils = require('../utils/CommandUtils');
const SDKExecutionContext = require('../SDKExecutionContext');
const NodeTranslationService = require('../services/NodeTranslationService');
const executeWithSpinner = require('../ui/CliSpinner').executeWithSpinner;
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const ListFilesOutputFormatter = require('./outputFormatters/ListFilesOutputFormatter');
const {
	COMMAND_LISTFILES: { LOADING_FOLDERS, LOADING_FILES, SELECT_FOLDER, RESTRICTED_FOLDER, ERROR_INTERNAL },
} = require('../services/TranslationKeys');

const LIST_FOLDERS_COMMAND = 'listfolders';
const SUITE_SCRIPTS_FOLDER = '/SuiteScripts';

module.exports = class ListFilesCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._outputFormatter = new ListFilesOutputFormatter(options.consoleLogger);
	}

	_getCommandQuestions(prompt) {
		return new Promise(resolve => {
			const executionContext = new SDKExecutionContext({
				command: LIST_FOLDERS_COMMAND,
				includeProjectDefaultAuthId: true,
			});

			return (
				executeWithSpinner({
					action: this._sdkExecutor.execute(executionContext),
					message: NodeTranslationService.getMessage(LOADING_FOLDERS),
				})
					.then(operationResult => {
						resolve(
							prompt([
								{
									type: CommandUtils.INQUIRER_TYPES.LIST,
									name: this._commandMetadata.options.folder.name,
									message: NodeTranslationService.getMessage(SELECT_FOLDER),
									default: SUITE_SCRIPTS_FOLDER,
									choices: this._getFileCabinetFolders(operationResult),
								},
							])
						);
					})
					// TODO : find right mecanism to treat the error
					.catch(error => {
						this.consoleLogger.error(NodeTranslationService.getMessage(ERROR_INTERNAL, this._commandMetadata.name, error));
					})
			);
		});
	}

	_getFileCabinetFolders(listFoldersResponse) {
		return listFoldersResponse.data.map(folder => {
			return {
				name: folder.path,
				value: folder.path,
				disabled: folder.isRestricted ? NodeTranslationService.getMessage(RESTRICTED_FOLDER) : '',
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
				includeProjectDefaultAuthId: true,
			});

			const operationResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContext),
				message: NodeTranslationService.getMessage(LOADING_FILES),
			});

			return operationResult.status === SDKOperationResultUtils.STATUS.SUCCESS
				? ActionResult.Builder.withData(operationResult.data)
						.withResultMessage(operationResult.resultMessage)
						.build()
				: ActionResult.Builder.withErrors(SDKOperationResultUtils.collectErrorMessages(operationResult)).build();
		} catch (error) {
			return ActionResult.Builder.withErrors([error]).build();
		}
	}
};
