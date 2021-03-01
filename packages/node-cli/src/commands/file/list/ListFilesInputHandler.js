/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { prompt } = require('inquirer');
const CommandUtils = require('../../../utils/CommandUtils');
const SdkExecutionContext = require('../../../SdkExecutionContext');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const executeWithSpinner = require('../../../ui/CliSpinner').executeWithSpinner;
const BaseInputHandler = require('../../base/BaseInputHandler');
const SdkExecutor = require('../../../SdkExecutor');
const { getProjectDefaultAuthId } = require('../../../utils/AuthenticationUtils');
const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');
const { lineBreak } = require('../../../loggers/LoggerConstants');
const {
	COMMAND_LISTFILES: { LOADING_FOLDERS, SELECT_FOLDER, RESTRICTED_FOLDER, ERROR_INTERNAL },
} = require('../../../services/TranslationKeys');

const LIST_FOLDERS = {
	COMMAND: 'listfolders',
	OPTIONS: {
		AUTH_ID: 'authid',
	},
};
const SUITE_SCRIPTS_FOLDER = '/SuiteScripts';

module.exports = class ListFilesInputHandler extends BaseInputHandler {
	constructor(options) {
		super(options);

		// TODO input handlers shouldn't execute actions. rework this
		this._sdkExecutor = new SdkExecutor(options.sdkPath, this._executionEnvironmentContext);
	}

	async getParameters(params) {
		const executionContext = SdkExecutionContext.Builder.forCommand(LIST_FOLDERS.COMMAND)
			.integration()
			.addParam(LIST_FOLDERS.OPTIONS.AUTH_ID, getProjectDefaultAuthId(this._executionPath))
			.build();

		let listFoldersResult;
		try {
			listFoldersResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContext),
				message: NodeTranslationService.getMessage(LOADING_FOLDERS),
			});
		} catch (error) {
			throw NodeTranslationService.getMessage(ERROR_INTERNAL, this._commandMetadata.name, lineBreak, error);
		}

		if (listFoldersResult.status === SdkOperationResultUtils.STATUS.ERROR) {
			throw listFoldersResult.errorMessages;
		}

		try {
			return prompt([
				{
					type: CommandUtils.INQUIRER_TYPES.LIST,
					name: this._commandMetadata.options.folder.name,
					message: NodeTranslationService.getMessage(SELECT_FOLDER),
					default: SUITE_SCRIPTS_FOLDER,
					choices: this._getFileCabinetFolders(listFoldersResult),
				},
			]);
		} catch (error) {
			throw NodeTranslationService.getMessage(ERROR_INTERNAL, this._commandMetadata.name, lineBreak, error);
		}
	}

	_getFileCabinetFolders(listFoldersResponse) {
		return listFoldersResponse.data.map((folder) => {
			return {
				name: folder.path,
				value: folder.path,
				disabled: folder.isRestricted ? NodeTranslationService.getMessage(RESTRICTED_FOLDER) : '',
			};
		});
	}
};
