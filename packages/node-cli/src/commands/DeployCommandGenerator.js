/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const ActionResultUtils = require('../utils/ActionResultUtils')
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const DeployActionResult = require('../commands/actionresult/DeployActionResult');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const CommandUtils = require('../utils/CommandUtils');
const ProjectInfoService = require('../services/ProjectInfoService');
const AccountSpecificArgumentHandler = require('../utils/AccountSpecificValuesArgumentHandler');
const ApplyContentProtectionArgumentHandler = require('../utils/ApplyContentProtectionArgumentHandler');
const TranslationService = require('../services/TranslationService');
const { executeWithSpinner } = require('../ui/CliSpinner');
const NodeUtils = require('../utils/NodeUtils');
const SDKExecutionContext = require('../SDKExecutionContext');

const { LINKS, PROJECT_ACP, PROJECT_SUITEAPP, SDK_TRUE } = require('../ApplicationConstants');

const {
	COMMAND_DEPLOY: { QUESTIONS, QUESTIONS_CHOICES, MESSAGES },
	NO,
	YES,
} = require('../services/TranslationKeys');

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

const ACCOUNT_SPECIFIC_VALUES_OPTIONS = {
	ERROR: 'ERROR',
	WARNING: 'WARNING',
};

module.exports = class DeployCommandGenerator extends BaseCommandGenerator {
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

	async _getCommandQuestions(prompt) {
		const isSuiteAppProject = this._projectType === PROJECT_SUITEAPP;
		const isACProject = this._projectType === PROJECT_ACP;

		const answers = await prompt([
			{
				when: isSuiteAppProject && this._projectInfoService.hasLockAndHideFiles(),
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND.OPTIONS.APPLY_CONTENT_PROTECTION,
				message: TranslationService.getMessage(QUESTIONS.APPLY_CONTENT_PROTECTION),
				default: 1,
				choices: [
					{ name: TranslationService.getMessage(YES), value: true },
					{ name: TranslationService.getMessage(NO), value: false },
				],
			},
			{
				when: isACProject,
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND.OPTIONS.ACCOUNT_SPECIFIC_VALUES,
				message: TranslationService.getMessage(QUESTIONS.ACCOUNT_SPECIFIC_VALUES),
				default: 1,
				choices: [
					{
						name: TranslationService.getMessage(
							QUESTIONS_CHOICES.ACCOUNT_SPECIFIC_VALUES.DISPLAY_WARNING
						),
						value: ACCOUNT_SPECIFIC_VALUES_OPTIONS.WARNING,
					},
					{
						name: TranslationService.getMessage(
							QUESTIONS_CHOICES.ACCOUNT_SPECIFIC_VALUES.CANCEL_PROCESS
						),
						value: ACCOUNT_SPECIFIC_VALUES_OPTIONS.ERROR,
					},
				],
			},
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND.FLAGS.VALIDATE,
				message: TranslationService.getMessage(QUESTIONS.PERFORM_LOCAL_VALIDATION),
				default: 0,
				choices: [
					{ name: TranslationService.getMessage(YES), value: true },
					{ name: TranslationService.getMessage(NO), value: false },
				],
			},
		]);

		if (
			isSuiteAppProject &&
			!answers.hasOwnProperty(COMMAND.OPTIONS.APPLY_CONTENT_PROTECTION)
		) {
			NodeUtils.println(
				TranslationService.getMessage(
					MESSAGES.NOT_ASKING_CONTENT_PROTECTION_REASON,
					LINKS.HOW_TO.CREATE_HIDDING_XML,
					LINKS.HOW_TO.CREATE_LOCKING_XML
				),
				NodeUtils.COLORS.INFO
			);
		}

		return answers;
	}

	_preExecuteAction(args) {
		this._accountSpecificValuesArgumentHandler.validate(args);
		this._applyContentProtectionArgumentHandler.validate(args);

		return {
			...args,
			[COMMAND.OPTIONS.PROJECT]: CommandUtils.quoteString(this._projectFolder),
			...this._accountSpecificValuesArgumentHandler.transformArgument(args),
			...this._applyContentProtectionArgumentHandler.transformArgument(args),
		};
	}

	async _executeAction(answers) {
		try {
			const SDKParams = CommandUtils.extractCommandOptions(answers, this._commandMetadata);
			const flags = [COMMAND.FLAGS.NO_PREVIEW, COMMAND.FLAGS.SKIP_WARNING];
			if (SDKParams[COMMAND.FLAGS.VALIDATE]) {
				delete SDKParams[COMMAND.FLAGS.VALIDATE];
				flags.push(COMMAND.FLAGS.VALIDATE);
			}
			const executionContextForDeploy = new SDKExecutionContext({
				command: this._commandMetadata.sdkCommand,
				includeProjectDefaultAuthId: true,
				params: SDKParams,
				flags,
			});

			const operationResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContextForDeploy),
				message: TranslationService.getMessage(MESSAGES.DEPLOYING),
			});

			var isServerValidation = SDKParams[COMMAND.FLAGS.VALIDATE] ? true : false;
			var isApplyContentProtection =
				(this._projectType === PROJECT_SUITEAPP && SDKParams[COMMAND.OPTIONS.APPLY_CONTENT_PROTECTION] === SDK_TRUE);

			return operationResult.status === SDKOperationResultUtils.SUCCESS
				? DeployActionResult.Builder
					.withData(operationResult.data)
					.withResultMessage(operationResult.resultMessage)
					.isServerValidation(isServerValidation)
					.appliedContentProtection(isApplyContentProtection)
					.build()
				: DeployActionResult.Builder
					.withErrors(ActionResultUtils.collectErrorMessages(operationResult))
					.build()
		} catch (error) {
			return DeployActionResult.Builder.withErrors([error]).build();
		}
	}

	_formatOutput(actionResult) {
		if (actionResult.status === ActionResult.ERROR) {
			ActionResultUtils.logErrors(actionResult.errorMessages);
			return;
		}

		this._showApplyContentProtectionOptionMessage(actionResult.appliedContentProtection);
		if (actionResult.isServerValidation) {
			NodeUtils.println(
				TranslationService.getMessage(MESSAGES.LOCALLY_VALIDATED, this._projectFolder),
				NodeUtils.COLORS.INFO
			);
		}
		if (actionResult.resultMessage) {
			ActionResultUtils.logResultMessage(actionResult);
		}
		if (Array.isArray(actionResult.data)) {
			actionResult.data.forEach(message => NodeUtils.println(message, NodeUtils.COLORS.RESULT));
		}
	}

	_showApplyContentProtectionOptionMessage(isApplyContentProtection) {
		if (this._projectType === PROJECT_SUITEAPP) {
			if (isApplyContentProtection === SDK_TRUE) {
				NodeUtils.println(
					TranslationService.getMessage(
						MESSAGES.APPLYING_CONTENT_PROTECTION,
						this._projectFolder
					),
					NodeUtils.COLORS.INFO
				);
			} else {
				NodeUtils.println(
					TranslationService.getMessage(
						MESSAGES.NOT_APPLYING_CONTENT_PROTECTION,
						this._projectFolder
					),
					NodeUtils.COLORS.INFO
				);
			}
		}
	}
};


