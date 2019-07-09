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
	COMMAND_VALIDATE: { QUESTIONS, QUESTIONS_CHOICES },
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
	TRUE : 'T',
	FALSE: 'F'
}

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
		args.log = this._projectFolder;
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
			if (Array.isArray(data)) {
				data.forEach(resultLine => {
					NodeUtils.println(resultLine, NodeUtils.COLORS.INFO);
				});
			}
		}
		SDKOperationResultUtils.logResultMessage;
	}
};
