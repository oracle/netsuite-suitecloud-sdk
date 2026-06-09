/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const {
	default: { prompt },
} = require('inquirer');

const BaseInputHandler = require('../../base/BaseInputHandler');
const CommandUtils = require('../../../utils/CommandUtils');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');
const AccountFileCabinetService = require('../../../services/AccountFileCabinetService');
const { getProjectDefaultAuthId } = require('../../../utils/AuthenticationUtils');
const { showValidationResults, validateFieldIsNotEmpty } = require('../../../validation/InteractiveAnswersValidator');
const {
	COMMAND_COMPAREFILE: { ERRORS, QUESTIONS },
} = require('../../../services/TranslationKeys');

const SUITE_SCRIPTS_FOLDER = '/SuiteScripts';
const COMMAND_OPTIONS = {
	FOLDER: 'folder',
	PATH: 'path',
};

module.exports = class CompareFilesInputHandler extends BaseInputHandler {
	constructor(options) {
		super(options);
		this._authId = getProjectDefaultAuthId(this._executionPath);
	}

	async getParameters(params) {
		const accountFileCabinetService = new AccountFileCabinetService(this._sdkPath, this._executionEnvironmentContext, this._authId);

		const listFoldersResult = await accountFileCabinetService.getAccountFileCabinetFolders();
		if (listFoldersResult.length === 0) {
			throw NodeTranslationService.getMessage(ERRORS.NO_FOLDERS_FOUND);
		}

		const selectFolderAnswer = await prompt([this._generateSelectFolderQuestion(listFoldersResult)]);
		const listFilesResult = await accountFileCabinetService.listFiles(selectFolderAnswer[COMMAND_OPTIONS.FOLDER]);

		if (listFilesResult.status === SdkOperationResultUtils.STATUS.ERROR) {
			throw listFilesResult.errorMessages;
		}
		if (Array.isArray(listFilesResult.data) && listFilesResult.data.length === 0) {
			throw SdkOperationResultUtils.getResultMessage(listFilesResult);
		}

		const selectFileAnswer = await prompt([this._generateSelectFileQuestion(listFilesResult)]);
		return selectFileAnswer;
	}

	_generateSelectFolderQuestion(listFoldersResult) {
		return {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: COMMAND_OPTIONS.FOLDER,
			message: NodeTranslationService.getMessage(QUESTIONS.SELECT_FOLDER),
			default: SUITE_SCRIPTS_FOLDER,
			choices: listFoldersResult.map((folderPath) => ({ name: folderPath, value: folderPath })),
		};
	}

	_generateSelectFileQuestion(listFilesResult) {
		return {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: COMMAND_OPTIONS.PATH,
			message: NodeTranslationService.getMessage(QUESTIONS.SELECT_FILE),
			choices: listFilesResult.data.map((filePath) => ({ name: filePath, value: filePath })),
			validate: (fieldValue) => showValidationResults(fieldValue, validateFieldIsNotEmpty),
		};
	}
};
