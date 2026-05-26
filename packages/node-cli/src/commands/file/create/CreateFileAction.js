/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { executeWithSpinner } = require('../../../ui/CliSpinner');
const { ActionResult } = require('../../../services/actionresult/ActionResult');
const BaseAction = require('../../base/BaseAction');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const {
	normalizeCreateFileParams,
	buildCreateFileResultData,
} = require('@oracle/suitecloud-sdk-core/commands/file/create/CreateFileHandler');
const {
	executeCreateFile,
	FILE_CREATE_STATUS,
} = require('@oracle/suitecloud-sdk-core/commands/file/create/CreateFileExecutor');

const {
	COMMAND_CREATEFILE: { MESSAGES },
} = require('../../../services/TranslationKeys');

module.exports = class CreateFileAction extends BaseAction {
	preExecute(params) {
		return normalizeCreateFileParams(params, this._projectFolder, this._runInInteractiveMode);
	}

	async execute(params) {
		const operationResult = await executeWithSpinner({
			action: executeCreateFile({
				projectFolder: this._projectFolder,
				path: params.path,
				type: params.type,
				module: params.module,
			}),
			message: NodeTranslationService.getMessage(MESSAGES.CREATING_FILE),
		});

		if (operationResult.status === FILE_CREATE_STATUS.SUCCESS) {
			const resultData = buildCreateFileResultData(this._projectFolder, params);
			const suiteScriptFileAbsolutePath = resultData.suiteScriptFileAbsolutePath;

			let resultMessage = NodeTranslationService.getMessage(MESSAGES.SUITESCRIPT_FILE_CREATED, suiteScriptFileAbsolutePath);
			if (resultData.modulesSummary) {
				resultMessage = NodeTranslationService.getMessage(
					MESSAGES.SUITESCRIPT_FILE_CREATED_WITH_MODULES,
					suiteScriptFileAbsolutePath,
					resultData.modulesSummary
				);
			}

			return ActionResult.Builder.withData(operationResult.data).withResultMessage(resultMessage).withCommandParameters(params).build();
		} else {
			return ActionResult.Builder.withErrors(operationResult.errorMessages).withCommandParameters(params).build();
		}
	}
};
