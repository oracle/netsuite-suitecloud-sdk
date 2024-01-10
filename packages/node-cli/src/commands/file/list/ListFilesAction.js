/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ActionResult } = require('../../../services/actionresult/ActionResult');
const SdkExecutionContext = require('../../../SdkExecutionContext');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const executeWithSpinner = require('../../../ui/CliSpinner').executeWithSpinner;
const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');
const { getProjectDefaultAuthId } = require('../../../utils/AuthenticationUtils');
const BaseAction = require('../../base/BaseAction');
const {
	COMMAND_LISTFILES: { LOADING_FILES },
} = require('../../../services/TranslationKeys');

const COMMAND_OPTIONS = {
	AUTH_ID: 'authid'
}

module.exports = class ListFilesAction extends BaseAction {
	constructor(options) {
		super(options);
	}

	preExecute(args) {
		args[COMMAND_OPTIONS.AUTH_ID] = getProjectDefaultAuthId(this._executionPath);
		return args;
	}

	async execute(params) {
		try {
			// quote folder path to preserve spaces
			params.folder = `\"${params.folder}\"`;
			const executionContext = SdkExecutionContext.Builder.forCommand(this._commandMetadata.sdkCommand)
				.integration()
				.addParams(params)
				.build();

			const operationResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContext),
				message: NodeTranslationService.getMessage(LOADING_FILES),
			});

			return operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
				? ActionResult.Builder.withData(operationResult.data)
					.withResultMessage(operationResult.resultMessage)
					.withCommandParameters(params)
					.build()
				: ActionResult.Builder.withErrors(operationResult.errorMessages).withCommandParameters(params).build();
		} catch (error) {
			return ActionResult.Builder.withErrors([error]).build();
		}
	}
};
