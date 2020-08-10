/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');
const DeployActionResult = require('../../../services/actionresult/DeployActionResult');
const CommandUtils = require('../../../utils/CommandUtils');
const ProjectInfoService = require('../../../services/ProjectInfoService');
const AccountSpecificValuesUtils = require('../../../utils/AccountSpecificValuesUtils');
const ApplyContentProtectionUtils = require('../../../utils/ApplyContentProtectionUtils');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const { executeWithSpinner } = require('../../../ui/CliSpinner');
const SdkExecutionContext = require('../../../SdkExecutionContext');
const BaseAction = require('../../base/BaseAction');
const { getProjectDefaultAuthId } = require('../../../utils/AuthenticationUtils');

const { PROJECT_SUITEAPP } = require('../../../ApplicationConstants');

const {
	COMMAND_DEPLOY: { MESSAGES },
} = require('../../../services/TranslationKeys');

const COMMAND = {
	OPTIONS: {
		AUTH_ID: 'authid',
		ACCOUNT_SPECIFIC_VALUES: 'accountspecificvalues',
		LOG: 'log',
		PROJECT: 'project',
	},
	FLAGS: {
		NO_PREVIEW: 'no_preview',
		SKIP_WARNING: 'skip_warning',
		VALIDATE: 'validate',
		APPLY_CONTENT_PROTECTION: 'applycontentprotection',
	},
};

module.exports = class DeployAction extends BaseAction {
	constructor(options) {
		super(options);
		this._projectType = new ProjectInfoService(this._projectFolder).getProjectType();
	}

	preExecute(params) {
		AccountSpecificValuesUtils.validate(params, this._projectFolder);
		ApplyContentProtectionUtils.validate(params, this._projectFolder, this._commandMetadata.sdkCommand);

		return {
			...params,
			[COMMAND.OPTIONS.PROJECT]: CommandUtils.quoteString(this._projectFolder),
			[COMMAND.OPTIONS.AUTH_ID]: getProjectDefaultAuthId(this._executionPath),
			...AccountSpecificValuesUtils.transformArgument(params),
		};
	}

	async execute(params) {
		try {
			const flags = [COMMAND.FLAGS.NO_PREVIEW, COMMAND.FLAGS.SKIP_WARNING];
			if (params[COMMAND.FLAGS.VALIDATE]) {
				delete params[COMMAND.FLAGS.VALIDATE];
				flags.push(COMMAND.FLAGS.VALIDATE);
			}

			if (params[COMMAND.FLAGS.APPLY_CONTENT_PROTECTION]) {
				delete params[COMMAND.FLAGS.APPLY_CONTENT_PROTECTION];
				flags.push(COMMAND.FLAGS.APPLY_CONTENT_PROTECTION);
			}

			const sdkParams = CommandUtils.extractCommandOptions(params, this._commandMetadata);

			const executionContextForDeploy = SdkExecutionContext.Builder.forCommand(this._commandMetadata.sdkCommand)
				.integration()
				.addParams(sdkParams)
				.addFlags(flags)
				.build();

			const operationResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContextForDeploy),
				message: NodeTranslationService.getMessage(MESSAGES.DEPLOYING, getProjectDefaultAuthId(this._executionPath)),
			});

			const isServerValidation = sdkParams[COMMAND.FLAGS.VALIDATE] ? true : false;
			const isApplyContentProtection = this._projectType === PROJECT_SUITEAPP && flags.includes(COMMAND.FLAGS.APPLY_CONTENT_PROTECTION);

			return operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
				? DeployActionResult.Builder.withData(operationResult.data)
						.withResultMessage(operationResult.resultMessage)
						.withServerValidation(isServerValidation)
						.withAppliedContentProtection(isApplyContentProtection)
						.withProjectType(this._projectType)
						.withProjectFolder(this._projectFolder)
						.build()
				: DeployActionResult.Builder.withErrors(operationResult.errorMessages).build();
		} catch (error) {
			return DeployActionResult.Builder.withErrors([error]).build();
		}
	}
};
