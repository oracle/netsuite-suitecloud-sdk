/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ActionResult } = require('../../services/actionresult/ActionResult');
const SDKExecutionContext = require('../../SDKExecutionContext');
const NodeTranslationService = require('../../services/NodeTranslationService');
const executeWithSpinner = require('../../ui/CliSpinner').executeWithSpinner;
const SDKOperationResultUtils = require('../../utils/SDKOperationResultUtils');
const BaseAction = require('../basecommand/BaseAction');
const {	COMMAND_LISTFILES: { LOADING_FILES } } = require('../../services/TranslationKeys');


module.exports = class ListFilesAction extends BaseAction {
	constructor(options) {
        super(options);
	}

	async execute(params) {
		try {
			// quote folder path to preserve spaces
			params.folder = `\"${params.folder}\"`;
			const executionContext = new SDKExecutionContext({
				command: this._commandMetadata.sdkCommand,
				params: params,
				includeProjectDefaultAuthId: true,
			});

			const operationResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContext),
				message: NodeTranslationService.getMessage(LOADING_FILES),
			});

			return operationResult.status === SDKOperationResultUtils.STATUS.SUCCESS
				? ActionResult.Builder.withData(operationResult.data).withResultMessage(operationResult.resultMessage).build()
				: ActionResult.Builder.withErrors(SDKOperationResultUtils.collectErrorMessages(operationResult)).build();
		} catch (error) {
			return ActionResult.Builder.withErrors([error]).build();
		}
	}
};
