/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
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
	INCLUDE_CUSTOM_INSTANCES: 'includeinstances',
	OVERWRITE_OBJECTS: 'overwriteObjects',
	SCRIPT_ID_LIST: 'scriptid',
	SCRIPT_ID_FILTER: 'scriptIdFilter',
};

const COMMAND_OPTIONS = {
	AUTH_ID: 'authid',
	PROJECT: 'project',
	SCRIPT_ID: 'scriptid',
	INCLUDE_INSTANCES: 'includeinstances',
};
const COMMAND_UPDATE_CUSTOM_RECORD_WITH_INSTANCES = 'updatecustomrecordwithinstances';
const CUSTOM_RECORD_PREFIX = 'customrecord';
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
			let updateCustomRecordsWithInstancesResult = [];
			if (params.hasOwnProperty(COMMAND_OPTIONS.INCLUDE_INSTANCES) && params[COMMAND_OPTIONS.INCLUDE_INSTANCES]) {
				const customRecordScriptIds = params[COMMAND_OPTIONS.SCRIPT_ID].split(' ').filter((scriptId) => this._isCustomRecord(scriptId));
				if (customRecordScriptIds && customRecordScriptIds.length > 0) {
					params[COMMAND_OPTIONS.SCRIPT_ID] = params[COMMAND_OPTIONS.SCRIPT_ID]
						.split(' ')
						.filter((scriptId) => !this._isCustomRecord(scriptId))
						.join(' ');
					updateCustomRecordsWithInstancesResult = await this._updateCustomRecordWithInstances(params, customRecordScriptIds);
				}

				delete params[COMMAND_OPTIONS.INCLUDE_INSTANCES];
			}

			if (params[COMMAND_OPTIONS.SCRIPT_ID] === '') {
				// If there are no more objects to update (all were custom records) we already return with only previous messages
				return ActionResult.Builder.withData(updateCustomRecordsWithInstancesResult).build();
			}

			const sdkParams = CommandUtils.extractCommandOptions(params, this._commandMetadata);
			const updateObjectsResult = await this._updateObjects(sdkParams);
			const allResults = updateCustomRecordsWithInstancesResult.concat(updateObjectsResult.data);

			return updateObjectsResult.status === STATUS.SUCCESS
				? ActionResult.Builder.withData(allResults)
						.withResultMessage(updateObjectsResult.resultMessage)
						.withCommandParameters(sdkParams)
						.build()
				: ActionResult.Builder.withErrors(updateObjectsResult.errorMessages).withCommandParameters(sdkParams).build();
		} catch (error) {
			return ActionResult.Builder.withErrors([error]).build();
		}
	}

	_isCustomRecord(scriptid) {
		return scriptid.startsWith(CUSTOM_RECORD_PREFIX);
	}

	async _updateCustomRecordWithInstances(params, customRecordScriptIds) {
		this._log.result(NodeTranslationService.getMessage(OUTPUT.UPDATED_CUSTOM_RECORDS));
		const updateWithInstancesResults = [];

		for (const scriptId of customRecordScriptIds) {
			const updateCustomRecordResult = await this._executeCommandUpdateCustomRecordWithInstances(params, scriptId);
			let resultMessage;
			if (updateCustomRecordResult.status === STATUS.ERROR) {
				resultMessage = updateCustomRecordResult.errorMessages;
				this._log.warning(`${this._log.getPadding(1)}- ${NodeTranslationService.getMessage(ERRORS.CUSTOM_RECORD, scriptId, resultMessage)}`);
			} else {
				resultMessage = updateCustomRecordResult.data;
				this._log.result(`${this._log.getPadding(1)}- ${scriptId}`);
			}
			updateWithInstancesResults.push({
				key: scriptId,
				message: resultMessage,
				type: updateCustomRecordResult.status,
				includeinstances: true,
			});
		}
		return updateWithInstancesResults;
	}

	async _executeCommandUpdateCustomRecordWithInstances(params, scriptId) {
		const executionContextForUpdate = SdkExecutionContext.Builder.forCommand(COMMAND_UPDATE_CUSTOM_RECORD_WITH_INSTANCES)
			.integration()
			.addParam(COMMAND_OPTIONS.AUTH_ID, params[COMMAND_OPTIONS.AUTH_ID])
			.addParam(COMMAND_OPTIONS.PROJECT, params[COMMAND_OPTIONS.PROJECT])
			.addParam(COMMAND_OPTIONS.SCRIPT_ID, scriptId)
			.build();
		return await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContextForUpdate),
			message: NodeTranslationService.getMessage(MESSAGES.UPDATING_OBJECT_WITH_CUSTOM_INSTANCES, scriptId),
		});
	}

	async _updateObjects(sdkParams) {
		const executionContextForUpdate = SdkExecutionContext.Builder.forCommand(this._commandMetadata.sdkCommand)
			.integration()
			.addParams(sdkParams)
			.build();

		return await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContextForUpdate),
			message: NodeTranslationService.getMessage(MESSAGES.UPDATING_OBJECTS),
		});
	}
};
