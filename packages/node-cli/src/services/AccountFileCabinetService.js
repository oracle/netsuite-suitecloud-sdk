/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const NodeTranslationService = require('../services/NodeTranslationService');
const executeWithSpinner = require('../ui/CliSpinner').executeWithSpinner;
const {
	executeListFilesCommand,
	executeListFoldersCommand,
} = require('@oracle/suitecloud-sdk-core/commands/file/list/ListFilesHandler');
const {
	getAuthCredentialsForProjectCommand,
	refreshAuthCredentialsForProjectCommand,
	shouldRetryProjectCommandAuth,
} = require('../utils/ProjectAuthUtils');
const { lineBreak } = require('../loggers/LoggerOsConstants');
const {
	COMMAND_IMPORTFILES: { MESSAGES },
	COMMAND_LISTFILES: { LOADING_FOLDERS, GETTING_INERNAL_ERROR: GETTING_INTERNAL_ERROR },
} = require('./TranslationKeys');

const INTERMEDIATE_COMMANDS = {
	LISTFILES: {
		FILES_REFERENCE: 'File Cabinet files',
	},
	LISTFOLDERS: {
		FOLDERS_REFERENCE: 'File Cabinet folders',
	},
};

module.exports = class AccountFileCabinetService {
	constructor(sdkPath, executionEnvironmentContext, authId) {
		this._sdkPath = sdkPath;
		this._executionEnvironmentContext = executionEnvironmentContext;
		this._authId = authId;
	}

	async getAccountFileCabinetFolders() {
		let listFoldersResult;
		try {
			listFoldersResult = await executeWithSpinner({
				action: this._executeWithAuthRetry(async (authCredentials) =>
					executeListFoldersCommand({
						hostName: authCredentials.hostName,
						accessToken: authCredentials.accessToken,
						userAgent: this._getUserAgent(),
					})
				),
				message: NodeTranslationService.getMessage(LOADING_FOLDERS),
			});
		} catch (error) {
			throw NodeTranslationService.getMessage(GETTING_INTERNAL_ERROR, INTERMEDIATE_COMMANDS.LISTFOLDERS.FOLDERS_REFERENCE, lineBreak, error);
		}

		if (listFoldersResult.status === 'ERROR') {
			throw listFoldersResult.errorMessages;
		}
		return listFoldersResult.data;
	}

	async listFiles(selectedFolder) {
		try {
			return await executeWithSpinner({
				action: this._executeWithAuthRetry(async (authCredentials) =>
					executeListFilesCommand({
						hostName: authCredentials.hostName,
						accessToken: authCredentials.accessToken,
						folderPath: selectedFolder,
						userAgent: this._getUserAgent(),
					})
				),
				message: NodeTranslationService.getMessage(MESSAGES.LOADING_FILES),
			});
		} catch (error) {
			throw NodeTranslationService.getMessage(GETTING_INTERNAL_ERROR, INTERMEDIATE_COMMANDS.LISTFILES.FILES_REFERENCE, lineBreak, error);
		}

	}

	async _executeWithAuthRetry(operation) {
		let authCredentials = await getAuthCredentialsForProjectCommand(this._sdkPath, this._authId);
		let operationResult = await operation(authCredentials);

		if (!shouldRetryProjectCommandAuth(operationResult)) {
			return operationResult;
		}

		authCredentials = await refreshAuthCredentialsForProjectCommand(
			this._sdkPath,
			this._authId,
			this._executionEnvironmentContext
		);
		operationResult = await operation(authCredentials);
		return operationResult;
	}

	_getUserAgent() {
		if (!this._executionEnvironmentContext) {
			return undefined;
		}
		const platform = this._executionEnvironmentContext.getPlatform && this._executionEnvironmentContext.getPlatform();
		const platformVersion =
			this._executionEnvironmentContext.getPlatformVersion && this._executionEnvironmentContext.getPlatformVersion();
		if (!platform || !platformVersion) {
			return undefined;
		}
		return `${platform}/${platformVersion}`;
	}
};
