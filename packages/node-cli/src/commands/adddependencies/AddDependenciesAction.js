/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ActionResult } = require('../../services/actionresult/ActionResult');
const BaseAction = require('../basecommand/BaseAction');
const SDKExecutionContext = require('../../SDKExecutionContext');
const executeWithSpinner = require('../../ui/CliSpinner').executeWithSpinner;
const NodeTranslationService = require('../../services/NodeTranslationService');
const SDKOperationResultUtils = require('../../utils/SDKOperationResultUtils');

const {
	COMMAND_ADDDEPENDENCIES: { MESSAGES },
} = require('../../services/TranslationKeys');

module.exports = class AddDependenciesAction extends BaseAction {
	constructor(options) {
		super(options);
    }

	preExecute(params) {
		params[COMMAND_OPTIONS.PROJECT] = CommandUtils.quoteString(this._projectFolder);
		return params;
	}

	async execute(params) {
		try {
			const executionContext = new SDKExecutionContext({
				command: this._commandMetadata.sdkCommand,
				params: params,
				flags: [COMMAND_OPTIONS.ALL],
				requiresContextParams: true,
			});

			const operationResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContext),
				message: NodeTranslationService.getMessage(MESSAGES.ADDING_DEPENDENCIES),
			});

			return operationResult.status === SDKOperationResultUtils.STATUS.SUCCESS
				? ActionResult.Builder.withData(operationResult.data).withResultMessage(operationResult.resultMessage).build()
				: ActionResult.Builder.withErrors(SDKOperationResultUtils.collectErrorMessages(operationResult)).build();
		} catch (error) {
			return ActionResult.Builder.withErrors([error]).build();
		}
	}
}