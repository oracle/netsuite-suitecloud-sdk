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
	INCLUDE_CUSTOM_INSTANCES: 'includecustominstances',
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
			if (params.hasOwnProperty(ANSWERS_NAMES.INCLUDE_CUSTOM_INSTANCES) && params[ANSWERS_NAMES.INCLUDE_CUSTOM_INSTANCES]) {
				const customRecordScriptIds = params['scriptid'].split(' ').filter((scriptId) => this._isCustomRecord(scriptId));
				params['scriptid'] = params['scriptid']
					.split(' ')
					.filter((scriptId) => !this._isCustomRecord(scriptId))
					.join(' ');
				const resultIncludeCustomInstances = await this._updateCustomRecordWithInstances(params, customRecordScriptIds);
				if (resultIncludeCustomInstances.successful == false) {
					for (const result of resultIncludeCustomInstances.results) {
						if (result.status == 'ERROR') {
							return ActionResult.Builder.withErrors(result.errorMessages).build();
						}
					}
				}
			}

			if (params['scriptid'] === '') {
				return ActionResult.Builder.withData().withResultMessage('Update finished').build();
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

	_isCustomRecord(scriptid) {
		return scriptid.startsWith('customrecord') || scriptid.startsWith('cseg');
	}

	async _updateCustomRecordWithInstances(params, customRecordScriptIds) {
		const operationResults = { results: [], successful: true };
		for (const scriptId of customRecordScriptIds) {
			const operationResult = await this._executeCommandUpdateCustomRecordWithInstances(params, scriptId);
			operationResults.results.push(operationResult);
			if (operationResult.status === 'ERROR') {
				operationResults.successful = false;
				return operationResults;
			} else {
				this._log.result(operationResult.data);
			}
		}
		return operationResults;
	}

	async _executeCommandUpdateCustomRecordWithInstances(params, scriptId) {
		params['scriptid'] = scriptId;
		const executionContextForUpdate = SdkExecutionContext.Builder.forCommand('updatecustomrecordwithinstances')
			.integration()
			.addParam('authid', params['authid'])
			.addParam('project', params['project'])
			.addParam('scriptid', scriptId)
			.build();
		const operationResult = await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContextForUpdate),
			message: NodeTranslationService.getMessage(MESSAGES.UPDATING_OBJECT_WITH_CUSTOM_INSTANCES, scriptId),
		});
		return operationResult;
	}
};
