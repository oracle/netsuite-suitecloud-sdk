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
const CommandUtils = require('../../../utils/CommandUtils');
const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');

const {
	COMMAND_ADDDEPENDENCIES: { MESSAGES },
} = require('../../../services/TranslationKeys');

const COMMAND_OPTIONS = {
	AUTH_ID: 'authid',
	ALL: 'all',
	PROJECT: 'project',
};

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
			const executionContext = SdkExecutionContext.Builder.forCommand(this._commandMetadata.sdkCommand)
				.integration()
				.addParams(params)
				.addFlag(COMMAND_OPTIONS.ALL)
				.build();

			const operationResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContext),
				message: NodeTranslationService.getMessage(MESSAGES.ADDING_DEPENDENCIES),
			});

			return operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
				? ActionResult.Builder.withData(operationResult.data).withResultMessage(operationResult.resultMessage).build()
				: ActionResult.Builder.withErrors(operationResult.errorMessages).build();
		} catch (error) {
			return ActionResult.Builder.withErrors([error]).build();
		}
	}
};
