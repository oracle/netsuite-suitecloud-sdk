/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ActionResult } = require('../../../services/actionresult/ActionResult');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const { executeWithSpinner } = require('../../../ui/CliSpinner');
const ProjectInfoService = require('../../../services/ProjectInfoService');
const { PROJECT_SUITEAPP } = require('../../../ApplicationConstants');
const { getProjectDefaultAuthId } = require('../../../utils/AuthenticationUtils');
const { toErrorMessages } = require('../../../utils/ErrorMessageUtils');
const { createCredentialSessionProvider } = require('../../../utils/AuthSessionProvider');
const BaseAction = require('../../base/BaseAction');
const {
	prepareImportFilesParams,
	addCompareFilesImportFlag,
	addImportCallMetadata,
	executeImportFilesCommand,
} = require('@oracle/suitecloud-sdk-core/commands/file/import/ImportFilesHandler');
const {
	executeWithAuthRetry,
	shouldRetryAuthByResult,
} = require('@oracle/suitecloud-sdk-core/auth/AuthSessionManager');
const {
	COMMAND_IMPORTFILES: { ERRORS, MESSAGES, WARNINGS },
} = require('../../../services/TranslationKeys');
const CLIException = require('../../../CLIException');

module.exports = class ImportFilesAction extends BaseAction {
	constructor(options) {
		super(options);

		this._projectInfoService = new ProjectInfoService(this._projectFolder);
		this._calledFromCompareFiles = false;
		this._calledFromUpdate = false;
	}

	preExecute(params) {
		const preparedImportParams = prepareImportFilesParams(
			params,
			this._projectFolder,
			getProjectDefaultAuthId(this._executionPath)
		);
		this._calledFromCompareFiles = preparedImportParams.calledFromCompareFiles;
		this._calledFromUpdate = preparedImportParams.calledFromUpdate;

		return preparedImportParams.params;
	}

	async execute(params) {
		try {
			if (!this._calledFromCompareFiles && this._projectInfoService.getProjectType() === PROJECT_SUITEAPP) {
				return ActionResult.Builder.withErrors([NodeTranslationService.getMessage(ERRORS.IS_SUITEAPP)]).build();
			}

			if (!this._calledFromCompareFiles && !this._calledFromUpdate && this._runInInteractiveMode === false) {
				await this._log.info(NodeTranslationService.getMessage(WARNINGS.OVERRIDE));
			}

			const executionParams = this._calledFromCompareFiles ? addCompareFilesImportFlag(params) : params;

			const operationResult = await executeWithSpinner({
				action: this._executeImportWithAuthRetry(executionParams),
				message:  NodeTranslationService.getMessage(MESSAGES.IMPORTING_FILES),
			});

			const commandParameters = addImportCallMetadata(params, this._calledFromCompareFiles, this._calledFromUpdate);

			return operationResult.status === 'SUCCESS'
				? ActionResult.Builder.withData(operationResult.data)
						.withResultMessage(operationResult.resultMessage)
						.withCommandParameters(commandParameters)
						.build()
				: ActionResult.Builder.withErrors(operationResult.errorMessages).withCommandParameters(commandParameters).build();
		} catch (error) {
			if (error instanceof CLIException) {
				return ActionResult.Builder.withErrors([error.getErrorMessage()]).build();
			}
			return ActionResult.Builder.withErrors(toErrorMessages(error)).build();
		}
	}

	async _executeImportWithAuthRetry(params) {
		const authId = params.authid;
		const authSessionProvider = createCredentialSessionProvider(this._sdkPath, this._executionEnvironmentContext);
		return executeWithAuthRetry({
			authId,
			authSessionProvider,
			shouldRetryAuth: shouldRetryAuthByResult,
			executeWithAuthSession: (authCredentials) => executeImportFilesCommand({
				hostName: authCredentials.hostName,
				accessToken: authCredentials.accessToken,
				projectFolder: unquote(params.project),
				filePaths: parseQuotedMultiValue(params.paths),
				excludeProperties: Object.prototype.hasOwnProperty.call(params, 'excludeproperties'),
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
