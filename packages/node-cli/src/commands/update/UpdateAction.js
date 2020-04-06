/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseAction = require('../basecommand/BaseAction');
const { ActionResult } = require('../../services/actionresult/ActionResult');
const CommandUtils = require('../../utils/CommandUtils');
const NodeTranslationService = require('../../services/NodeTranslationService');
const executeWithSpinner = require('../../ui/CliSpinner').executeWithSpinner;
const SDKExecutionContext = require('../../SDKExecutionContext');
const SDKOperationResultUtils = require('../../utils/SDKOperationResultUtils');

const {
	COMMAND_UPDATE: { MESSAGES },
} = require('../../services/TranslationKeys');

const ANSWERS_NAMES = {
	FILTER_BY_SCRIPT_ID: 'filterByScriptId',
	OVERWRITE_OBJECTS: 'overwriteObjects',
	SCRIPT_ID_LIST: 'scriptid',
	SCRIPT_ID_FILTER: 'scriptIdFilter',
};

const COMMAND_OPTIONS = {
	PROJECT: 'project',
	SCRIPT_ID: 'scriptid',
};


module.exports = class UpdateAction extends BaseAction {
	constructor(options) {
        super(options);
	}

	preExecute(args) {
		return {
			...args,
			[COMMAND_OPTIONS.PROJECT]: CommandUtils.quoteString(this._projectFolder),
		};
	}

	async execute(args) {
		try {
			if (args.hasOwnProperty(ANSWERS_NAMES.OVERWRITE_OBJECTS) && !args[ANSWERS_NAMES.OVERWRITE_OBJECTS]) {
				throw NodeTranslationService.getMessage(MESSAGES.CANCEL_UPDATE);
			}
			const SDKParams = CommandUtils.extractCommandOptions(args, this._commandMetadata);

			const executionContextForUpdate = new SDKExecutionContext({
				command: this._commandMetadata.sdkCommand,
				includeProjectDefaultAuthId: true,
				params: SDKParams,
			});

			const operationResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContextForUpdate),
				message: NodeTranslationService.getMessage(MESSAGES.UPDATING_OBJECTS),
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
