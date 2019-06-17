'use strict';

const path = require('path');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const CommandUtils = require('../utils/CommandUtils');
const SDKExecutionContext = require('../SDKExecutionContext');
const ProjectMetadataService = require('../services/ProjectMetadataService');
const TranslationService = require('../services/TranslationService');
const { executeWithSpinner } = require('../ui/CliSpinner');
const NodeUtils = require('../utils/NodeUtils');
const FileUtils = require('../utils/FileUtils');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const {
	validateArrayIsNotEmpty,
	showValidationResults,
} = require('../validation/InteractiveAnswersValidator');
const { PROJECT_SUITEAPP, FILE_NAMES } = require('../ApplicationConstants');

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
const COMMAND_ANSWERS = {
	OVERWRITE_FILES: 'overwrite',
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
				when: (this._isSuiteAppProject() && this._hasLockOrHideFiles()),
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
						value: false,
					},
					{
						name: TranslationService.getMessage(
							QUESTIONS_CHOICES.ACCOUNT_SPECIFIC_VALUES.DISPLAY_WARNING
						),
						value: 'WARNING',
					},
					{
						name: TranslationService.getMessage(
							QUESTIONS_CHOICES.ACCOUNT_SPECIFIC_VALUES.CANCEL_PROCESS
						),
						value: 'ERROR',
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

	_hasLockOrHideFiles() {
		const pathToInstallationPreferences = path.join(this._projectFolder, INSATALLATION_PREFERENCES_FOLDER);
		return (
			FileUtils.exists(path.join(pathToInstallationPreferences, FILE_NAMES.HIDING_PREFERENCE)) ||
			FileUtils.exists(path.join(pathToInstallationPreferences, FILE_NAMES.LOCKING_PREFERENCE))
		);
	}

	_preExecuteAction(args) {
		args[COMMAND.OPTIONS.PROJECT] = CommandUtils.quoteString(this._projectFolder);
		if(args.hasOwnProperty(COMMAND.OPTIONS.ACCOUNT_SPECIFIC_VALUES) && args[COMMAND.OPTIONS.ACCOUNT_SPECIFIC_VALUES] === false) {
			delete args[COMMAND.OPTIONS.ACCOUNT_SPECIFIC_VALUES];
		}
		return args;
	}

	_executeAction(answers) {
		const flags = [COMMAND.FLAGS.NO_PREVIEW, COMMAND.FLAGS.SKIP_WARNING]
		const executionContextForDeploy = new SDKExecutionContext({
			command: this._commandMetadata.name,
			params: answers,
			flags
		});
		
		return executeWithSpinner({
			action: this._sdkExecutor.execute(executionContextForDeploy),
			message: 'deploying' 
		});
	}

	_formatOutput(actionResult) {
		console.log(actionResult)
	}
};
