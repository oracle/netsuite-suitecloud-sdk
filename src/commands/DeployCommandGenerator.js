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

const { FILE_NAMES, PROJECT_ACP, PROJECT_SUITEAPP } = require('../ApplicationConstants');

const {
	COMMAND_DEPLOY: { ERRORS, QUESTIONS, QUESTIONS_CHOICES, MESSAGES, OUTPUT },
	NO,
	YES,
} = require('../services/TranslationKeys');

const COMMAND = {
	OPTIONS: {
		ACCOUNT_SPECIFIC_VALUES: 'accountspecificvalues',
		APPLY_CONTENT_PROTECTION: 'applycontentprotection',
		EXCLUDE_PROPERTIES: 'excludeproperties',
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
	IGNORE: 'IGNORE',
	WARNING: 'WARNING',
};
const APPLY_CONTENT_PROTECTION_VALUES = {
	FALSE: 'F',
	TRUE: 'T',
};

const INSATALLATION_PREFERENCES_FOLDER = '/InstallationPreferences';

module.exports = class DeployCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._projectMetadataService = new ProjectMetadataService();
	}

	async _getCommandQuestions(prompt) {
		const answers = await prompt([
			{
				when: this._isSuiteAppProject() && this._hasLockOrHideFiles(),
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
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND.OPTIONS.ACCOUNT_SPECIFIC_VALUES,
				message: TranslationService.getMessage(QUESTIONS.ACCOUNT_SPECIFIC_VALUES),
				default: 0,
				choices: [
					{
						name: TranslationService.getMessage(
							QUESTIONS_CHOICES.ACCOUNT_SPECIFIC_VALUES.IGNORE
						),
						value: ACCOUNT_SPECIFIC_VALUES_OPTIONS.IGNORE,
					},
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
		]);

		return { ...answers, questionsPrompted: true };
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
			INSATALLATION_PREFERENCES_FOLDER
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
			const upperCaseValue = args[COMMAND.OPTIONS.ACCOUNT_SPECIFIC_VALUES].toUpperCase();

			switch (upperCaseValue) {
				case ACCOUNT_SPECIFIC_VALUES_OPTIONS.IGNORE:
					delete args[COMMAND.OPTIONS.ACCOUNT_SPECIFIC_VALUES];
					break;
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

		args.projectType = projectType;

		return args;
	}

	async _executeAction(answers) {
		const { questionsPrompted, projectType } = answers;
		const SDKDeployParams = CommandUtils.extractCommandOptions(answers, this._commandMetadata);
		const flags = [COMMAND.FLAGS.NO_PREVIEW, COMMAND.FLAGS.SKIP_WARNING];
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
			questionsPrompted: answers.questionsPrompted,
		};
	}

	_formatOutput(actionResult) {
		const { deployResult, questionsPrompted } = actionResult;
		if (!questionsPrompted) {
			this._showDeployOptions(actionResult);
		}

		if (SDKOperationResultUtils.hasErrors(deployResult)) {
			SDKOperationResultUtils.logErrors(deployResult);
		} else {
			SDKOperationResultUtils.logMessages(deployResult);
		}
	}

	_showDeployOptions(actionResult) {
		const { projectType, SDKDeployParams } = actionResult;

		const usedOptions = [];
		if (projectType === PROJECT_SUITEAPP) {
			if (
				SDKDeployParams[COMMAND.OPTIONS.APPLY_CONTENT_PROTECTION] ===
				APPLY_CONTENT_PROTECTION_VALUES.FALSE
			) {
				usedOptions.push(TranslationService.getMessage(MESSAGES.NOT_APPLYING_CONTENT_PROTECTION));
			} else {
				usedOptions.push(TranslationService.getMessage(MESSAGES.APPLYING_CONTENT_PROTECTION));
			}
		}
		if (!SDKDeployParams[COMMAND.OPTIONS.ACCOUNT_SPECIFIC_VALUES]) {
			usedOptions.push(TranslationService.getMessage(MESSAGES.IGNORING_ACCOUNT_SPECIFIC_VALUES));
		}
		NodeUtils.println(
			TranslationService.getMessage(
				OUTPUT.NON_INTERACTIVE_DEFAULT_DEPLOY,
				usedOptions.join(TranslationService.getMessage(MESSAGES.AND))
			),
			NodeUtils.COLORS.INFO
		);
	}
};
