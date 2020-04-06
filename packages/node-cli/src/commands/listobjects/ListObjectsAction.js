/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ActionResult } = require('../../services/actionresult/ActionResult');
const CommandUtils = require('../../utils/CommandUtils');
const executeWithSpinner = require('../../ui/CliSpinner').executeWithSpinner;
const BaseAction = require('../basecommand/BaseAction');
const NodeTranslationService = require('../../services/NodeTranslationService');
const SDKOperationResultUtils = require('../../utils/SDKOperationResultUtils');
const SDKExecutionContext = require('../../SDKExecutionContext');

const {	COMMAND_LISTOBJECTS: { LISTING_OBJECTS } } = require('../../services/TranslationKeys');

module.exports = class ListObjectsAction extends BaseAction {
	constructor(options) {
        super(options);
	}


	async execute(params) {
		try {
			const sdkParams = CommandUtils.extractCommandOptions(params, this._commandMetadata);
			if (Array.isArray(sdkParams.type)) {
				sdkParams.type = sdkParams.type.join(' ');
			}
			const executionContext = new SDKExecutionContext({
				command: this._commandMetadata.sdkCommand,
				sdkParams,
				includeProjectDefaultAuthId: true,
			});

			const actionListObjects = this._sdkExecutor.execute(executionContext);

			const operationResult = await executeWithSpinner({
				action: actionListObjects,
				message: NodeTranslationService.getMessage(LISTING_OBJECTS),
			});

			return operationResult.status === SDKOperationResultUtils.STATUS.SUCCESS
				? ActionResult.Builder.withData(operationResult.data)
						.withResultMessage(operationResult.resultMessage)
						.build()
				: ActionResult.Builder.withErrors(SDKOperationResultUtils.collectErrorMessages(operationResult)).build();
		} catch (error) {
			return ActionResult.Builder.withErrors([error]).build();
		}
	}
};
