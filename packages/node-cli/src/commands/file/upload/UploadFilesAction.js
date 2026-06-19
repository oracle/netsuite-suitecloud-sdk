/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseAction = require('../../base/BaseAction');
const { executeWithSpinner } = require('../../../ui/CliSpinner');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const { ActionResult } = require('../../../services/actionresult/ActionResult');
const { getProjectDefaultAuthId } = require('../../../utils/AuthenticationUtils');
const { toErrorMessages } = require('../../../utils/ErrorMessageUtils');
const { createCredentialSessionProvider } = require('../../../utils/AuthSessionProvider');
const {
	prepareUploadFilesParams,
	executeUploadFilesCommand,
} = require('@oracle/suitecloud-sdk-core/commands/file/upload/UploadFilesHandler');
const {
	executeWithAuthRetry,
	shouldRetryAuthByResult,
} = require('@oracle/suitecloud-sdk-core/auth/AuthSessionManager');

const {
	COMMAND_UPLOADFILES: { MESSAGES },
} = require('../../../services/TranslationKeys');

module.exports = class UploadFilesAction extends BaseAction {
	constructor(options) {
		super(options);
	}

	preExecute(params) {
		return prepareUploadFilesParams(
			params,
			this._projectFolder,
			getProjectDefaultAuthId(this._executionPath)
		);
	}

	async execute(params) {
		try {
			const operationResult = await executeWithSpinner({
				action: this._executeUploadWithAuthRetry(params),
				message: NodeTranslationService.getMessage(MESSAGES.UPLOADING_FILES),
			});
			return operationResult.status === 'SUCCESS'
				? ActionResult.Builder.withData(operationResult.data)
					.withResultMessage(operationResult.resultMessage)
					.withProjectFolder(this._projectFolder)
					.withCommandParameters(params)
					.build()
				: ActionResult.Builder.withErrors(operationResult.errorMessages).withCommandParameters(params).build();
		} catch (error) {
			return ActionResult.Builder.withErrors(toErrorMessages(error)).build();
		}
	}

	async _executeUploadWithAuthRetry(params) {
		const authId = params.authid;
		const authSessionProvider = createCredentialSessionProvider(this._sdkPath, this._executionEnvironmentContext);
		return executeWithAuthRetry({
			authId,
			authSessionProvider,
			shouldRetryAuth: shouldRetryAuthByResult,
			executeWithAuthSession: (authCredentials) => executeUploadFilesCommand({
				hostName: authCredentials.hostName,
				accessToken: authCredentials.accessToken,
				projectFolder: unquote(params.project),
				filePaths: parseQuotedMultiValue(params.paths),
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

function parseQuotedMultiValue(value) {
	if (!value) {
		return [];
	}
	if (Array.isArray(value)) {
		return value.map(unquote);
	}
	const normalizedValue = String(value);
	const matches = normalizedValue.match(/"([^"]+)"/g);
	if (matches) {
		return matches.map((match) => unquote(match));
	}
	return normalizedValue
		.trim()
		.split(/\s+/)
		.map(unquote)
		.filter(Boolean);
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
