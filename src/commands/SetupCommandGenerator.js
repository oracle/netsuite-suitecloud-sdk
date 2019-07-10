'use strict';

const path = require('path');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const SDKExecutionContext = require('../SDKExecutionContext');
const { executeWithSpinner } = require('../ui/CliSpinner');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const NodeUtils = require('../utils/NodeUtils');
const FileUtils = require('../utils/FileUtils');
const AccountDetails = require('./../core/accountsetup/AccountDetails');
const CommandUtils = require('../utils/CommandUtils');
const TranslationService = require('../services/TranslationService');
const AccountService = require('../services/AccountService');
const inquirer = require('inquirer');

const ISSUE_TOKEN_COMMAND = 'issuetoken';
const SAVE_TOKEN_COMMAND = 'savetoken';

const {
	ACCOUNT_DETAILS_FILENAME,
	LINKS,
	MANIFEST_XML,
	REST_ROLES_URL,
	PROD_ENVIRONMENT_ADDRESS,
} = require('../ApplicationConstants');

const {
	COMMAND_SETUPACCOUNT: { ERRORS, QUESTIONS, MESSAGES, OUTPUT },
	NO,
	YES,
} = require('../services/TranslationKeys');

const ANSWERS = {
	OVERWRITE: 'overwrite',
	DEVELOPMENT_URL: 'developmentUrl',
	EMAIL: 'email',
	PASSWORD: 'password',
	COMPANY_ID: 'companyId',
	ROLE_ID: 'roleId',
	ISSUE_A_TOKEN: 'issueAToken',
	SAVE_TOKEN_ID: 'saveTokenId',
	SAVE_TOKEN_SECRET: 'saveTokenSecret',
};

const {
	validateFieldIsNotEmpty,
	validateEmail,
	showValidationResults,
} = require('../validation/InteractiveAnswersValidator');

module.exports = class SetupCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._accountService = new AccountService();
	}

	async _getCommandQuestions(prompt, commandArguments) {
		this._checkWorkingDirectoryContainsValidProject();

		if (this._accountDetailsFileExists()) {
			const overwriteAnswer = await prompt([
				{
					type: CommandUtils.INQUIRER_TYPES.LIST,
					name: ANSWERS.OVERWRITE,
					message: TranslationService.getMessage(
						QUESTIONS.OVERWRITE_ACCOUNT_DETAILS_FILE,
						ACCOUNT_DETAILS_FILENAME
					),
					default: 0,
					choices: [
						{ name: TranslationService.getMessage(YES), value: true },
						{ name: TranslationService.getMessage(NO), value: false },
					],
				},
			]);
			if (!overwriteAnswer[ANSWERS.OVERWRITE]) {
				throw TranslationService.getMessage(MESSAGES.CANCEL_SETUP);
			}
		}

		let developmentUrlAnswer = null;

		if (commandArguments && commandArguments.development) {
			developmentUrlAnswer = await prompt([
				{
					type: CommandUtils.INQUIRER_TYPES.INPUT,
					name: ANSWERS.DEVELOPMENT_URL,
					message: TranslationService.getMessage(QUESTIONS.DEVELOPMENT_URL),
					filter: answer => answer.trim(),
					validate: fieldValue =>
						showValidationResults(fieldValue, validateFieldIsNotEmpty),
				},
			]);
		}

		const credentialsAnswers = await prompt([
			{
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: ANSWERS.EMAIL,
				message: TranslationService.getMessage(QUESTIONS.EMAIL),
				filter: answer => answer.trim(),
				validate: fieldValue =>
					showValidationResults(fieldValue, validateFieldIsNotEmpty, validateEmail),
			},
			{
				type: CommandUtils.INQUIRER_TYPES.PASSWORD,
				name: ANSWERS.PASSWORD,
				message: TranslationService.getMessage(QUESTIONS.PASSWORD),
				filter: answer => answer.trim(),
				validate: fieldValue => showValidationResults(fieldValue, validateFieldIsNotEmpty),
			},
		]);

		const baseAddress = this._getBaseAddress(developmentUrlAnswer);

		const accountAndRolesJSON = await executeWithSpinner({
			action: this._accountService.getAccountAndRoles({
				...credentialsAnswers,
				restRolesUrl: `${baseAddress}${REST_ROLES_URL}`,
			}),
			message: TranslationService.getMessage(MESSAGES.RETRIEVING_ACCOUNT_INFO),
		});

		const accountAndRoles = JSON.parse(accountAndRolesJSON);

		// compact all the previous info grouped by accountId's
		const accountsInfo = accountAndRoles.reduce((accumulator, current) => {
			const { account, role, dataCenterURLs } = current;
			if (!accumulator[account.internalId]) {
				accumulator[account.internalId] = {
					...account,
					roles: [role],
					dataCenterURLs,
				};
			} else {
				accumulator[account.internalId].roles.push(role);
			}
			return accumulator;
		}, {});

		const companiesChoices = Object.values(accountsInfo).map(company => ({
			name: `${company.name} - [${company.roles.map(role => role.name).join(', ')}]`,
			value: company.internalId,
		}));

		const accountAndRoleAnswers = await prompt([
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: ANSWERS.COMPANY_ID,
				message: TranslationService.getMessage(QUESTIONS.COMPANY_ID),
				choices: [...companiesChoices, new inquirer.Separator()],
			},
			{
				when: response => accountsInfo[response[ANSWERS.COMPANY_ID]].roles.length > 1,
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: ANSWERS.ROLE_ID,
				message: TranslationService.getMessage(QUESTIONS.ROLE),
				choices: response => [
					...accountsInfo[response[ANSWERS.COMPANY_ID]].roles.map(role => ({
						name: role.name,
						value: role.internalId,
					})),
				],
			},
		]);

		const selectedAccountId = accountAndRoleAnswers[ANSWERS.COMPANY_ID];

		if (!(accountsInfo[selectedAccountId].roles.length > 1)) {
			accountAndRoleAnswers[ANSWERS.ROLE_ID] =
				accountsInfo[selectedAccountId].roles[0].internalId;
		}
		const selectedRoleId = accountAndRoleAnswers[ANSWERS.ROLE_ID];

		const issueOrSaveTokenAnswers = await prompt([
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: ANSWERS.ISSUE_A_TOKEN,
				message: TranslationService.getMessage(
					QUESTIONS.ISSUE_A_TOKEN,
					LINKS.HOW_TO.ISSUE_A_TOKEN
				),
				choices: [
					{
						name: TranslationService.getMessage(QUESTIONS.ISSUE_TOKEN_OPTION),
						value: true,
					},
					{
						name: TranslationService.getMessage(QUESTIONS.SAVE_TOKEN_OPTION),
						value: false,
					},
				],
			},
			{
				when: response => !response[ANSWERS.ISSUE_A_TOKEN],
				type: CommandUtils.INQUIRER_TYPES.PASSWORD,
				mask: CommandUtils.INQUIRER_TYPES.PASSWORD_MASK,
				name: ANSWERS.SAVE_TOKEN_ID,
				message: TranslationService.getMessage(QUESTIONS.SAVE_TOKEN_ID),
				filter: fieldValue => fieldValue.trim(),
				validate: fieldValue => showValidationResults(fieldValue, validateFieldIsNotEmpty),
			},
			{
				when: response => !response[ANSWERS.ISSUE_A_TOKEN],
				type: CommandUtils.INQUIRER_TYPES.PASSWORD,
				mask: CommandUtils.INQUIRER_TYPES.PASSWORD_MASK,
				name: ANSWERS.SAVE_TOKEN_SECRET,
				message: TranslationService.getMessage(QUESTIONS.SAVE_TOKEN_SECRET),
				filter: fieldValue => fieldValue.trim(),
				validate: fieldValue => showValidationResults(fieldValue, validateFieldIsNotEmpty),
			},
		]);

		return {
			email: credentialsAnswers[ANSWERS.EMAIL],
			password: credentialsAnswers[ANSWERS.PASSWORD],
			account: selectedAccountId,
			accountName: accountsInfo[selectedAccountId].name,
			environment: accountsInfo[selectedAccountId].dataCenterURLs.systemDomain.split('//')[1],
			role: selectedRoleId,
			roleName: accountsInfo[selectedAccountId].roles.find(
				role => role.internalId === selectedRoleId
			).name,
			...issueOrSaveTokenAnswers,
		};
	}

	_getBaseAddress(developmentUrlAnswer) {
		return developmentUrlAnswer
			? developmentUrlAnswer[ANSWERS.DEVELOPMENT_URL]
			: PROD_ENVIRONMENT_ADDRESS;
	}

	_checkWorkingDirectoryContainsValidProject() {
		if (!FileUtils.exists(path.join(this._projectFolder, MANIFEST_XML))) {
			throw TranslationService.getMessage(
				ERRORS.NOT_PROJECT_FOLDER,
				MANIFEST_XML,
				this._projectFolder
			);
		}
	}

	_accountDetailsFileExists() {
		return FileUtils.exists(path.join(this._executionPath, ACCOUNT_DETAILS_FILENAME));
	}

	_issueToken(params) {
		const executionContextForSaveToken = new SDKExecutionContext({
			command: ISSUE_TOKEN_COMMAND,
			showOutput: false,
			params,
		});

		return executeWithSpinner({
			action: this._sdkExecutor.execute(executionContextForSaveToken),
			message: TranslationService.getMessage(MESSAGES.ISSUING_TBA_TOKEN),
		});
	}

	_saveToken(params) {
		const executionContextForSaveToken = new SDKExecutionContext({
			command: SAVE_TOKEN_COMMAND,
			showOutput: false,
			params,
		});

		return executeWithSpinner({
			action: this._sdkExecutor.execute(executionContextForSaveToken),
			message: TranslationService.getMessage(MESSAGES.SAVING_TBA_TOKEN),
		});
	}

	async _executeAction(answers) {
		const contextValues = {
			netsuiteUrl: answers.environment,
			accountId: answers.account,
			accountName: answers.accountName,
			roleId: answers.role,
			roleName: answers.roleName,
			email: answers.email,
			password: answers.password,
		};
		const newAccountDetails = AccountDetails.fromJson(contextValues);

		let operationResult;
		const accountParams = {
			url: answers.environment,
			email: answers.email,
			account: answers.account,
			role: answers.role,
		};

		if (answers[ANSWERS.ISSUE_A_TOKEN]) {
			operationResult = await this._issueToken({
				...accountParams,
				password: answers.password,
			});
		} else {
			operationResult = await this._saveToken({
				...accountParams,
				tokenid: answers[ANSWERS.SAVE_TOKEN_ID],
				tokensecret: answers[ANSWERS.SAVE_TOKEN_SECRET],
			});
		}

		if (SDKOperationResultUtils.hasErrors(operationResult)) {
			const errorMessage = SDKOperationResultUtils.getResultMessage(operationResult);
			if (errorMessage) {
				throw errorMessage;
			}
			throw SDKOperationResultUtils.getErrorMessagesString(operationResult);
		}

		this._accountDetailsService.save(newAccountDetails);

		return operationResult;
	}

	_formatOutput(operationResult) {
		SDKOperationResultUtils.logResultMessage(operationResult);
		NodeUtils.println(
			TranslationService.getMessage(OUTPUT.SUCCESSFUL),
			NodeUtils.COLORS.RESULT
		);
	}
};
