/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const SdkExecutionContext = require('../SdkExecutionContext');
const SdkExecutor = require('../SdkExecutor');
const NodeTranslationService = require('../services/NodeTranslationService');
const executeWithSpinner = require('../ui/CliSpinner').executeWithSpinner;
const { getProjectDefaultAuthId } = require('../utils/AuthenticationUtils');
const SdkOperationResultUtils = require('../utils/SdkOperationResultUtils');
const { lineBreak } = require('../loggers/LoggerConstants');
const {
	COMMAND_LISTFILES: { LOADING_FOLDERS, ERROR_INTERNAL },
} = require('./TranslationKeys');

const LIST_FOLDERS = {
	COMMAND: 'listfolders',
	OPTIONS: {
		AUTH_ID: 'authid',
	},
};

class AccountFileCabinetService {
	async _listFolders(sdkExecutor, path, commandName) {
		const executionContext = SdkExecutionContext.Builder.forCommand(LIST_FOLDERS.COMMAND)
			.integration()
			.addParam(LIST_FOLDERS.OPTIONS.AUTH_ID, getProjectDefaultAuthId(path))
			.build();

		let listFoldersResult;
		try {
			listFoldersResult = await executeWithSpinner({
				action: sdkExecutor.execute(executionContext),
				message: NodeTranslationService.getMessage(LOADING_FOLDERS),
			});
		} catch (error) {
			throw NodeTranslationService.getMessage(ERROR_INTERNAL, commandName, lineBreak, error);
		}

		if (listFoldersResult.status === SdkOperationResultUtils.STATUS.ERROR) {
			throw listFoldersResult.errorMessages;
		}
		return listFoldersResult;
	}

	async getFileCabinetFolders(sdkPath, executionEnvironmentContext, executionPath, commandName) {
		const sdkExecutor = new SdkExecutor(sdkPath, executionEnvironmentContext);
		let listFoldersResult = await this._listFolders(sdkExecutor, executionPath, commandName);
		return listFoldersResult.data;
	}
}

module.exports = new AccountFileCabinetService();
