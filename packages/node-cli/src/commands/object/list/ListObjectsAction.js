/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ActionResult } = require('../../../services/actionresult/ActionResult');
const CommandUtils = require('../../../utils/CommandUtils');
const executeWithSpinner = require('../../../ui/CliSpinner').executeWithSpinner;
const BaseAction = require('../../base/BaseAction');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');
const SdkExecutionContext = require('../../../SdkExecutionContext');
const { getProjectDefaultAuthId } = require('../../../utils/AuthenticationUtils');

const {
	COMMAND_LISTOBJECTS: { LISTING_OBJECTS },
} = require('../../../services/TranslationKeys');

const COMMAND_PARAMETERS = {
	AUTH_ID: 'authid',
};

module.exports = class ListObjectsAction extends BaseAction {
	constructor(options) {
		super(options);
	}

	preExecute(params) {
		params[COMMAND_PARAMETERS.AUTH_ID] = getProjectDefaultAuthId(this._executionPath);
		return params;
	}

	async execute(params) {
		try {
			const sdkParams = CommandUtils.extractCommandOptions(params, this._commandMetadata);
			if (Array.isArray(sdkParams.type)) {
				sdkParams.type = sdkParams.type.join(' ');
			}

			const executionContext = SdkExecutionContext.Builder.forCommand(this._commandMetadata.sdkCommand)
				.integration()
				.addParams(sdkParams)
				.build();

			const actionListObjects = this._sdkExecutor.execute(executionContext);

			const operationResult = await executeWithSpinner({
				action: actionListObjects,
				message: NodeTranslationService.getMessage(LISTING_OBJECTS),
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
