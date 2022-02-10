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
const { STATUS } = require('../../../utils/SdkOperationResultUtils');
const { getProjectDefaultAuthId } = require('../../../utils/AuthenticationUtils');

const {
	COMMAND_UPDATE: { ERRORS, MESSAGES, OUTPUT },
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
const COMMAND_UPDATE_CUSTOM_RECORD_WITH_INSTANCES = 'updatecustomrecordwithinstances';
const SCRIPT_ID_PREFIXES = {
	CUSTOM_RECORD: 'customrecord',
	CUSTOM_SEGMENT: 'cseg',
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
				const customRecordScriptIds = params[COMMAND_OPTIONS.SCRIPT_ID].split(' ').filter((scriptId) => this._isCustomRecord(scriptId));
				params[COMMAND_OPTIONS.SCRIPT_ID] = params[COMMAND_OPTIONS.SCRIPT_ID]
					.split(' ')
					.filter((scriptId) => !this._isCustomRecord(scriptId))
					.join(' ');
				const resultIncludeCustomInstances = await this._updateCustomRecordWithInstances(params, customRecordScriptIds);
				if (resultIncludeCustomInstances.successful == false) {
					for (const result of resultIncludeCustomInstances.results) {
						if (result.status == STATUS.ERROR) {
							return ActionResult.Builder.withErrors(result.errorMessages).build();
						}
					}
				}
			}

			if (params[COMMAND_OPTIONS.SCRIPT_ID] === '') {
				return ActionResult.Builder.withData([]).build(); //Empty result since it has been already logged
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

			return operationResult.status === STATUS.SUCCESS
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
		return scriptid.startsWith(SCRIPT_ID_PREFIXES.CUSTOM_RECORD) || scriptid.startsWith(SCRIPT_ID_PREFIXES.CUSTOM_SEGMENT);
	}

	async _updateCustomRecordWithInstances(params, customRecordScriptIds) {
		this._log.result(NodeTranslationService.getMessage(OUTPUT.UPDATED_CUSTOM_RECORDS));
		const copiedParams = { ...params };
		const operationResults = { results: [], successful: true };
		for (const scriptId of customRecordScriptIds) {
			const operationResult = await this._executeCommandUpdateCustomRecordWithInstances(copiedParams, scriptId);
			operationResults.results.push(operationResult);
			if (operationResult.status === STATUS.ERROR) {
				this._log.error(NodeTranslationService.getMessage(ERRORS.CUSTOM_RECORD, scriptId));
				operationResults.successful = false;
				return operationResults;
			} else {
				this._log.result(NodeTranslationService.getMessage(OUTPUT.UPDATED_CUSTOM_RECORD_SCRIPT_ID, scriptId));
			}
		}
		return operationResults;
	}

	async _executeCommandUpdateCustomRecordWithInstances(params, scriptId) {
		params[COMMAND_OPTIONS.SCRIPT_ID] = scriptId;
		const executionContextForUpdate = SdkExecutionContext.Builder.forCommand(COMMAND_UPDATE_CUSTOM_RECORD_WITH_INSTANCES)
			.integration()
			.addParam(COMMAND_OPTIONS.AUTH_ID, params[COMMAND_OPTIONS.AUTH_ID])
			.addParam(COMMAND_OPTIONS.PROJECT, params[COMMAND_OPTIONS.PROJECT])
			.addParam(COMMAND_OPTIONS.SCRIPT_ID, scriptId)
			.build();
		const operationResult = await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContextForUpdate),
			message: NodeTranslationService.getMessage(MESSAGES.UPDATING_OBJECT_WITH_CUSTOM_INSTANCES, scriptId),
		});
		return operationResult;
	}
};
