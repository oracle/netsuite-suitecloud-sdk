/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

'use strict';

const BaseAction = require('../../base/BaseAction');
const DeployActionResult = require('../../../services/actionresult/DeployActionResult');
const SdkExecutionContext = require('../../../SdkExecutionContext');
const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const CommandUtils = require('../../../utils/CommandUtils');
const ProjectInfoService = require('../../../services/ProjectInfoService');
const AccountSpecificValuesUtils = require('../../../utils/AccountSpecificValuesUtils');
const ApplyInstallationPreferencesUtils = require('../../../utils/ApplyInstallationPreferencesUtils');
const { executeWithSpinner } = require('../../../ui/CliSpinner');
const { getProjectDefaultAuthId } = require('../../../utils/AuthenticationUtils');

const {
	COMMAND_VALIDATE: { MESSAGES },
} = require('../../../services/TranslationKeys');

const COMMAND_OPTIONS = {
	SERVER: 'server',
	ACCOUNT_SPECIFIC_VALUES: 'accountspecificvalues',
	APPLY_INSTALLATION_PREFERENCES: 'applyinstallprefs',
	PROJECT: 'project',
	AUTH_ID: 'authid',
};

module.exports = class ValidateAction extends BaseAction {
	constructor(options) {
		super(options);
		const projectInfoService = new ProjectInfoService(this._projectFolder);
		this._projectType = projectInfoService.getProjectType()
		this._projectName = projectInfoService.getProjectName()
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
			let isServerValidation = false;
			let installationPreferencesApplied = false;
			const flags = [];

			if (params[COMMAND_OPTIONS.SERVER]) {
				flags.push(COMMAND_OPTIONS.SERVER);
				isServerValidation = true;
				delete params[COMMAND_OPTIONS.SERVER];
			}

			if (params[COMMAND_OPTIONS.APPLY_INSTALLATION_PREFERENCES]) {
				delete params[COMMAND_OPTIONS.APPLY_INSTALLATION_PREFERENCES];
				flags.push(COMMAND_OPTIONS.APPLY_INSTALLATION_PREFERENCES);
				installationPreferencesApplied = true;
			}

			const sdkParams = CommandUtils.extractCommandOptions(params, this._commandMetadata);

			const executionContext = SdkExecutionContext.Builder.forCommand(this._commandMetadata.sdkCommand)
				.integration()
				.addParams(sdkParams)
				.addFlags(flags)
				.build();

			const operationResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContext),
				message: NodeTranslationService.getMessage(MESSAGES.VALIDATING, this._projectName, getProjectDefaultAuthId(this._executionPath)),
			});

			return operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
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
			return DeployActionResult.Builder.withErrors([error]).build();
		}
	}
};
