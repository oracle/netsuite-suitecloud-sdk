/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseAction = require('../base/BaseAction');
const CommandUtils = require('../../utils/CommandUtils');
const { executeWithSpinner } = require('../../ui/CliSpinner');
const SDKOperationResultUtils = require('../../utils/SDKOperationResultUtils');
const SDKExecutionContext = require('../../SDKExecutionContext');
const NodeTranslationService = require('../../services/NodeTranslationService');
const { ActionResult } = require('../../services/actionresult/ActionResult');

const {
	COMMAND_UPLOADFILES: { MESSAGES },
} = require('../../services/TranslationKeys');

const COMMAND_OPTIONS = {
	PATHS: 'paths',
	PROJECT: 'project',
};

module.exports = class UploadFilesAction extends BaseAction {
	constructor(options) {
		super(options);
	}

	preExecute(params) {
		const { PATHS } = COMMAND_OPTIONS;

		if (params.hasOwnProperty(PATHS)) {
			if (Array.isArray(params[PATHS])) {
				params[PATHS] = params[PATHS].map(CommandUtils.quoteString).join(' ');
			} else {
				params[PATHS] = CommandUtils.quoteString(params[PATHS]);
			}
		}
		return params;
	}

	async execute(params) {
		try {
			const executionContextUploadFiles = new SDKExecutionContext({
				command: this._commandMetadata.sdkCommand,
				includeProjectDefaultAuthId: true,
				params: params,
			});

			const operationResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContextUploadFiles),
				message: NodeTranslationService.getMessage(MESSAGES.UPLOADING_FILES),
			});
			return operationResult.status === SDKOperationResultUtils.STATUS.SUCCESS
				? ActionResult.Builder.withData(operationResult.data)
						.withResultMessage(operationResult.resultMessage)
						.withProjectFolder(this._projectFolder)
						.build()
				: ActionResult.Builder.withErrors(SDKOperationResultUtils.collectErrorMessages(operationResult)).build();
		} catch (error) {
			return ActionResult.Builder.withErrors([error]).build();
		}
	}
};
