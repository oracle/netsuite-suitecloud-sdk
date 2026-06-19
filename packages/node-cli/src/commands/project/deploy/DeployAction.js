/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ActionResult } = require('../../../services/actionresult/ActionResult');
const DeployActionResult = require('../../../services/actionresult/DeployActionResult');
const CommandUtils = require('../../../utils/CommandUtils');
const ProjectInfoService = require('../../../services/ProjectInfoService');
const AccountSpecificValuesUtils = require('../../../utils/AccountSpecificValuesUtils');
const ApplyInstallationPreferencesUtils = require('../../../utils/ApplyInstallationPreferencesUtils');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const { executeWithSpinner } = require('../../../ui/CliSpinner');
const BaseAction = require('../../base/BaseAction');
const { getProjectDefaultAuthId } = require('../../../utils/AuthenticationUtils');
const { toErrorMessages } = require('../../../utils/ErrorMessageUtils');
const { createCredentialSessionProvider } = require('../../../utils/AuthSessionProvider');
const {
	DEPLOY_MODE,
	DEPLOY_COMMAND,
	DEPLOY_VALIDATION_ERROR,
	prepareDeployExecution,
	isApplyInstallationPreferencesForDeploy,
} = require('@oracle/suitecloud-sdk-core/commands/project/deploy/DeployHandler');
const {
	executeProjectCommand,
	PROJECT_COMMAND,
	SDK_OPERATION_STATUS,
} = require('@oracle/suitecloud-sdk-core/commands/project/ProjectCommandExecutor');
const {
	executeWithAuthRetry,
	shouldRetryAuthByResult,
} = require('@oracle/suitecloud-sdk-core/auth/AuthSessionManager');

const { PROJECT_SUITEAPP } = require('../../../ApplicationConstants');

const { COMMAND_DEPLOY } = require('../../../services/TranslationKeys');

const COMMAND = {
	OPTIONS: {
		AUTH_ID: 'authid',
		ACCOUNT_SPECIFIC_VALUES: 'accountspecificvalues',
		JSON: 'json',
		LOG: 'log',
		PROJECT: 'project',
	},
	FLAGS: {
		NO_PREVIEW: DEPLOY_COMMAND.FLAGS.NO_PREVIEW,
		PREVIEW: DEPLOY_COMMAND.FLAGS.PREVIEW,
		SKIP_WARNING: DEPLOY_COMMAND.FLAGS.SKIP_WARNING,
		VALIDATE: DEPLOY_COMMAND.FLAGS.VALIDATE,
		APPLY_INSTALLATION_PREFERENCES: DEPLOY_COMMAND.FLAGS.APPLY_INSTALLATION_PREFERENCES,
	},
};

module.exports = class DeployAction extends (
	BaseAction
) {
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
		AccountSpecificValuesUtils.validate(params, this._projectFolder);
		ApplyInstallationPreferencesUtils.validate(params, this._projectFolder, this._commandMetadata.name, this._log);

		return {
			...params,
			[COMMAND.OPTIONS.PROJECT]: CommandUtils.quoteString(this._projectFolder),
			[COMMAND.OPTIONS.AUTH_ID]: getProjectDefaultAuthId(this._executionPath),
			...AccountSpecificValuesUtils.transformArgument(params),
		};
	}

	async execute(params) {
		try {
			const deployExecution = prepareDeployExecution(params);
			if (deployExecution.validationError) {
				if (deployExecution.validationError.errorCode === DEPLOY_VALIDATION_ERROR.VALIDATE_AND_DRYRUN_OPTIONS_PASSED) {
					return ActionResult.Builder
						.withErrors([NodeTranslationService.getMessage(COMMAND_DEPLOY.ERRORS.VALIDATE_AND_DRYRUN_OPTIONS_PASSED)])
						.build();
				}
			}

			if (deployExecution.mode === DEPLOY_MODE.PREVIEW) {
				return await this._preview(deployExecution.params, deployExecution.flags);
			}

			return await this._deploy(deployExecution.params, deployExecution.flags);

		} catch (error) {
			return ActionResult.Builder.withErrors(toErrorMessages(error)).build();
		}
	}

	async _preview(params, flags) {
		try {
			const sdkParams = CommandUtils.extractCommandOptions(params, this._commandMetadata);
			const projectFolder = CommandUtils.unquoteString(sdkParams[COMMAND.OPTIONS.PROJECT]);
			const dryrunOperationResult = await this._executeProjectCommandWithAuthRetry({
				command: PROJECT_COMMAND.PREVIEW,
				projectFolder,
				sdkParams,
				flags,
				message: NodeTranslationService.getMessage(
					COMMAND_DEPLOY.MESSAGES.PREVIEWING,
					this._projectName,
					getProjectDefaultAuthId(this._executionPath),
				),
			});

			return dryrunOperationResult.status === SDK_OPERATION_STATUS.SUCCESS
				? ActionResult.Builder.withData(dryrunOperationResult.data)
					.withResultMessage(dryrunOperationResult.resultMessage)
					.withCommandParameters(sdkParams)
					.withCommandFlags(flags)
					.build()
				: ActionResult.Builder.withErrors(dryrunOperationResult.errorMessages)
					.withCommandParameters(sdkParams)
					.withCommandFlags(flags)
					.build();
		} catch (error) {
			return ActionResult.Builder.withErrors(toErrorMessages(error)).build();
		}
	}

	async _deploy(params, flags) {
		try {
			const sdkParams = CommandUtils.extractCommandOptions(params, this._commandMetadata);
			const projectFolder = CommandUtils.unquoteString(sdkParams[COMMAND.OPTIONS.PROJECT]);
			const operationResult = await this._executeProjectCommandWithAuthRetry({
				command: PROJECT_COMMAND.DEPLOY,
				projectFolder,
				sdkParams,
				flags,
				message: NodeTranslationService.getMessage(
					COMMAND_DEPLOY.MESSAGES.DEPLOYING,
					this._projectName,
					getProjectDefaultAuthId(this._executionPath),
				),
			});

			const isServerValidation = !!sdkParams[COMMAND.FLAGS.VALIDATE];
			const isApplyInstallationPreferences = isApplyInstallationPreferencesForDeploy(this._projectType, flags, PROJECT_SUITEAPP);

			return operationResult.status === SDK_OPERATION_STATUS.SUCCESS
				? DeployActionResult.Builder.withData(operationResult.data)
					.withResultMessage(operationResult.resultMessage)
					.withServerValidation(isServerValidation)
					.withAppliedInstallationPreferences(isApplyInstallationPreferences)
					.withProjectType(this._projectType)
					.withProjectFolder(this._projectFolder)
					.withCommandParameters(sdkParams)
					.withCommandFlags(flags)
					.build()
				: DeployActionResult.Builder.withErrors(operationResult.errorMessages).withCommandParameters(sdkParams)
					.withCommandFlags(flags).build();
		} catch (error) {
			return DeployActionResult.Builder.withErrors(toErrorMessages(error)).build();
		}
	}

	async _executeProjectCommandWithAuthRetry({ command, projectFolder, sdkParams, flags, message }) {
		const authId = sdkParams[COMMAND.OPTIONS.AUTH_ID];
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
	return !!commandParameters[COMMAND.OPTIONS.JSON];
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
