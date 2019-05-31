'use strict';

const path = require('path');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const ApplicationConstants = require('../ApplicationConstants');
const SDKExecutionContext = require('../SDKExecutionContext');
const { executeWithSpinner } = require('../ui/CliSpinner');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const NodeUtils = require('../utils/NodeUtils');
const FileUtils = require('../utils/FileUtils');
const Context = require('../Context');
const CommandUtils = require('../utils/CommandUtils');
const TranslationService = require('../services/TranslationService');
const AccountService = require('../services/AccountService');
const inquirer = require('inquirer');

const ISSUE_TOKEN_COMMAND = 'issuetoken';
const REVOKE_TOKEN_COMMAND = 'revoketoken';

const { ACCOUNT_DETAILS_FILENAME, MANIFEST_XML } = require('../ApplicationConstants');

const {
	COMMAND_SETUP: { ERRORS, QUESTIONS, MESSAGES, OUTPUT },
	NO,
	YES,
} = require('../services/TranslationKeys');

const ANSWERS = {
	OVERWRITE: 'overwrite',
	USE_PRODUCTION_ACCOUNT: 'useProductionAccount',
	DOMAIN_URL: 'domainUrl',
	EMAIL: 'email',
	PASSWORD: 'password',
	COMPANY_ID: 'companyId',
	ROLE_ID: 'roleId',
	TWO_FACTOR_AUTH: 'twoFactorAuth',
};

const {
	validateArrayIsNotEmpty,
	validateScriptId,
	validateSuiteApp,
	validateFieldIsNotEmpty,
	showValidationResults,
} = require('../validation/InteractiveAnswersValidator');

module.exports = class SetupCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
	}

	async _getCommandQuestions(prompt) {
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

		const credentialsAnswers = await prompt([
			// {
			// 	type: CommandUtils.INQUIRER_TYPES.LIST,
			// 	name: ANSWERS.USE_PRODUCTION_ACCOUNT,
			// 	message: TranslationService.getMessage(QUESTIONS.USE_PRODUCTION_DOMAIN),
			// 	default: 0,
			// 	choices: [
			// 		{ name: TranslationService.getMessage(YES), value: true },
			// 		{ name: TranslationService.getMessage(NO), value: false },
			// 	],
			// },
			// {
			// 	when: response => !response[ANSWERS.USE_PRODUCTION_ACCOUNT],
			// 	type: CommandUtils.INQUIRER_TYPES.INPUT,
			// 	name: ANSWERS.DOMAIN_URL,
			// 	message: TranslationService.getMessage(QUESTIONS.DOMAIN_URL),
			// 	filter: ansewer => ansewer.trim(),
			// 	// TODO CREATE URL VALIDATION
			// 	validate: fieldValue => showValidationResults(fieldValue, validateFieldIsNotEmpty),
			// },
			{
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: ANSWERS.EMAIL,
				message: TranslationService.getMessage(QUESTIONS.EMAIL),
				// default: 'drebolleda@netsuite.com',
				filter: ansewer => ansewer.trim(),
				// TODO CREATE EMAIL VALIDATION
				validate: fieldValue => showValidationResults(fieldValue, validateFieldIsNotEmpty),
			},
			{
				type: CommandUtils.INQUIRER_TYPES.PASSWORD,
				name: ANSWERS.PASSWORD,
				message: TranslationService.getMessage(QUESTIONS.PASSWORD),
				filter: ansewer => ansewer.trim(),
				validate: fieldValue => showValidationResults(fieldValue, validateFieldIsNotEmpty),
			},
		]);

		let response;
		try {
			response = await AccountService.getAccountAndRoles(credentialsAnswers);
		} catch (StatusCodeError) {
			const error = JSON.parse(StatusCodeError.error);
			throw error.error.message;
		}
		const accountAndRoles = JSON.parse(response);
		// console.log(accountAndRoles);

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

		console.log(accountsInfo)

		const companiesChoices = Object.values(accountsInfo).map(company => ({
			name: `${company.name}  - [roles: ${company.roles.map(role => role.name)}]`,
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
					new inquirer.Separator(),
				],
			},
		]);

		console.log(accountsInfo[accountAndRoleAnswers[ANSWERS.COMPANY_ID]])
		console.log(accountsInfo[accountAndRoleAnswers[ANSWERS.COMPANY_ID]].roles.length)
		if(!(accountsInfo[accountAndRoleAnswers[ANSWERS.COMPANY_ID]].roles.length > 1)) {
			accountAndRoleAnswers[ANSWERS.ROLE_ID] = accountsInfo[accountAndRoleAnswers[ANSWERS.COMPANY_ID]].roles[0].internalId;
		}

		console.log(accountAndRoleAnswers);

		await prompt([
			{
				type: 'confirm',
				name: 'waiting',
			},
		]);

		const answers = {
			email: credentialsAnswers[ANSWERS.EMAIL],
			password: credentialsAnswers[ANSWERS.PASSWORD],
			environment: 'system.netsuite.com',
			account: accountAndRoleAnswers[ANSWERS.COMPANY_ID],
			role: accountAndRoleAnswers[ANSWERS.ROLE_ID],
			authenticationMode: ApplicationConstants.AUTHENTICATION_MODE_TBA,
		};

		return answers;
	}

	_accountDetailsFileExists() {
		if (FileUtils.exists(path.join(this._projectFolder, ACCOUNT_DETAILS_FILENAME))) {
			return true;
		}
		return false;
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

	_setupAuthentication(contextValues) {
		return new Promise((resolve, reject) => {
			if (contextValues.authenticationMode === ApplicationConstants.AUTHENTICATION_MODE_TBA) {
				this._issueToken()
					.then(response => {
						console.log(response);
						resolve();
					})
					.catch(error => {
						console.log(error);
						reject(`Error issuing token: ${error}`);
					});
			} else if (
				contextValues.authenticationMode ===
					ApplicationConstants.AUTHENTICATION_MODE_BASIC &&
				FileUtils.exists(ApplicationConstants.ACCOUNT_DETAILS_FILENAME)
			) {
				const accountContext = FileUtils.readAsJson(
					ApplicationConstants.ACCOUNT_DETAILS_FILENAME
				);
				if (
					accountContext.authenticationMode ===
					ApplicationConstants.AUTHENTICATION_MODE_TBA
				) {
					this._revokeToken()
						.then(() => resolve())
						.catch(error => {
							reject(`Error revoking old token: ${error}`);
						});
				}
			} else {
				resolve();
			}
		});
	}

	_issueToken() {
		let executionContext = new SDKExecutionContext({
			command: ISSUE_TOKEN_COMMAND,
			showOutput: false,
		});
		this._applyDefaultContextParams(executionContext);
		
		return executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: 'Issuing a token',
		});
	}

	_revokeToken() {
		let executionContext = new SDKExecutionContext({
			command: REVOKE_TOKEN_COMMAND,
			showOutput: false,
		});
		this._applyDefaultContextParams(executionContext);
		return this._sdkExecutor.execute(executionContext);
	}

	_createAccountDetailsFile(contextValues) {
		// delete the password before saving
		delete contextValues[ANSWERS.PASSWORD];
		FileUtils.create(ApplicationConstants.ACCOUNT_DETAILS_FILENAME, contextValues);
	}

	async _executeAction(answers) {
		this._checkWorkingDirectoryContainsValidProject();
		const contextValues = {
			netsuiteUrl: answers.environment,
			compId: answers.account,
			email: answers.email,
			password: answers.password,
			roleId: answers.role,
			authenticationMode: answers.authenticationMode,
		};
		Context.CurrentAccountDetails.initializeFromObj(contextValues);
		
		const issueTokenResult = await this._issueToken()

		if(SDKOperationResultUtils.hasErrors(issueTokenResult)) {
			throw SDKOperationResultUtils.getMessagesString(issueTokenResult);
		}

		this._createAccountDetailsFile(contextValues);

		return issueTokenResult;

		this._setupAuthentication(contextValues);

		return new Promise((resolve, reject) => {
			try {
				this._checkWorkingDirectoryContainsValidProject();
				const contextValues = {
					netsuiteUrl: answers.environment,
					compId: answers.account,
					email: answers.email,
					password: answers.password,
					roleId: answers.role,
					authenticationMode: answers.authenticationMode,
				};
				Context.CurrentAccountDetails.initializeFromObj(contextValues);

				this._setupAuthentication(contextValues)
					.then(() => {
						try {
							this._createAccountDetailsFile(contextValues);
							NodeUtils.println('Context setup correctly', NodeUtils.COLORS.RESULT);
							resolve();
						} catch (error) {
							reject('Error while setting up context');
						}
					})
					.catch(error => reject(error));
			} catch (error) {
				reject(error);
			}
		});
	}

	_formatOutput(operationResult) {
		console.log(operationResult);
	}
};
