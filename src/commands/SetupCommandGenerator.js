/*
 ** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const chalk = require('chalk');
const path = require('path');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const SDKExecutionContext = require('../SDKExecutionContext');
const { executeWithSpinner } = require('../ui/CliSpinner');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const NodeUtils = require('../utils/NodeUtils');
const FileUtils = require('../utils/FileUtils');
const CommandUtils = require('../utils/CommandUtils');
const TranslationService = require('../services/TranslationService');
const AuthenticationService = require('./../core/authentication/AuthenticationService');
const OperationResultStatus = require('./OperationResultStatus');

const inquirer = require('inquirer');

const {
	FILE_NAMES: { MANIFEST_XML },
} = require('../ApplicationConstants');

const {
	COMMAND_SETUPACCOUNT: { ERRORS, QUESTIONS, QUESTIONS_CHOICES, MESSAGES, OUTPUT },
} = require('../services/TranslationKeys');

const ANSWERS = {
	DEVELOPMENT_URL: 'developmentUrl',
	SAVE_TOKEN_ID: 'saveTokenId',
	SAVE_TOKEN_SECRET: 'saveTokenSecret',
	SELECTED_AUTH_ID: 'selected_auth_id',
	AUTH_MODE: 'AUTH_MODE',
	NEW_AUTH_ID: 'NEW_AUTH_ID',
};

const AUTH_MODE = {
	OAUTH: 'OAUTH',
	SAVE_TOKEN: 'SAVE_TOKEN',
	REUSE: 'REUSE',
};

const COMMANDS = {
	AUTHENTICATE: 'authenticate',
	MANAGEAUTH: 'manageauth',
	SAVE_TOKEN: 'savetoken',
};

const {
	validateDevUrl,
	validateFieldHasNoSpaces,
	validateFieldIsNotEmpty,
	validateNotProductionUrl,
	validateAuthIDNotInList,
	validateXMLCharacters,
	showValidationResults,
} = require('../validation/InteractiveAnswersValidator');

const CREATE_NEW_AUTH = '******CREATE_NEW_AUTH*******!£$%&*';

module.exports = class SetupCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._authenticationService = new AuthenticationService();
	}

	async _getCommandQuestions(prompt, commandArguments) {
		this._checkWorkingDirectoryContainsValidProject();
		const isDevelopment =
			commandArguments && commandArguments.dev !== undefined && commandArguments.dev;
		let developmentUrlAnswer;

		const getAuthListContext = new SDKExecutionContext({
			command: COMMANDS.MANAGEAUTH,
			flags: ['list'],
		});

		const existingAuthIDsResponse = await executeWithSpinner({
			action: this._sdkExecutor.execute(getAuthListContext),
			message: TranslationService.getMessage(MESSAGES.GETTING_AVAILABLE_AUTHIDS),
		});

		// Consider that manageauth -list command can fail
		if (SDKOperationResultUtils.hasErrors(existingAuthIDsResponse)) {
			throw SDKOperationResultUtils.getResultMessage(existingAuthIDsResponse);
		}

		let authIdAnswer;
		const choices = [];
		const auhtIDs = Object.keys(existingAuthIDsResponse.data);

		if (auhtIDs.length > 0) {
			// There are already some existing authIDs
			choices.push({
				name: chalk.bold(
					TranslationService.getMessage(QUESTIONS_CHOICES.SELECT_AUTHID.NEW_AUTH_ID)
				),
				value: CREATE_NEW_AUTH,
			});
			choices.push(new inquirer.Separator());
			choices.push(new inquirer.Separator(TranslationService.getMessage(MESSAGES.SELECT_CONFIGURED_AUTHID)));

			auhtIDs.forEach(authID => {
				const authentication = existingAuthIDsResponse.data[authID];
				const isDevLabel = authentication.isDev ? `[DEV: ${authentication.urls.app}]` : '';
				choices.push({
					name: `${authID} - ${authentication.accountId} ${isDevLabel}`,
					value: authID,
				});
			});
			choices.push(new inquirer.Separator());

			authIdAnswer = await prompt([
				{
					type: CommandUtils.INQUIRER_TYPES.LIST,
					name: ANSWERS.SELECTED_AUTH_ID,
					message: TranslationService.getMessage(QUESTIONS.SELECT_AUTHID),
					choices: choices,
				},
			]);
		} else {
			// There was no previous authIDs
			authIdAnswer = {
				[ANSWERS.SELECTED_AUTH_ID]: CREATE_NEW_AUTH,
			};
		}

		const selectedAuthID = authIdAnswer[ANSWERS.SELECTED_AUTH_ID];
		// reusing an already set authID
		if (selectedAuthID !== CREATE_NEW_AUTH) {
			return {
				createNewAuthentication: false,
				existingAuthId: selectedAuthID,
				mode: AUTH_MODE.REUSE,
			};
		}

		// creating a new authID
		if (selectedAuthID === CREATE_NEW_AUTH) {
			if (isDevelopment) {
				developmentUrlAnswer = await prompt([
					{
						type: CommandUtils.INQUIRER_TYPES.INPUT,
						name: ANSWERS.DEVELOPMENT_URL,
						message: TranslationService.getMessage(QUESTIONS.DEVELOPMENT_URL),
						// HARDCODED just for convinience
						default: 'luperez-restricted-tbal-dusa1-001.eng.netsuite.com',
						filter: answer => answer.trim(),
						validate: fieldValue =>
							showValidationResults(
								fieldValue,
								validateFieldIsNotEmpty,
								validateDevUrl,
								validateNotProductionUrl
							),
					},
				]);
			}
			const newAuthenticationAnswers = await prompt([
				{
					type: CommandUtils.INQUIRER_TYPES.LIST,
					name: ANSWERS.AUTH_MODE,
					message: TranslationService.getMessage(QUESTIONS.AUTH_MODE),
					choices: [
						{
							name: TranslationService.getMessage(QUESTIONS_CHOICES.AUTH_MODE.OAUTH),
							value: AUTH_MODE.OAUTH,
						},
						{
							name: TranslationService.getMessage(
								QUESTIONS_CHOICES.AUTH_MODE.SAVE_TOKEN
							),
							value: AUTH_MODE.SAVE_TOKEN,
						},
					],
				},
				{
					type: CommandUtils.INQUIRER_TYPES.INPUT,
					name: ANSWERS.NEW_AUTH_ID,
					message: TranslationService.getMessage(QUESTIONS.NEW_AUTH_ID),
					filter: answer => answer.trim(),
					validate: fieldValue =>
						showValidationResults(
							fieldValue,
							validateFieldIsNotEmpty,
							validateFieldHasNoSpaces,
							validateXMLCharacters,
							fieldValue => validateAuthIDNotInList(fieldValue, auhtIDs)
						),
				},
				{
					when: response => response[ANSWERS.AUTH_MODE] === AUTH_MODE.SAVE_TOKEN,
					type: CommandUtils.INQUIRER_TYPES.PASSWORD,
					mask: CommandUtils.INQUIRER_TYPES.PASSWORD_MASK,
					name: ANSWERS.SAVE_TOKEN_ID,
					message: TranslationService.getMessage(QUESTIONS.SAVE_TOKEN_ID),
					filter: fieldValue => fieldValue.trim(),
					validate: fieldValue =>
						showValidationResults(fieldValue, validateFieldIsNotEmpty),
				},
				{
					when: response => response[ANSWERS.AUTH_MODE] === AUTH_MODE.SAVE_TOKEN,
					type: CommandUtils.INQUIRER_TYPES.PASSWORD,
					mask: CommandUtils.INQUIRER_TYPES.PASSWORD_MASK,
					name: ANSWERS.SAVE_TOKEN_SECRET,
					message: TranslationService.getMessage(QUESTIONS.SAVE_TOKEN_SECRET),
					filter: fieldValue => fieldValue.trim(),
					validate: fieldValue =>
						showValidationResults(fieldValue, validateFieldIsNotEmpty),
				},
			]);

			return {
				isDevelopment: isDevelopment,
				createNewAuthentication: true,
				newAuthId: newAuthenticationAnswers[ANSWERS.NEW_AUTH_ID],
				url: developmentUrlAnswer
					? developmentUrlAnswer[ANSWERS.DEVELOPMENT_URL]
					// HARDCODED to always provide a url even without --dev
					: 'luperez-restricted-tbal-dusa1-001.eng.netsuite.com',
				mode: newAuthenticationAnswers[ANSWERS.AUTH_MODE],
				saveToken: {
					id: newAuthenticationAnswers[ANSWERS.SAVE_TOKEN_ID],
					secret: newAuthenticationAnswers[ANSWERS.SAVE_TOKEN_SECRET],
				},
			};
		}
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

	async _executeAction(answers) {
		let authId;
		if (answers.mode === AUTH_MODE.OAUTH) {
			await this._performBrowserBasedAuthentication({
				authId: answers.newAuthId,
				url: answers.url,
			});
			authId = answers.newAuthId;
		}
		if (answers.mode === AUTH_MODE.SAVE_TOKEN) {
			await this._saveToken({
				authId: answers.newAuthId,
				tokenid: answers[ANSWERS.SAVE_TOKEN_ID],
				tokensecret: answers[ANSWERS.SAVE_TOKEN_SECRET],
				url: url,
				isDev: true,
			});
			authId = answers.newAuthId;
		}
		if (answers.mode === AUTH_MODE.REUSE) {
			authId = answers.existingAuthId;
		}
		this._authenticationService.setDefaultAuthentication(authId);

		return {
			status: OperationResultStatus.SUCCESS,
			mode: answers.mode,
			authId: authId,
		};
	}

	async _performBrowserBasedAuthentication(params) {
		const authenticateSDKExecutionContext = new SDKExecutionContext({
			command: COMMANDS.AUTHENTICATE,
			params,
		});

		const operationResult = await executeWithSpinner({
			action: this._sdkExecutor.execute(authenticateSDKExecutionContext),
			message: TranslationService.getMessage(MESSAGES.STARTING_OAUTH_FLOW),
		});
		this._checkOperationResultIsSuccessful(operationResult);
	}

	async _saveToken(params) {
		const executionContextForSaveToken = new SDKExecutionContext({
			command: COMMANDS.SAVE_TOKEN,
			params,
		});

		const operationResult = await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContextForSaveToken),
			message: TranslationService.getMessage(MESSAGES.SAVING_TBA_TOKEN),
		});
		this._checkOperationResultIsSuccessful(operationResult);
	}

	_formatOutput(operationResult) {
		let resultMessage;
		switch (operationResult.mode) {
			case AUTH_MODE.OAUTH:
				resultMessage = TranslationService.getMessage(OUTPUT.NEW_OAUTH, operationResult.authId);
				break;
			case AUTH_MODE.SAVE_TOKEN:
				resultMessage = TranslationService.getMessage(OUTPUT.NEW_SAVED_TOKEN, operationResult.authId);
				break;
			case AUTH_MODE.REUSE:
				resultMessage = TranslationService.getMessage(OUTPUT.REUSED_AUTH_ID, operationResult.authId);
				break;
			default:
				break;
		}

		NodeUtils.println(resultMessage, NodeUtils.COLORS.RESULT);
		NodeUtils.println(
			TranslationService.getMessage(OUTPUT.SUCCESSFUL),
			NodeUtils.COLORS.RESULT
		);
	}

	_checkOperationResultIsSuccessful(operationResult) {
		if (SDKOperationResultUtils.hasErrors(operationResult)) {
			const errorMessage = SDKOperationResultUtils.getResultMessage(operationResult);
			if (errorMessage) {
				throw errorMessage;
			}
			throw SDKOperationResultUtils.getErrorMessagesString(operationResult);
		}
	}
};
