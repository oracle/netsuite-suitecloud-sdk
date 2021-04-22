/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { prompt } = require('inquirer');
const CommandUtils = require('../../../utils/CommandUtils');
const AccountFileCabinetService = require("../../../services/AccountFileCabinetService")
const NodeTranslationService = require('../../../services/NodeTranslationService');
const BaseInputHandler = require('../../base/BaseInputHandler');
const SdkExecutor = require('../../../SdkExecutor');
const { lineBreak } = require('../../../loggers/LoggerConstants');
const {
	COMMAND_LISTFILES: { SELECT_FOLDER, ERROR_INTERNAL },
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
		this._sdkExecutor = new SdkExecutor(this._sdkPath, this._executionEnvironmentContext);
	}

	async getParameters(params) {
		const fileCabinetFolders = await AccountFileCabinetService.getFileCabinetFolders(this._executionPath, this._commandMetadata.name);

		try {
			return prompt([
				{
					type: CommandUtils.INQUIRER_TYPES.LIST,
					name: this._commandMetadata.options.folder.name,
					message: NodeTranslationService.getMessage(SELECT_FOLDER),
					default: SUITE_SCRIPTS_FOLDER,
					choices: fileCabinetFolders,
				},
			]);
		} catch (error) {
			throw NodeTranslationService.getMessage(ERROR_INTERNAL, this._commandMetadata.name, lineBreak, error);
		}
	}

};
