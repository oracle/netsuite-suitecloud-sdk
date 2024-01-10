/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
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
	COMMAND_LISTFILES: { LOADING_FOLDERS, GETTING_INERNAL_ERROR: GETTING_INTERNAL_ERROR },
} = require('./TranslationKeys');

const INTERMEDIATE_COMMANDS = {
	LISTFILES: {
		SDK_COMMAND: 'listfiles',
		FILES_REFERENCE: 'File Cabinet files',
		OPTIONS: {
			AUTH_ID: 'authid',
			FOLDER: 'folder',
		},
	},
	LISTFOLDERS: {
		SDK_COMMAND: 'listfolders',
		FOLDERS_REFERENCE: 'File Cabinet folders',
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
		const executionContext = SdkExecutionContext.Builder.forCommand(INTERMEDIATE_COMMANDS.LISTFOLDERS.SDK_COMMAND)
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
			throw NodeTranslationService.getMessage(GETTING_INTERNAL_ERROR, INTERMEDIATE_COMMANDS.LISTFOLDERS.FOLDERS_REFERENCE, lineBreak, error);
		}

		if (listFoldersResult.status === SdkOperationResultUtils.STATUS.ERROR) {
			throw listFoldersResult.errorMessages;
		}
		return listFoldersResult.data;
	}

	async listFiles(selectedFolder) {
		// quote folder path to preserve spaces
		const listFilesParams = {};
		listFilesParams[INTERMEDIATE_COMMANDS.LISTFILES.OPTIONS.FOLDER] = CommandUtils.quoteString(selectedFolder);
		listFilesParams[INTERMEDIATE_COMMANDS.LISTFILES.OPTIONS.AUTH_ID] = this._authId;

		const executionContext = SdkExecutionContext.Builder.forCommand(INTERMEDIATE_COMMANDS.LISTFILES.SDK_COMMAND)
			.integration()
			.addParams(listFilesParams)
			.build();
		
		try {
			return await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContext),
				message: NodeTranslationService.getMessage(MESSAGES.LOADING_FILES),
			});
		} catch (error) {
			throw NodeTranslationService.getMessage(GETTING_INTERNAL_ERROR, INTERMEDIATE_COMMANDS.LISTFILES.FILES_REFERENCE, lineBreak, error);
		}

	}
};
