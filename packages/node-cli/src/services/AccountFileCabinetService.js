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

module.exports = class AccountFileCabinetService {
	constructor(sdkPath, executionEnvironmentContext, authId) {
		this._sdkExecutor = new SdkExecutor(sdkPath, executionEnvironmentContext);
		this._authId = authId;
	}

	async getAccountFileCabinetFolders() {
		const executionContext = SdkExecutionContext.Builder.forCommand(INTERMEDIATE_COMMANDS.LISTFOLDERS.COMMAND)
			.integration()
			.addParam(INTERMEDIATE_COMMANDS.LISTFOLDERS.OPTIONS.AUTH_ID, this._authId)
			.build();

		let listFoldersResult;
		try {
			listFoldersResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContext),
				message: NodeTranslationService.getMessage(LOADING_FOLDERS),
			});
		} catch (error) {
			throw NodeTranslationService.getMessage(ERROR_INTERNAL, INTERMEDIATE_COMMANDS.LISTFOLDERS.COMMAND, lineBreak, error);
		}

		if (listFoldersResult.status === SdkOperationResultUtils.STATUS.ERROR) {
			throw listFoldersResult.errorMessages;
		}
		return listFoldersResult.data;
	}

	listFiles(selectFolderAnswer) {
		// quote folder path to preserve spaces
		const listFilesParams = {};
		listFilesParams[INTERMEDIATE_COMMANDS.LISTFILES.OPTIONS.FOLDER] = CommandUtils.quoteString(selectFolderAnswer.folder);
		listFilesParams[INTERMEDIATE_COMMANDS.LISTFILES.OPTIONS.AUTH_ID] = this._authId;

		const executionContext = SdkExecutionContext.Builder.forCommand(INTERMEDIATE_COMMANDS.LISTFILES.COMMAND)
			.integration()
			.addParams(listFilesParams)
			.build();

		return executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: NodeTranslationService.getMessage(MESSAGES.LOADING_FILES),
		});
	}
};
