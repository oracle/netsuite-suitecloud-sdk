'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const SDKExecutionContext = require('../SDKExecutionContext');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const NodeUtils = require('../utils/NodeUtils');
const TranslationService = require('../services/TranslationService');
const CommandUtils = require('../utils/CommandUtils');
const ProjectMetadataService = require('../services/ProjectMetadataService');
const { PROJECT_SUITEAPP } = require('../ApplicationConstants');

const {
	COMMAND_VALIDATE: { QUESTIONS, QUESTIONS_CHOICES, OUTPUT },
	YES,
	NO,
} = require('../services/TranslationKeys');

const COMMAND_OPTIONS = {
	SERVER: 'server',
	ACCOUNT_SPECIFIC_VALUES: 'accountspecificvalues',
	APPLY_CONTENT_PROTECTION: 'applycontentprotection',
};

const ACCOUNT_SPECIFIC_VALUES_OPTIONS = {
	IGNORE: 'IGNORE',
	WARNING: 'WARNING',
	ERROR: 'ERROR',
};

const APPLY_CONTENT_PROTECTION_VALUE = {
	TRUE: 'T',
	FALSE: 'F',
};

const ERROR_LEVEL = {
	ERROR: 'ERROR',
	WARNING: 'WARNING',
};

var isServerValidation = false;

module.exports = class ValidateCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._projectMetadataService = new ProjectMetadataService();
	}

	_getCommandQuestions(prompt) {
		return prompt([
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND_OPTIONS.SERVER,
				message: TranslationService.getMessage(QUESTIONS.SERVER_SIDE),
				default: 0,
				choices: [
					{
						name: TranslationService.getMessage(
							QUESTIONS_CHOICES.ACCOUNT_OR_LOCAL.ACCOUNT
						),
						value: true,
					},
					{
						name: TranslationService.getMessage(
							QUESTIONS_CHOICES.ACCOUNT_OR_LOCAL.LOCAL
						),
						value: false,
					},
				],
			},
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND_OPTIONS.ACCOUNT_SPECIFIC_VALUES,
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
							QUESTIONS_CHOICES.ACCOUNT_SPECIFIC_VALUES.WARNING
						),
						value: ACCOUNT_SPECIFIC_VALUES_OPTIONS.WARNING,
					},
					{
						name: TranslationService.getMessage(
							QUESTIONS_CHOICES.ACCOUNT_SPECIFIC_VALUES.CANCEL
						),
						value: ACCOUNT_SPECIFIC_VALUES_OPTIONS.ERROR,
					},
				],
			},
			{
				when: this._isSuiteAppProject(),
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND_OPTIONS.APPLY_CONTENT_PROTECTION,
				message: TranslationService.getMessage(QUESTIONS.APPLY_CONTENT_PROTECTION),
				default: 0,
				choices: [
					{
						name: TranslationService.getMessage(NO),
						value: false,
					},
					{
						name: TranslationService.getMessage(YES),
						value: true,
					},
				],
			},
		]);
	}

	_isSuiteAppProject() {
		return (
			this._projectMetadataService.getProjectType(this._projectFolder) === PROJECT_SUITEAPP
		);
	}

	_preExecuteAction(args) {
		args.project = this._projectFolder;
		return args;
	}

	_executeAction(answers) {
		if (!answers[COMMAND_OPTIONS.APPLY_CONTENT_PROTECTION]) {
			delete answers[COMMAND_OPTIONS.APPLY_CONTENT_PROTECTION];
		} else {
			answers[COMMAND_OPTIONS.APPLY_CONTENT_PROTECTION] = APPLY_CONTENT_PROTECTION_VALUE.TRUE;
		}

		const flags = [];

		if (answers[COMMAND_OPTIONS.SERVER]) {
			flags.push(COMMAND_OPTIONS.SERVER);
			isServerValidation = true;
		}

		delete answers[COMMAND_OPTIONS.SERVER];

		if (answers.accountspecificvalues === ACCOUNT_SPECIFIC_VALUES_OPTIONS.IGNORE) {
			delete answers.accountspecificvalues;
		}

		const executionContext = new SDKExecutionContext({
			command: this._commandMetadata.name,
			params: answers,
			flags: flags,
		});
		return this._sdkExecutor.execute(executionContext);
	}

	_formatOutput(operationResult) {
		const { data } = operationResult;

		if (SDKOperationResultUtils.hasErrors(operationResult)) {
			SDKOperationResultUtils.logErrors(operationResult);
		} else {
			if (isServerValidation) {
				if (Array.isArray(data)) {
					data.forEach(resultLine => {
						NodeUtils.println(resultLine, NodeUtils.COLORS.RESULT);
					});
				}
			} else {
				this._logValidationEntries(data.warnings, true);
				this._logValidationEntries(data.errors, false);
			}
		}
		SDKOperationResultUtils.logResultMessage(operationResult);
	}

	_logValidationEntries(errorsOrWarnings, isWarning) {
		const files = [];
		errorsOrWarnings.forEach(entry => {
			if (files.indexOf(entry.filePath) === -1) {
				files.push(entry.filePath);
			}
		});

		const headingLabel = isWarning
			? TranslationService.getMessage(OUTPUT.HEADING_LABEL_WARNING)
			: TranslationService.getMessage(OUTPUT.HEADING_LABEL_ERROR);
		const color = isWarning ? NodeUtils.COLORS.WARNING : NodeUtils.COLORS.ERROR;

		NodeUtils.println(`${headingLabel}:`, color);

		files.forEach(file => {
			const fileString = `    ${file}`;
			NodeUtils.println(fileString, color);
			errorsOrWarnings
				.filter(entry => entry.filePath === file)
				.forEach(entry => {
					const lineNumberLabel = TranslationService.getMessage(OUTPUT.LABEL_LINE_NUMBER);
					const entryString = `        - ${lineNumberLabel} ${entry.lineNumber} - ${
						entry.message
					}`;
					NodeUtils.println(entryString, color);
				});
		});
	}
};
