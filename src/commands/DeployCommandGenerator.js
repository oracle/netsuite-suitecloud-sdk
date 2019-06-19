'use strict';

const path = require('path');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const CommandUtils = require('../utils/CommandUtils');
const SDKExecutionContext = require('../SDKExecutionContext');
const ProjectMetadataService = require('../services/ProjectMetadataService');
const TranslationService = require('../services/TranslationService');
const { executeWithSpinner } = require('../ui/CliSpinner');
const FileUtils = require('../utils/FileUtils');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');

const { FILE_NAMES, PROJECT_ACP, PROJECT_SUITEAPP, } = require('../ApplicationConstants');

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
					{ name: TranslationService.getMessage(YES), value: 'T' },
					{ name: TranslationService.getMessage(NO), value: 'F' },
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

		return answers;
	}

	_isSuiteAppProject() {
		return (
			this._projectMetadataService.getProjectType(this._projectFolder) === PROJECT_SUITEAPP
		);
	}
	_isACProject() {
		return (this._projectMetadataService.getProjectType(this._projectFolder) === PROJECT_ACP);
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
		console.log(args);
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

		args[COMMAND.OPTIONS.APPLY_CONTENT_PROTECTION] = args[
			COMMAND.OPTIONS.APPLY_CONTENT_PROTECTION
		]
			? APPLY_CONTENT_PROTECTION_VALUES.TRUE
			: APPLY_CONTENT_PROTECTION_VALUES.FALSE;

		if (args[COMMAND.OPTIONS.APPLY_CONTENT_PROTECTION] === APPLY_CONTENT_PROTECTION_VALUES.TRUE && this._isACProject()) {
			throw TranslationService.getMessage(ERRORS.APPLY_CONTENT_PROTECTION_IN_ACP);
		}
		return args;
	}

	_executeAction(answers) {
		console.log(answers);
		const flags = [COMMAND.FLAGS.NO_PREVIEW, COMMAND.FLAGS.SKIP_WARNING];
		const executionContextForDeploy = new SDKExecutionContext({
			command: this._commandMetadata.name,
			params: answers,
			flags,
		});

		return executeWithSpinner({
			action: this._sdkExecutor.execute(executionContextForDeploy),
			message: 'deploying',
		});
	}

	_formatOutput(operationResult) {
		console.log('operationResult:');
		console.log(operationResult);
		if (SDKOperationResultUtils.hasErrors(operationResult)) {
			SDKOperationResultUtils.logErrors(operationResult);
		} else {
			SDKOperationResultUtils.logMessages(operationResult);
		}
	}
};
