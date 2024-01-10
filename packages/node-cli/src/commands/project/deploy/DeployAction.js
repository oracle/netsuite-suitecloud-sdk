/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');
const { ActionResult } = require('../../../services/actionresult/ActionResult');
const DeployActionResult = require('../../../services/actionresult/DeployActionResult');
const CommandUtils = require('../../../utils/CommandUtils');
const ProjectInfoService = require('../../../services/ProjectInfoService');
const AccountSpecificValuesUtils = require('../../../utils/AccountSpecificValuesUtils');
const ApplyInstallationPreferencesUtils = require('../../../utils/ApplyInstallationPreferencesUtils');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const { executeWithSpinner } = require('../../../ui/CliSpinner');
const SdkExecutionContext = require('../../../SdkExecutionContext');
const BaseAction = require('../../base/BaseAction');
const { getProjectDefaultAuthId } = require('../../../utils/AuthenticationUtils');

const { PROJECT_SUITEAPP } = require('../../../ApplicationConstants');

const { COMMAND_DEPLOY } = require('../../../services/TranslationKeys');

const COMMAND = {
	OPTIONS: {
		AUTH_ID: 'authid',
		ACCOUNT_SPECIFIC_VALUES: 'accountspecificvalues',
		LOG: 'log',
		PROJECT: 'project',
	},
	FLAGS: {
		NO_PREVIEW: 'no_preview',
		PREVIEW: 'dryrun',
		SKIP_WARNING: 'skip_warning',
		VALIDATE: 'validate',
		APPLY_INSTALLATION_PREFERENCES: 'applyinstallprefs',
	},
};

const PREVIEW_COMMAND = 'preview';

module.exports = class DeployAction extends (
	BaseAction
) {
	constructor(options) {
		super(options);
		const projectInfoService = new ProjectInfoService(this._projectFolder);
		this._projectType = projectInfoService.getProjectType();
		this._projectName = projectInfoService.getProjectName();
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
			let flags = [COMMAND.FLAGS.NO_PREVIEW, COMMAND.FLAGS.SKIP_WARNING];

			if (params[COMMAND.FLAGS.VALIDATE]) {
				delete params[COMMAND.FLAGS.VALIDATE];
				flags.push(COMMAND.FLAGS.VALIDATE);
			}

			if (params[COMMAND.FLAGS.APPLY_INSTALLATION_PREFERENCES]) {
				delete params[COMMAND.FLAGS.APPLY_INSTALLATION_PREFERENCES];
				flags.push(COMMAND.FLAGS.APPLY_INSTALLATION_PREFERENCES);
			}

			if (params[COMMAND.FLAGS.PREVIEW]) {
				return await this._preview(params, flags);
			}

			return await this._deploy(params, flags);

		} catch (error) {
			return ActionResult.Builder.withErrors([error]).build();
		}
	}

	async _preview(params, flags) {
		try {
			delete params[COMMAND.FLAGS.PREVIEW];
			flags.splice(flags.indexOf(COMMAND.FLAGS.NO_PREVIEW), 1);
			flags.splice(flags.indexOf(COMMAND.FLAGS.SKIP_WARNING), 1);

			if (flags.includes(COMMAND.FLAGS.VALIDATE)) {
				throw NodeTranslationService.getMessage(COMMAND_DEPLOY.ERRORS.VALIDATE_AND_DRYRUN_OPTIONS_PASSED);
			}

			const sdkParams = CommandUtils.extractCommandOptions(params, this._commandMetadata);

			const executionContextForDryrun = SdkExecutionContext.Builder.forCommand(PREVIEW_COMMAND)
				.integration()
				.addParams(sdkParams)
				.addFlags(flags)
				.build();

			const dryrunOperationResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContextForDryrun),
				message: NodeTranslationService.getMessage(
					COMMAND_DEPLOY.MESSAGES.PREVIEWING,
					this._projectName,
					getProjectDefaultAuthId(this._executionPath),
				),
			});

			return dryrunOperationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
				? ActionResult.Builder.withData(dryrunOperationResult.data).withResultMessage(dryrunOperationResult.resultMessage).build()
				: ActionResult.Builder.withErrors(dryrunOperationResult.errorMessages).build();
		} catch (error) {
			return ActionResult.Builder.withErrors([error]).build();
		}
	}

	async _deploy(params, flags) {
		try {
			const sdkParams = CommandUtils.extractCommandOptions(params, this._commandMetadata);

			const executionContextForDeploy = SdkExecutionContext.Builder.forCommand(this._commandMetadata.sdkCommand)
				.integration()
				.addParams(sdkParams)
				.addFlags(flags)
				.build();

			const operationResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContextForDeploy),
				message: NodeTranslationService.getMessage(
					COMMAND_DEPLOY.MESSAGES.DEPLOYING,
					this._projectName,
					getProjectDefaultAuthId(this._executionPath),
				),
			});

			const isServerValidation = !!sdkParams[COMMAND.FLAGS.VALIDATE];
			const isApplyInstallationPreferences = this._projectType === PROJECT_SUITEAPP && flags.includes(COMMAND.FLAGS.APPLY_INSTALLATION_PREFERENCES);

			return operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
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
			return DeployActionResult.Builder.withErrors([error]).build();
		}
	}
};
