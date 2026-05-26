/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

'use strict';

const BaseAction = require('../../base/BaseAction');
const DeployActionResult = require('../../../services/actionresult/DeployActionResult');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const CommandUtils = require('../../../utils/CommandUtils');
const ProjectInfoService = require('../../../services/ProjectInfoService');
const AccountSpecificValuesUtils = require('../../../utils/AccountSpecificValuesUtils');
const ApplyInstallationPreferencesUtils = require('../../../utils/ApplyInstallationPreferencesUtils');
const { PROJECT_SUITEAPP } = require('../../../ApplicationConstants');
const { executeWithSpinner } = require('../../../ui/CliSpinner');
const { getProjectDefaultAuthId } = require('../../../utils/AuthenticationUtils');
const { toErrorMessages } = require('../../../utils/ErrorMessageUtils');
const { createCredentialSessionProvider } = require('../../../utils/AuthSessionProvider');
const { prepareValidateExecution } = require('@oracle/suitecloud-sdk-core/commands/project/validate/ValidateHandler');
const {
	executeProjectCommand,
	PROJECT_COMMAND,
	SDK_OPERATION_STATUS,
} = require('@oracle/suitecloud-sdk-core/commands/project/ProjectCommandExecutor');
const {
	executeWithAuthRetry,
	shouldRetryAuthByResult,
} = require('@oracle/suitecloud-sdk-core/auth/AuthSessionManager');

const {
	COMMAND_VALIDATE: { MESSAGES },
} = require('../../../services/TranslationKeys');

const COMMAND_OPTIONS = {
	SERVER: 'server',
	ACCOUNT_SPECIFIC_VALUES: 'accountspecificvalues',
	APPLY_INSTALLATION_PREFERENCES: 'applyinstallprefs',
	JSON: 'json',
	PROJECT: 'project',
	AUTH_ID: 'authid',
};

module.exports = class ValidateAction extends BaseAction {
	constructor(options) {
		super(options);
		const projectInfoService = new ProjectInfoService(this._projectFolder);
		this._projectType = projectInfoService.getProjectType();
		this._projectName = normalizeManifestValue(getProjectInfoValue(projectInfoService, 'getProjectName'));
		const publisherId = normalizeManifestValue(getProjectInfoValue(projectInfoService, 'getPublisherId'));
		const projectId = normalizeManifestValue(getProjectInfoValue(projectInfoService, 'getProjectId'));
		this._suiteAppId = this._projectType === PROJECT_SUITEAPP && publisherId && projectId
			? `${publisherId}.${projectId}`
			: undefined;
	}

	preExecute(params) {
		params[COMMAND_OPTIONS.PROJECT] = CommandUtils.quoteString(this._projectFolder);
		params[COMMAND_OPTIONS.AUTH_ID] = getProjectDefaultAuthId(this._executionPath);

		AccountSpecificValuesUtils.validate(params, this._projectFolder);
		ApplyInstallationPreferencesUtils.validate(params, this._projectFolder, this._commandMetadata.name, this._log);

		return {
			...params,
			...AccountSpecificValuesUtils.transformArgument(params),
		};
	}

	async execute(params) {
		try {
			// Local validate is temporarily removed during TS-core migration.
			const validateExecution = prepareValidateExecution({
				...params,
				[COMMAND_OPTIONS.SERVER]: true,
			});
			const flags = validateExecution.flags;
			const isServerValidation = validateExecution.isServerValidation;
			const installationPreferencesApplied = validateExecution.installationPreferencesApplied;

			const sdkParams = CommandUtils.extractCommandOptions(validateExecution.params, this._commandMetadata);
			const projectFolder = CommandUtils.unquoteString(sdkParams[COMMAND_OPTIONS.PROJECT]);
			const operationResult = await this._executeProjectCommandWithAuthRetry({
				command: PROJECT_COMMAND.VALIDATE,
				projectFolder,
				sdkParams,
				flags,
				message: NodeTranslationService.getMessage(MESSAGES.VALIDATING, this._projectName, getProjectDefaultAuthId(this._executionPath)),
			});

			return operationResult.status === SDK_OPERATION_STATUS.SUCCESS
				? DeployActionResult.Builder.withData(operationResult.data)
						.withResultMessage(operationResult.resultMessage)
						.withServerValidation(isServerValidation)
						.withAppliedInstallationPreferences(installationPreferencesApplied)
						.withProjectType(this._projectType)
						.withProjectFolder(this._projectFolder)
						.withCommandParameters(sdkParams)
						.withCommandFlags(flags)
						.build()
				: DeployActionResult.Builder.withErrors(operationResult.errorMessages)
						.withServerValidation(isServerValidation)
						.withCommandParameters(sdkParams)
						.withCommandFlags(flags)
						.build();
		} catch (error) {
			return DeployActionResult.Builder.withErrors(toErrorMessages(error)).build();
		}
	}

	async _executeProjectCommandWithAuthRetry({ command, projectFolder, sdkParams, flags, message }) {
		const authId = sdkParams[COMMAND_OPTIONS.AUTH_ID];
		const authSessionProvider = createCredentialSessionProvider(this._sdkPath, this._executionEnvironmentContext);
		return executeWithAuthRetry({
			authId,
			authSessionProvider,
			shouldRetryAuth: shouldRetryAuthByResult,
			executeWithAuthSession: (authCredentials) => this._executeProjectCommand({
				command,
				projectFolder,
				sdkParams,
				flags,
				message,
				authCredentials,
			}),
		});
	}

	async _executeProjectCommand({ command, projectFolder, sdkParams, flags, message, authCredentials }) {
		return executeWithSpinner({
			action: executeProjectCommand({
				command,
				projectFolder,
				hostName: authCredentials.hostName,
				accessToken: authCredentials.accessToken,
				rawOutput: isRawOutputRequested(sdkParams),
				params: sdkParams,
				flags,
				summaryContext: this._buildSummaryContext(authCredentials),
			}),
			message,
		});
	}

	_buildSummaryContext(authCredentials) {
		const accountInfo = authCredentials && authCredentials.accountInfo ? authCredentials.accountInfo : {};
		return {
			accountName: accountInfo.companyName,
			roleName: accountInfo.roleName,
			...(this._suiteAppId ? { suiteAppId: this._suiteAppId } : { projectName: this._projectName }),
		};
	}
};

function isRawOutputRequested(commandParameters) {
	return !!commandParameters[COMMAND_OPTIONS.JSON];
}

function normalizeManifestValue(value) {
	if (Array.isArray(value)) {
		return value.length > 0 ? String(value[0]) : '';
	}
	if (value === undefined || value === null) {
		return '';
	}
	return String(value);
}

function getProjectInfoValue(projectInfoService, methodName) {
	if (!projectInfoService || typeof projectInfoService[methodName] !== 'function') {
		return '';
	}
	return projectInfoService[methodName]();
}
