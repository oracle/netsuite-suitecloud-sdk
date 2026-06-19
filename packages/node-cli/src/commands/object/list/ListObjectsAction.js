/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ActionResult } = require('../../../services/actionresult/ActionResult');
const BaseAction = require('../../base/BaseAction');
const CommandUtils = require('../../../utils/CommandUtils');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const { toErrorMessages } = require('../../../utils/ErrorMessageUtils');
const executeWithSpinner = require('../../../ui/CliSpinner').executeWithSpinner;
const { getProjectDefaultAuthId } = require('../../../utils/AuthenticationUtils');
const { createCredentialSessionProvider } = require('../../../utils/AuthSessionProvider');
const {
	prepareListObjectsParams,
	executeListObjectsCommand,
	parseObjectTypes,
} = require('@oracle/suitecloud-sdk-core/commands/object/list/ListObjectsHandler');
const {
	executeWithAuthRetry,
	shouldRetryAuthByResult,
} = require('@oracle/suitecloud-sdk-core/auth/AuthSessionManager');

const {
	COMMAND_LISTOBJECTS: { LISTING_OBJECTS },
} = require('../../../services/TranslationKeys');

const COMMAND_PARAMETERS = {
	AUTH_ID: 'authid',
};

module.exports = class ListObjectsAction extends BaseAction {
	preExecute(params) {
		return prepareListObjectsParams(params, getProjectDefaultAuthId(this._executionPath));
	}

	async execute(params) {
		try {
			const sdkParams = CommandUtils.extractCommandOptions(params, this._commandMetadata);
			const operationResult = await executeWithSpinner({
				action: this._executeListObjectsWithAuthRetry(sdkParams),
				message: NodeTranslationService.getMessage(LISTING_OBJECTS),
			});

			return operationResult.status === 'SUCCESS'
				? ActionResult.Builder.withData(operationResult.data)
					.withResultMessage(operationResult.resultMessage)
					.withCommandParameters(sdkParams)
					.build()
				: ActionResult.Builder.withErrors(operationResult.errorMessages).withCommandParameters(sdkParams).build();
		} catch (error) {
			return ActionResult.Builder.withErrors(toErrorMessages(error)).build();
		}
	}

	async _executeListObjectsWithAuthRetry(sdkParams) {
		const authId = sdkParams[COMMAND_PARAMETERS.AUTH_ID];
		const authSessionProvider = createCredentialSessionProvider(this._sdkPath, this._executionEnvironmentContext);
		return executeWithAuthRetry({
			authId,
			authSessionProvider,
			shouldRetryAuth: shouldRetryAuthByResult,
			executeWithAuthSession: (authCredentials) => executeListObjectsCommand({
				hostName: authCredentials.hostName,
				accessToken: authCredentials.accessToken,
				appId: sdkParams.appid,
				scriptIdContains: sdkParams.scriptid,
				objectTypes: parseObjectTypes(sdkParams.type),
				userAgent: getUserAgent(this._executionEnvironmentContext),
			}),
		});
	}
};

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
