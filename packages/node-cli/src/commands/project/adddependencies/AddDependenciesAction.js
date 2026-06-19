/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ActionResult } = require('../../../services/actionresult/ActionResult');
const BaseAction = require('../../base/BaseAction');
const SdkExecutionContext = require('../../../SdkExecutionContext');
const executeWithSpinner = require('../../../ui/CliSpinner').executeWithSpinner;
const NodeTranslationService = require('../../../services/NodeTranslationService');
const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');
const { toErrorMessages } = require('../../../utils/ErrorMessageUtils');
const {
	prepareAddDependenciesExecution,
} = require('@oracle/suitecloud-sdk-core/commands/project/adddependencies/AddDependenciesHandler');

const {
	COMMAND_ADDDEPENDENCIES: { MESSAGES },
} = require('../../../services/TranslationKeys');

module.exports = class AddDependenciesAction extends BaseAction {
	constructor(options) {
		super(options);
	}

	preExecute(params) {
		const executionPlan = prepareAddDependenciesExecution(params, this._projectFolder);
		params.__tsExecutionPlan = executionPlan;
		return params;
	}

	async execute(params) {
		try {
			const executionPlan = params.__tsExecutionPlan || prepareAddDependenciesExecution(params, this._projectFolder);
			delete params.__tsExecutionPlan;

			const executionContext = SdkExecutionContext.Builder.forCommand(this._commandMetadata.sdkCommand)
				.integration()
				.addParams(executionPlan.params)
				.addFlags(executionPlan.flags)
				.build();

			const operationResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContext),
				message: NodeTranslationService.getMessage(MESSAGES.ADDING_DEPENDENCIES),
			});

			return operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
				? ActionResult.Builder.withData(operationResult.data).withResultMessage(operationResult.resultMessage).build()
				: ActionResult.Builder.withErrors(operationResult.errorMessages).build();
		} catch (error) {
			return ActionResult.Builder.withErrors(toErrorMessages(error)).build();
		}
	}
};
