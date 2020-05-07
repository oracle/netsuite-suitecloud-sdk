/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const SDKOperationResultUtils = require('../../utils/SDKOperationResultUtils');
const DeployActionResult = require('../../services/actionresult/DeployActionResult');
const CommandUtils = require('../../utils/CommandUtils');
const ProjectInfoService = require('../../services/ProjectInfoService');
const AccountSpecificArgumentHandler = require('../../utils/AccountSpecificValuesArgumentHandler');
const ApplyContentProtectionArgumentHandler = require('../../utils/ApplyContentProtectionArgumentHandler');
const NodeTranslationService = require('../../services/NodeTranslationService');
const { executeWithSpinner } = require('../../ui/CliSpinner');
const SDKExecutionContext = require('../../SDKExecutionContext');
const BaseAction = require('../base/BaseAction');

const { PROJECT_SUITEAPP, SDK_TRUE } = require('../../ApplicationConstants');

const {
	COMMAND_DEPLOY: { MESSAGES },
} = require('../../services/TranslationKeys');

const COMMAND = {
	OPTIONS: {
		ACCOUNT_SPECIFIC_VALUES: 'accountspecificvalues',
		APPLY_CONTENT_PROTECTION: 'applycontentprotection',
		LOG: 'log',
		PROJECT: 'project',
	},
	FLAGS: {
		NO_PREVIEW: 'no_preview',
		SKIP_WARNING: 'skip_warning',
		VALIDATE: 'validate',
	},
};

module.exports = class DeployAction extends BaseAction {
	constructor(options) {
		super(options);

		this._projectInfoService = new ProjectInfoService(this._projectFolder);
		this._projectType = this._projectInfoService.getProjectType();

		this._accountSpecificValuesArgumentHandler = new AccountSpecificArgumentHandler({
			projectInfoService: this._projectInfoService,
		});
		this._applyContentProtectionArgumentHandler = new ApplyContentProtectionArgumentHandler({
			projectInfoService: this._projectInfoService,
			commandName: this._commandMetadata.sdkCommand,
		});
	}

	preExecute(params) {
		this._accountSpecificValuesArgumentHandler.validate(params);
		this._applyContentProtectionArgumentHandler.validate(params);

		return {
			...params,
			[COMMAND.OPTIONS.PROJECT]: CommandUtils.quoteString(this._projectFolder),
			...this._accountSpecificValuesArgumentHandler.transformArgument(params),
			...this._applyContentProtectionArgumentHandler.transformArgument(params),
		};
	}

	async execute(params) {
		try {
			const SDKParams = CommandUtils.extractCommandOptions(params, this._commandMetadata);
			const flags = [COMMAND.FLAGS.NO_PREVIEW, COMMAND.FLAGS.SKIP_WARNING];
			if (SDKParams[COMMAND.FLAGS.VALIDATE]) {
				delete SDKParams[COMMAND.FLAGS.VALIDATE];
				flags.push(COMMAND.FLAGS.VALIDATE);
			}
			const executionContextForDeploy = new SDKExecutionContext({
				command: this._commandMetadata.sdkCommand,
				includeProjectDefaultAuthId: true,
				params: SDKParams,
				flags: flags,
			});

			const operationResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContextForDeploy),
				message: NodeTranslationService.getMessage(MESSAGES.DEPLOYING),
			});

			const isServerValidation = SDKParams[COMMAND.FLAGS.VALIDATE] ? true : false;
			const isApplyContentProtection =
				this._projectType === PROJECT_SUITEAPP && SDKParams[COMMAND.OPTIONS.APPLY_CONTENT_PROTECTION] === SDK_TRUE;

			return operationResult.status === SDKOperationResultUtils.STATUS.SUCCESS
				? DeployActionResult.Builder.withData(operationResult.data)
						.withResultMessage(operationResult.resultMessage)
						.withServerValidation(isServerValidation)
						.withAppliedContentProtection(isApplyContentProtection)
						.withProjectType(this._projectType)
						.withProjectFolder(this._projectFolder)
						.build()
				: DeployActionResult.Builder.withErrors(SDKOperationResultUtils.collectErrorMessages(operationResult)).build();
		} catch (error) {
			return DeployActionResult.Builder.withErrors([error]).build();
		}
	}
};
