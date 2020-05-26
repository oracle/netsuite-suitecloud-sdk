/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const DeployActionResult = require('../commands/actionresult/DeployActionResult');
const SdkExecutionContext = require('../SdkExecutionContext');
const SdkOperationResultUtils = require('../utils/SdkOperationResultUtils');
const NodeTranslationService = require('../services/NodeTranslationService');
const CommandUtils = require('../utils/CommandUtils');
const ProjectInfoService = require('../services/ProjectInfoService');
const AccountSpecificArgumentHandler = require('../utils/AccountSpecificValuesArgumentHandler');
const ApplyContentProtectinoArgumentHandler = require('../utils/ApplyContentProtectionArgumentHandler');
const ValidateOutputFormatter = require('./outputFormatters/ValidateOutputFormatter');
const { executeWithSpinner } = require('../ui/CliSpinner');

const { PROJECT_ACP, PROJECT_SUITEAPP, SDK_TRUE } = require('../ApplicationConstants');

const {
	COMMAND_VALIDATE: { MESSAGES, QUESTIONS, QUESTIONS_CHOICES },
	YES,
	NO,
} = require('../services/TranslationKeys');

const COMMAND_OPTIONS = {
	SERVER: 'server',
	ACCOUNT_SPECIFIC_VALUES: 'accountspecificvalues',
	APPLY_CONTENT_PROTECTION: 'applycontentprotection',
	PROJECT: 'project',
};

const ACCOUNT_SPECIFIC_VALUES_OPTIONS = {
	ERROR: 'ERROR',
	WARNING: 'WARNING',
};

module.exports = class ValidateCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._projectInfoService = new ProjectInfoService(this._projectFolder);
		this._accountSpecificValuesArgumentHandler = new AccountSpecificArgumentHandler({
			projectInfoService: this._projectInfoService,
		});
		this._applyContentProtectionArgumentHandler = new ApplyContentProtectinoArgumentHandler({
			projectInfoService: this._projectInfoService,
			commandName: this._commandMetadata.sdkCommand,
		});
		this._outputFormatter = new ValidateOutputFormatter(this.consoleLogger);
	}

	_getCommandQuestions(prompt) {
		return prompt([
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND_OPTIONS.SERVER,
				message: NodeTranslationService.getMessage(QUESTIONS.SERVER_SIDE),
				default: 0,
				choices: [
					{
						name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.ACCOUNT_OR_LOCAL.ACCOUNT),
						value: true,
					},
					{
						name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.ACCOUNT_OR_LOCAL.LOCAL),
						value: false,
					},
				],
			},
			{
				when: this._projectInfoService.getProjectType() === PROJECT_ACP,
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND_OPTIONS.ACCOUNT_SPECIFIC_VALUES,
				message: NodeTranslationService.getMessage(QUESTIONS.ACCOUNT_SPECIFIC_VALUES),
				default: 1,
				choices: [
					{
						name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.ACCOUNT_SPECIFIC_VALUES.WARNING),
						value: ACCOUNT_SPECIFIC_VALUES_OPTIONS.WARNING,
					},
					{
						name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.ACCOUNT_SPECIFIC_VALUES.CANCEL),
						value: ACCOUNT_SPECIFIC_VALUES_OPTIONS.ERROR,
					},
				],
			},
			{
				when: this._projectInfoService.getProjectType() === PROJECT_SUITEAPP && this._projectInfoService.hasLockAndHideFiles(),
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND_OPTIONS.APPLY_CONTENT_PROTECTION,
				message: NodeTranslationService.getMessage(QUESTIONS.APPLY_CONTENT_PROTECTION),
				default: 0,
				choices: [
					{
						name: NodeTranslationService.getMessage(NO),
						value: false,
					},
					{
						name: NodeTranslationService.getMessage(YES),
						value: true,
					},
				],
			},
		]);
	}

	_preExecuteAction(args) {
		this._accountSpecificValuesArgumentHandler.validate(args);
		this._applyContentProtectionArgumentHandler.validate(args);

		return {
			...args,
			[COMMAND_OPTIONS.PROJECT]: CommandUtils.quoteString(this._projectFolder),
			...this._accountSpecificValuesArgumentHandler.transformArgument(args),
		};
	}

	async _executeAction(answers) {
		try {
			const sdkParams = CommandUtils.extractCommandOptions(answers, this._commandMetadata);

			let isServerValidation = false;
			const flags = [];

			if (answers[COMMAND_OPTIONS.SERVER]) {
				flags.push(COMMAND_OPTIONS.SERVER);
				isServerValidation = true;
				delete sdkParams[COMMAND_OPTIONS.SERVER];
			}

			if (answers[COMMAND_OPTIONS.APPLY_CONTENT_PROTECTION]) {
				flags.push(COMMAND_OPTIONS.APPLY_CONTENT_PROTECTION);
				delete sdkParams[COMMAND_OPTIONS.APPLY_CONTENT_PROTECTION];
			}

			const executionContext = new SdkExecutionContext({
				command: this._commandMetadata.sdkCommand,
				params: sdkParams,
				flags: flags,
				includeProjectDefaultAuthId: true,
			});

			const operationResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContext),
				message: NodeTranslationService.getMessage(MESSAGES.VALIDATING),
			});

			return operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
				? DeployActionResult.Builder.withData(operationResult.data)
						.withResultMessage(operationResult.resultMessage)
						.withServerValidation(isServerValidation)
						.withAppliedContentProtection(flags[COMMAND_OPTIONS.APPLY_CONTENT_PROTECTION])
						.withProjectType(this._projectInfoService.getProjectType)
						.withProjectFolder(this._projectFolder)
						.build()
				: DeployActionResult.Builder.withErrors(SdkOperationResultUtils.collectErrorMessages(operationResult)).build();
		} catch (error) {
			return DeployActionResult.Builder.withErrors([error]).build();
		}
	}
};
