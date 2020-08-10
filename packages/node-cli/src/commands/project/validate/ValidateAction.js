/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
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
const ApplyContentProtectionUtils = require('../../../utils/ApplyContentProtectionUtils');
const { executeWithSpinner } = require('../../../ui/CliSpinner');
const { getProjectDefaultAuthId } = require('../../../utils/AuthenticationUtils');

const {
	COMMAND_VALIDATE: { MESSAGES },
} = require('../../../services/TranslationKeys');

const COMMAND_OPTIONS = {
	SERVER: 'server',
	ACCOUNT_SPECIFIC_VALUES: 'accountspecificvalues',
	APPLY_CONTENT_PROTECTION: 'applycontentprotection',
	PROJECT: 'project',
	AUTH_ID: 'authid',
};

module.exports = class ValidateAction extends BaseAction {
	constructor(options) {
		super(options);
		this._projectType = new ProjectInfoService(this._projectFolder).getProjectType()
	}

	preExecute(params) {
		params[COMMAND_OPTIONS.PROJECT] = CommandUtils.quoteString(this._projectFolder);
		params[COMMAND_OPTIONS.AUTH_ID] = getProjectDefaultAuthId(this._executionPath);

		AccountSpecificValuesUtils.validate(params, this._projectFolder);
		ApplyContentProtectionUtils.validate(params, this._projectFolder, this._commandMetadata.sdkCommand);

		return {
			...params,
			...AccountSpecificValuesUtils.transformArgument(params),
		};
	}

	async execute(params) {
		try {
			let isServerValidation = false;
			let contentProtectionApplied = false;
			const flags = [];

			if (params[COMMAND_OPTIONS.SERVER]) {
				flags.push(COMMAND_OPTIONS.SERVER);
				isServerValidation = true;
				delete params[COMMAND_OPTIONS.SERVER];
			}

			if (params[COMMAND_OPTIONS.APPLY_CONTENT_PROTECTION]) {
				flags.push(COMMAND_OPTIONS.APPLY_CONTENT_PROTECTION);
				contentProtectionApplied = true;
				delete params[COMMAND_OPTIONS.APPLY_CONTENT_PROTECTION];
			}

			const sdkParams = CommandUtils.extractCommandOptions(params, this._commandMetadata);

			const executionContext = SdkExecutionContext.Builder.forCommand(this._commandMetadata.sdkCommand)
				.integration()
				.addParams(sdkParams)
				.addFlags(flags)
				.build();

			const operationResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContext),
				message: NodeTranslationService.getMessage(MESSAGES.VALIDATING, getProjectDefaultAuthId(this._executionPath)),
			});

			return operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
				? DeployActionResult.Builder.withData(operationResult.data)
						.withResultMessage(operationResult.resultMessage)
						.withServerValidation(isServerValidation)
						.withAppliedContentProtection(contentProtectionApplied)
						.withProjectType(this._projectType)
						.withProjectFolder(this._projectFolder)
						.build()
				: DeployActionResult.Builder.withErrors(operationResult.errorMessages)
						.withServerValidation(isServerValidation)
						.build();
		} catch (error) {
			return DeployActionResult.Builder.withErrors([error]).build();
		}
	}
};
