/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseAction = require('../../base/BaseAction');
const { ActionResult } = require('../../../services/actionresult/ActionResult');
const CommandUtils = require('../../../utils/CommandUtils');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const { toErrorMessages } = require('../../../utils/ErrorMessageUtils');
const executeWithSpinner = require('../../../ui/CliSpinner').executeWithSpinner;
const { getProjectDefaultAuthId } = require('../../../utils/AuthenticationUtils');
const { createCredentialSessionProvider } = require('../../../utils/AuthSessionProvider');
const {
	executeUpdateObjectsCommand,
	executeUpdateCustomRecordWithInstancesCommand,
} = require('@oracle/suitecloud-sdk-core/commands/object/update/UpdateObjectsHandler');
const {
	executeWithAuthRetry,
	shouldRetryAuthByResult,
} = require('@oracle/suitecloud-sdk-core/auth/AuthSessionManager');

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
const CUSTOM_RECORD_PREFIX = 'customrecord';
module.exports = class UpdateAction extends BaseAction {
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

			return updateObjectsResult.status === 'SUCCESS'
				? ActionResult.Builder.withData(allResults)
						.withResultMessage(updateObjectsResult.resultMessage)
						.withCommandParameters(sdkParams)
						.build()
				: ActionResult.Builder.withErrors(updateObjectsResult.errorMessages).withCommandParameters(sdkParams).build();
		} catch (error) {
			return ActionResult.Builder.withErrors(toErrorMessages(error)).build();
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
			if (updateCustomRecordResult.status === 'ERROR') {
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
		return executeWithSpinner({
			action: this._executeUpdateCustomRecordsWithAuthRetry(params, scriptId),
			message: NodeTranslationService.getMessage(MESSAGES.UPDATING_OBJECT_WITH_CUSTOM_INSTANCES, scriptId),
		});
	}

	async _updateObjects(sdkParams) {
		return executeWithSpinner({
			action: this._executeUpdateObjectsWithAuthRetry(sdkParams),
			message: NodeTranslationService.getMessage(MESSAGES.UPDATING_OBJECTS),
		});
	}

	async _executeUpdateObjectsWithAuthRetry(sdkParams) {
		const authId = sdkParams[COMMAND_OPTIONS.AUTH_ID];
		const authSessionProvider = createCredentialSessionProvider(this._sdkPath, this._executionEnvironmentContext);
		return executeWithAuthRetry({
			authId,
			authSessionProvider,
			shouldRetryAuth: shouldRetryAuthByResult,
			executeWithAuthSession: (authCredentials) => executeUpdateObjectsCommand({
				hostName: authCredentials.hostName,
				accessToken: authCredentials.accessToken,
				projectFolder: unquote(sdkParams[COMMAND_OPTIONS.PROJECT]),
				scriptIds: parseScriptIds(sdkParams[COMMAND_OPTIONS.SCRIPT_ID]),
				userAgent: getUserAgent(this._executionEnvironmentContext),
			}),
		});
	}

	async _executeUpdateCustomRecordsWithAuthRetry(params, scriptId) {
		const authId = params[COMMAND_OPTIONS.AUTH_ID];
		const authSessionProvider = createCredentialSessionProvider(this._sdkPath, this._executionEnvironmentContext);
		return executeWithAuthRetry({
			authId,
			authSessionProvider,
			shouldRetryAuth: shouldRetryAuthByResult,
			executeWithAuthSession: (authCredentials) => executeUpdateCustomRecordWithInstancesCommand({
				hostName: authCredentials.hostName,
				accessToken: authCredentials.accessToken,
				projectFolder: unquote(params[COMMAND_OPTIONS.PROJECT]),
				scriptId,
				userAgent: getUserAgent(this._executionEnvironmentContext),
			}),
		});
	}
};

function unquote(value) {
	if (typeof value === 'string' && value.length > 1 && value.startsWith('"') && value.endsWith('"')) {
		return value.slice(1, -1);
	}
	return value;
}

function parseScriptIds(value) {
	if (!value) {
		return [];
	}
	if (Array.isArray(value)) {
		return value;
	}
	return String(value).split(/\s+/).filter(Boolean);
}

function getUserAgent(executionEnvironmentContext) {
	if (!executionEnvironmentContext) {
		return undefined;
	}
	const platform = executionEnvironmentContext.getPlatform && executionEnvironmentContext.getPlatform();
	const platformVersion =
		executionEnvironmentContext.getPlatformVersion && executionEnvironmentContext.getPlatformVersion();
	if (!platform || !platformVersion) {
		return undefined;
	}
	return `${platform}/${platformVersion}`;
}
