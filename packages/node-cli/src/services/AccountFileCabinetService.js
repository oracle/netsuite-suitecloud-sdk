/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const SdkExecutionContext = require('../SdkExecutionContext');
const SdkExecutor = require('../SdkExecutor');
const NodeTranslationService = require('../services/NodeTranslationService');
const executeWithSpinner = require('../ui/CliSpinner').executeWithSpinner;
const CommandUtils = require('../utils/CommandUtils');
const SdkOperationResultUtils = require('../utils/SdkOperationResultUtils');
const { lineBreak } = require('../loggers/LoggerConstants');
const {
	COMMAND_IMPORTFILES: { MESSAGES },
	COMMAND_LISTFILES: { LOADING_FOLDERS, ERROR_INTERNAL },
} = require('./TranslationKeys');

const INTERMEDIATE_COMMANDS = {
	LISTFILES: {
		COMMAND: 'listfiles',
		OPTIONS: {
			AUTH_ID: 'authid',
			FOLDER: 'folder',
		},
	},
	LISTFOLDERS: {
		COMMAND: 'listfolders',
		OPTIONS: {
			AUTH_ID: 'authid',
		},
	},
};

class AccountFileCabinetService {
	async _listFolders(sdkExecutor, authId) {
		const executionContext = SdkExecutionContext.Builder.forCommand(INTERMEDIATE_COMMANDS.LISTFOLDERS.COMMAND)
			.integration()
			.addParam(INTERMEDIATE_COMMANDS.LISTFOLDERS.OPTIONS.AUTH_ID, authId)
			.build();

		let listFoldersResult;
		try {
			listFoldersResult = await executeWithSpinner({
				action: sdkExecutor.execute(executionContext),
				message: NodeTranslationService.getMessage(LOADING_FOLDERS),
			});
		} catch (error) {
			throw NodeTranslationService.getMessage(ERROR_INTERNAL, INTERMEDIATE_COMMANDS.LISTFOLDERS.COMMAND, lineBreak, error);
		}

		if (listFoldersResult.status === SdkOperationResultUtils.STATUS.ERROR) {
			throw listFoldersResult.errorMessages;
		}
		return listFoldersResult;
	}

	async getFileCabinetFolders(sdkPath, executionEnvironmentContext, authId) {
		const sdkExecutor = new SdkExecutor(sdkPath, executionEnvironmentContext);
		return await this._listFolders(sdkExecutor, authId);
	}

	listFiles(selectFolderAnswer, sdkExecutor, authId) {
		// quote folder path to preserve spaces
		selectFolderAnswer[INTERMEDIATE_COMMANDS.LISTFILES.OPTIONS.FOLDER] = CommandUtils.quoteString(selectFolderAnswer.folder);
		selectFolderAnswer[INTERMEDIATE_COMMANDS.LISTFILES.OPTIONS.AUTH_ID] = authId;

		const executionContext = SdkExecutionContext.Builder.forCommand(INTERMEDIATE_COMMANDS.LISTFILES.COMMAND)
			.integration()
			.addParams(selectFolderAnswer)
			.build();

		return executeWithSpinner({
			action: sdkExecutor.execute(executionContext),
			message: NodeTranslationService.getMessage(MESSAGES.LOADING_FILES),
		});
	}
}

module.exports = new AccountFileCabinetService();
