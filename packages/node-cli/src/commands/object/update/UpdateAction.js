/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseAction = require('../../base/BaseAction');
const { ActionResult } = require('../../../services/actionresult/ActionResult');
const CommandUtils = require('../../../utils/CommandUtils');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const executeWithSpinner = require('../../../ui/CliSpinner').executeWithSpinner;
const SdkExecutionContext = require('../../../SdkExecutionContext');
const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');
const { getProjectDefaultAuthId } = require('../../../utils/AuthenticationUtils');

const {
	COMMAND_UPDATE: { MESSAGES },
} = require('../../../services/TranslationKeys');

const ANSWERS_NAMES = {
	FILTER_BY_SCRIPT_ID: 'filterByScriptId',
	OVERWRITE_OBJECTS: 'overwriteObjects',
	SCRIPT_ID_LIST: 'scriptid',
	SCRIPT_ID_FILTER: 'scriptIdFilter',
};

const COMMAND_OPTIONS = {
	AUTH_ID: 'authid',
	PROJECT: 'project',
	SCRIPT_ID: 'scriptid',
};

module.exports = class UpdateAction extends BaseAction {
	constructor(options) {
		super(options);
	}

	preExecute(params) {
		params[COMMAND_OPTIONS.PROJECT] = CommandUtils.quoteString(this._projectFolder);
		params[COMMAND_OPTIONS.AUTH_ID] = getProjectDefaultAuthId(this._executionPath);
		params[COMMAND_OPTIONS.SCRIPT_ID] = [...new Set(params[ANSWERS_NAMES.SCRIPT_ID_LIST])].join(' ');
		return params;
	}

	async execute(params) {
		try {
			if (params.hasOwnProperty(ANSWERS_NAMES.OVERWRITE_OBJECTS) && !params[ANSWERS_NAMES.OVERWRITE_OBJECTS]) {
				throw NodeTranslationService.getMessage(MESSAGES.CANCEL_UPDATE);
			}
			const sdkParams = CommandUtils.extractCommandOptions(params, this._commandMetadata);

			const executionContextForUpdate = SdkExecutionContext.Builder.forCommand(this._commandMetadata.sdkCommand)
				.integration()
				.addParams(sdkParams)
				.build();

			const operationResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContextForUpdate),
				message: NodeTranslationService.getMessage(MESSAGES.UPDATING_OBJECTS),
			});

			return operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
				? ActionResult.Builder.withData(operationResult.data)
					.withResultMessage(operationResult.resultMessage)
					.withCommandParameters(sdkParams)
					.build()
				: ActionResult.Builder.withErrors(operationResult.errorMessages).withCommandParameters(sdkParams).build();
		} catch (error) {
			return ActionResult.Builder.withErrors([error]).build();
		}
	}
};
