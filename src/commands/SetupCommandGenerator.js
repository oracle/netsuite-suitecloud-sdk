'use strict';

const path = require('path');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const ApplicationConstants = require('../ApplicationConstants');
const SDKExecutionContext = require('../SDKExecutionContext');
const NodeUtils = require('../utils/NodeUtils');
const FileUtils = require('../utils/FileUtils');
const CryptoUtils = require('../utils/CryptoUtils');
const Context = require('../Context');
const CLIException = require('../CLIException');
const CommandUtils = require('../utils/CommandUtils');
const TranslationService = require('../services/TranslationService');

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
	PASSWORD: 'password'
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

		return prompt([
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: ANSWERS.USE_PRODUCTION_ACCOUNT,
				message: TranslationService.getMessage(QUESTIONS.USE_PRODUCTION_DOMAIN),
				default: 0,
				choices: [
					{ name: TranslationService.getMessage(YES), value: true },
					{ name: TranslationService.getMessage(NO), value: false },
				],
			},
			{
				when: response => !response[ANSWERS.USE_PRODUCTION_ACCOUNT],
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: ANSWERS.DOMAIN_URL,
				message: TranslationService.getMessage(QUESTIONS.DOMAIN_URL),
				filter: ansewer => ansewer.trim(),
				// TODO CREATE URL VALIDATION
				validate: fieldValue => showValidationResults(fieldValue, validateFieldIsNotEmpty),
			},
			{
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: ANSWERS.EMAIL,
				message: TranslationService.getMessage(QUESTIONS.EMAIL),
				filter: ansewer => ansewer.trim(),
				// TODO CREATE EMAIL VALIDATION
				validate: fieldValue => showValidationResults(fieldValue, validateFieldIsNotEmpty),
			},
			{
				type: CommandUtils.INQUIRER_TYPES.PASSWORD,
				name: ANSWERS.PASSWORD,
				message: TranslationService.getMessage(QUESTIONS.PASSWORD),
			},
			{
				type: 'list',
				name: 'authenticationMode',
				message: 'Choose the NS authentication',
				default: ApplicationConstants.AUTHENTICATION_MODE_TBA,
				choices: [
					{
						name: 'Basic',
						value: ApplicationConstants.AUTHENTICATION_MODE_BASIC,
					},
					{
						name: 'Token-based Authentication',
						value: ApplicationConstants.AUTHENTICATION_MODE_TBA,
					},
				],
			},
			{
				type: 'text',
				name: 'account',
				message: 'Enter the Company ID (compId)',
			},
			{
				type: 'text',
				name: 'role',
				default: 3,
				message: 'Enter the Role ID',
			},
		]);
	}

	_accountDetailsFileExists() {
		if (FileUtils.exists(path.join(this._projectFolder, ACCOUNT_DETAILS_FILENAME))) {
			return true;
		}
		return false;
	}

	_checkWorkingDirectoryContainsValidProject() {
		if (!FileUtils.exists(path.join(this._projectFolder, MANIFEST_XML))) {
			throw new CLIException(
				0,
				`Please run setupaccount in a valid folder. Could not find a ${MANIFEST_XML} file in the project folder ${
					this._projectFolder
				}`
			);
		}
	}

	_setupAuthentication(contextValues) {
		return new Promise((resolve, reject) => {
			if (contextValues.authenticationMode === ApplicationConstants.AUTHENTICATION_MODE_TBA) {
				this._issueToken()
					.then(() => resolve())
					.catch(error => {
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
		return this._sdkExecutor.execute(executionContext);
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
		FileUtils.create(ApplicationConstants.ACCOUNT_DETAILS_FILENAME, contextValues);
	}

	_executeAction(answers) {
		return new Promise((resolve, reject) => {
			try {
				this._checkWorkingDirectoryContainsValidProject();
				var encryptionKey = CryptoUtils.generateRandomKey();
				var contextValues = {
					netsuiteUrl: answers.environment,
					compId: answers.account,
					email: answers.email,
					password: CryptoUtils.encrypt(answers.password, encryptionKey),
					roleId: answers.role,
					authenticationMode: answers.authenticationMode,
					encryptionKey: encryptionKey,
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
};
