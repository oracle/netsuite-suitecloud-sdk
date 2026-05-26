/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ActionResult } = require('../../../services/actionresult/ActionResult');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const executeWithSpinner = require('../../../ui/CliSpinner').executeWithSpinner;
const { toErrorMessages } = require('../../../utils/ErrorMessageUtils');
const { getProjectDefaultAuthId } = require('../../../utils/AuthenticationUtils');
const { createCredentialSessionProvider } = require('../../../utils/AuthSessionProvider');
const BaseAction = require('../../base/BaseAction');
const {
	prepareListFilesParams,
	executeListFilesCommand,
} = require('@oracle/suitecloud-sdk-core/commands/file/list/ListFilesHandler');
const {
	executeWithAuthRetry,
	shouldRetryAuthByResult,
} = require('@oracle/suitecloud-sdk-core/auth/AuthSessionManager');
const {
	COMMAND_LISTFILES: { LOADING_FILES },
} = require('../../../services/TranslationKeys');

module.exports = class ListFilesAction extends BaseAction {
	constructor(options) {
		super(options);
	}

	preExecute(args) {
		return prepareListFilesParams(args, getProjectDefaultAuthId(this._executionPath));
	}

	async execute(params) {
		try {
			const operationResult = await executeWithSpinner({
				action: this._executeListFilesWithAuthRetry(params),
				message: NodeTranslationService.getMessage(LOADING_FILES),
			});

			return operationResult.status === 'SUCCESS'
				? ActionResult.Builder.withData(operationResult.data)
					.withResultMessage(operationResult.resultMessage)
					.withCommandParameters(params)
					.build()
				: ActionResult.Builder.withErrors(operationResult.errorMessages).withCommandParameters(params).build();
		} catch (error) {
			return ActionResult.Builder.withErrors(toErrorMessages(error)).build();
		}
	}

	async _executeListFilesWithAuthRetry(params) {
		const authId = params.authid;
		const authSessionProvider = createCredentialSessionProvider(this._sdkPath, this._executionEnvironmentContext);
		return executeWithAuthRetry({
			authId,
			authSessionProvider,
			shouldRetryAuth: shouldRetryAuthByResult,
			executeWithAuthSession: (authCredentials) => executeListFilesCommand({
				hostName: authCredentials.hostName,
				accessToken: authCredentials.accessToken,
				folderPath: unquote(params.folder),
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
