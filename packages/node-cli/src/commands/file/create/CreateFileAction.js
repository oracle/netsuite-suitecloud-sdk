/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const path = require('path');
const { executeWithSpinner } = require('../../../ui/CliSpinner');
const { ActionResult } = require('../../../services/actionresult/ActionResult');
const { FOLDERS } = require('../../../ApplicationConstants');
const BaseAction = require('../../base/BaseAction');
const CommandUtils = require('../../../utils/CommandUtils');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const SdkExecutionContext = require('../../../SdkExecutionContext');
const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');

const {
	COMMAND_CREATEFILE: { MESSAGES },
} = require('../../../services/TranslationKeys');

const COMMAND_OPTIONS = {
	MODULE: 'module',
	PATH: 'path',
	PROJECT: 'project',
	TYPE: 'type',
};
const JS_EXTENSION = '.js';

module.exports = class CreateFileAction extends BaseAction {
	preExecute(params) {
		params[COMMAND_OPTIONS.PROJECT] = CommandUtils.quoteString(this._projectFolder);

		if (this._runInInteractiveMode) {
			params[COMMAND_OPTIONS.PATH] = params.parentPath + params.name;
		}
		if (params.hasOwnProperty(COMMAND_OPTIONS.PATH)) {
			if (!params[COMMAND_OPTIONS.PATH].endsWith(JS_EXTENSION)) {
				params[COMMAND_OPTIONS.PATH] = params[COMMAND_OPTIONS.PATH] + JS_EXTENSION;
			}
			params[COMMAND_OPTIONS.PATH] = CommandUtils.quoteString(params[COMMAND_OPTIONS.PATH]);
		}

		if (params.hasOwnProperty(COMMAND_OPTIONS.MODULE)) {
			if (Array.isArray(params[COMMAND_OPTIONS.MODULE])) {
				params[COMMAND_OPTIONS.MODULE] = params[COMMAND_OPTIONS.MODULE].map(CommandUtils.quoteString).join(' ');
			} else {
				params[COMMAND_OPTIONS.MODULE] = CommandUtils.quoteString(params[COMMAND_OPTIONS.MODULE]);
			}
		}

		delete params.parentPath;
		delete params.name;

		return params;
	}

	async execute(params) {
		const executionContextCreateFile = SdkExecutionContext.Builder.forCommand(this._commandMetadata.sdkCommand)
			.integration()
			.addParams(params)
			.build();

		const operationResult = await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContextCreateFile),
			message: NodeTranslationService.getMessage(MESSAGES.CREATING_FILE),
		});

		if (operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS) {
			const suiteScriptFileAbsolutePath = path.join(
				this._projectFolder,
				FOLDERS.FILE_CABINET,
				CommandUtils.unquoteString(params[COMMAND_OPTIONS.PATH])
			);

			let resultMessage = NodeTranslationService.getMessage(MESSAGES.SUITESCRIPT_FILE_CREATED, suiteScriptFileAbsolutePath);
			if (params.hasOwnProperty(COMMAND_OPTIONS.MODULE)) {
				resultMessage = NodeTranslationService.getMessage(
					MESSAGES.SUITESCRIPT_FILE_CREATED_WITH_MODULES,
					suiteScriptFileAbsolutePath,
					params[COMMAND_OPTIONS.MODULE].split(' ').join(', ')
				);
			}

			return ActionResult.Builder.withData(operationResult.data).withResultMessage(resultMessage).withCommandParameters(params).build();
		} else {
			return ActionResult.Builder.withErrors(operationResult.errorMessages).withCommandParameters(params).build();
		}
	}
};
