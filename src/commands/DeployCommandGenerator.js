/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const path = require('path');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const CommandUtils = require('../utils/CommandUtils');
const SDKExecutionContext = require('../SDKExecutionContext');
const ProjectMetadataService = require('../services/ProjectMetadataService');
const TranslationService = require('../services/TranslationService');
const { executeWithSpinner } = require('../ui/CliSpinner');
const FileUtils = require('../utils/FileUtils');
const NodeUtils = require('../utils/NodeUtils');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const assert = require('assert');

const {
	FILE_NAMES,
	FOLDER_NAMES,
	LINKS,
	PROJECT_ACP,
	PROJECT_SUITEAPP,
} = require('../ApplicationConstants');

const {
	COMMAND_DEPLOY: { ERRORS, QUESTIONS, QUESTIONS_CHOICES, MESSAGES, OUTPUT },
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
const APPLY_CONTENT_PROTECTION_VALUES = {
	FALSE: 'F',
	TRUE: 'T',
};

module.exports = class DeployCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._projectMetadataService = new ProjectMetadataService();
	}

	async _getCommandQuestions(prompt) {
		const isSuiteAppProject = this._isSuiteAppProject();

		const answers = await prompt([
			{
				when: isSuiteAppProject && this._hasLockOrHideFiles(),
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
				when: !isSuiteAppProject,
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
			}
		]);

		if (isSuiteAppProject && !answers.hasOwnProperty(COMMAND.OPTIONS.APPLY_CONTENT_PROTECTION)) {
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

	_isSuiteAppProject() {
		return (
			this._projectMetadataService.getProjectType(this._projectFolder) === PROJECT_SUITEAPP
		);
	}
	_isACProject() {
		return this._projectMetadataService.getProjectType(this._projectFolder) === PROJECT_ACP;
	}

	_hasLockOrHideFiles() {
		const pathToInstallationPreferences = path.join(
			this._projectFolder,
			FOLDER_NAMES.INSTALLATION_PREFERENCES
		);
		return (
			FileUtils.exists(
				path.join(pathToInstallationPreferences, FILE_NAMES.HIDING_PREFERENCE)
			) ||
			FileUtils.exists(
				path.join(pathToInstallationPreferences, FILE_NAMES.LOCKING_PREFERENCE)
			)
		);
	}

	_preExecuteAction(args) {
		args[COMMAND.OPTIONS.PROJECT] = CommandUtils.quoteString(this._projectFolder);

		if (args.hasOwnProperty(COMMAND.OPTIONS.ACCOUNT_SPECIFIC_VALUES)) {
			assert(
				typeof args[COMMAND.OPTIONS.ACCOUNT_SPECIFIC_VALUES] === 'string',
				TranslationService.getMessage(ERRORS.WRONG_ACCOUNT_SPECIFIC_VALUES_OPTION)
			);
			const upperCaseValue = args[COMMAND.OPTIONS.ACCOUNT_SPECIFIC_VALUES].toUpperCase();

			switch (upperCaseValue) {
				case ACCOUNT_SPECIFIC_VALUES_OPTIONS.WARNING:
					args[COMMAND.OPTIONS.ACCOUNT_SPECIFIC_VALUES] =
						ACCOUNT_SPECIFIC_VALUES_OPTIONS.WARNING;
					break;
				case ACCOUNT_SPECIFIC_VALUES_OPTIONS.ERROR:
					args[COMMAND.OPTIONS.ACCOUNT_SPECIFIC_VALUES] =
						ACCOUNT_SPECIFIC_VALUES_OPTIONS.ERROR;
					break;
				default:
					throw TranslationService.getMessage(
						ERRORS.WRONG_ACCOUNT_SPECIFIC_VALUES_OPTION
					);
			}
		}

		const projectType = this._projectMetadataService.getProjectType(this._projectFolder);

		if (args[COMMAND.OPTIONS.APPLY_CONTENT_PROTECTION] && projectType === PROJECT_ACP) {
			throw TranslationService.getMessage(ERRORS.APPLY_CONTENT_PROTECTION_IN_ACP);
		}

		if (projectType === PROJECT_SUITEAPP) {
			args[COMMAND.OPTIONS.APPLY_CONTENT_PROTECTION] = args[
				COMMAND.OPTIONS.APPLY_CONTENT_PROTECTION
			]
				? APPLY_CONTENT_PROTECTION_VALUES.TRUE
				: APPLY_CONTENT_PROTECTION_VALUES.FALSE;
		}

		return { ...args, projectType };
	}

	async _executeAction(answers) {
		const { projectType } = answers;
		const SDKDeployParams = CommandUtils.extractCommandOptions(answers, this._commandMetadata);
		const flags = [COMMAND.FLAGS.NO_PREVIEW, COMMAND.FLAGS.SKIP_WARNING];
		if (SDKDeployParams[COMMAND.FLAGS.VALIDATE]) {
			delete SDKDeployParams[COMMAND.FLAGS.VALIDATE];
			flags.push(COMMAND.FLAGS.VALIDATE);
		}
		const executionContextForDeploy = new SDKExecutionContext({
			command: this._commandMetadata.name,
			params: SDKDeployParams,
			flags,
		});

		const deployResult = await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContextForDeploy),
			message: TranslationService.getMessage(MESSAGES.DEPLOYING),
		});

		return {
			deployResult,
			SDKDeployParams,
			projectType,
		};
	}

	_formatOutput(actionResult) {
		assert(actionResult.deployResult);
		assert(actionResult.SDKDeployParams);
		assert(actionResult.projectType);

		const { deployResult } = actionResult;

		if (SDKOperationResultUtils.hasErrors(deployResult)) {
			SDKOperationResultUtils.logResultMessage(deployResult);
			SDKOperationResultUtils.logErrors(deployResult);
		} else {
			this._showApplyContentProtectionOptionMessage(actionResult);
			const { data } = deployResult;
			SDKOperationResultUtils.logResultMessage(deployResult);
			if (Array.isArray(data)) {
				data.forEach(message => NodeUtils.println(message, NodeUtils.COLORS.RESULT));
			}
		}
	}

	_showApplyContentProtectionOptionMessage(actionResult) {
		const { projectType, SDKDeployParams } = actionResult;

		if (projectType === PROJECT_SUITEAPP) {
			if (
				SDKDeployParams[COMMAND.OPTIONS.APPLY_CONTENT_PROTECTION] ===
				APPLY_CONTENT_PROTECTION_VALUES.TRUE
			) {
				NodeUtils.println(
					TranslationService.getMessage(
						MESSAGES.APPLYING_CONTENT_PROTECTION,
						this._executionPath
					),
					NodeUtils.COLORS.INFO
				);
			} else {
				NodeUtils.println(
					TranslationService.getMessage(
						MESSAGES.NOT_APPLYING_CONTENT_PROTECTION,
						this._executionPath
					),
					NodeUtils.COLORS.INFO
				);
			}
		}
	}
};
