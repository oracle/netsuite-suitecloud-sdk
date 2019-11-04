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
const SAVE_TOKEN_COMMAND = 'savetoken';

const {
	FILE_NAMES: { MANIFEST_XML },
	PROD_ENVIRONMENT_ADDRESS,
	HTTP_PROTOCOL,
} = require('../ApplicationConstants');

const {
	COMMAND_SETUPACCOUNT: { ERRORS, QUESTIONS, MESSAGES, OUTPUT },
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
	validateDevUrl,
	validateFieldIsNotEmpty,
	validateNotProductionUrl,
	showValidationResults,
} = require('../validation/InteractiveAnswersValidator');

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
			command: 'manageauth',
			flags: ['list'],
		});

		const existingAuthenticationsResponse = await executeWithSpinner({
			action: this._sdkExecutor.execute(getAuthListContext),
			message: 'Getting list of available authentication IDs configured in this machine',
		});

		const choices = [
			{
				name:
					chalk.bold('New authentication') +
					' - Do not reuse an existing authentication and setup a new one.',
				value: 'NEW_AUTH',
			},
			new inquirer.Separator(),
		];
		Object.keys(existingAuthenticationsResponse.data).forEach(function(key, index) {
			const authentication = existingAuthenticationsResponse.data[key];
			const isDevLabel = authentication.isDev ? `[DEV: ${authentication.urls.app}]` : '';
			choices.push({
				name: `${key} - ${authentication.accountId} ${isDevLabel}`,
				value: key,
			});
		});

		const authIdAnswer = await prompt([
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: 'AUTH_ID',
				message: 'Do you want to use an existing authentication ID for this project?',
				choices: choices,
			},
		]);
		let newAuthenticationModeAnswers;
		if (authIdAnswer['AUTH_ID'] !== 'NEW_AUTH') {
			return {
				createNewAuthentication: false,
				existingAuthId: authIdAnswer['AUTH_ID'],
				mode: 'REUSE',
			};
		}
		if (authIdAnswer['AUTH_ID'] === 'NEW_AUTH') {
			if (isDevelopment) {
				developmentUrlAnswer = await prompt([
					{
						type: CommandUtils.INQUIRER_TYPES.INPUT,
						name: ANSWERS.DEVELOPMENT_URL,
						message: TranslationService.getMessage(QUESTIONS.DEVELOPMENT_URL),
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
			newAuthenticationModeAnswers = await prompt([
				{
					type: CommandUtils.INQUIRER_TYPES.LIST,
					name: 'AUTH_MODE',
					message: 'Please select the authentication mode.',
					choices: [
						{
							name: 'Browser-based authentication.',
							value: 'OAUTH',
						},
						{
							name: TranslationService.getMessage(QUESTIONS.SAVE_TOKEN_OPTION),
							value: 'SAVE',
						},
					],
				},
				{
					type: CommandUtils.INQUIRER_TYPES.INPUT,
					name: 'NEW_AUTH_ID',
					message: 'Please specify an AuthID for the new authentication.',
					filter: answer => answer.trim(),
				},
				{
					when: response => response['AUTH_MODE'] === 'SAVE',
					type: CommandUtils.INQUIRER_TYPES.PASSWORD,
					mask: CommandUtils.INQUIRER_TYPES.PASSWORD_MASK,
					name: ANSWERS.SAVE_TOKEN_ID,
					message: TranslationService.getMessage(QUESTIONS.SAVE_TOKEN_ID),
					filter: fieldValue => fieldValue.trim(),
					validate: fieldValue =>
						showValidationResults(fieldValue, validateFieldIsNotEmpty),
				},
				{
					when: response => response['AUTH_MODE'] === 'SAVE',
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
				newAuthId: newAuthenticationModeAnswers['NEW_AUTH_ID'],
				url: developmentUrlAnswer ? developmentUrlAnswer.developmentUrl : null,
				mode: newAuthenticationModeAnswers['AUTH_MODE'],
				saveToken: {
					id: newAuthenticationModeAnswers[ANSWERS.SAVE_TOKEN_ID],
					secret: newAuthenticationModeAnswers[ANSWERS.SAVE_TOKEN_SECRET],
				},
			};
		}
	}

	_getBaseAddress(developmentUrlAnswer) {
		return developmentUrlAnswer
			? `${HTTP_PROTOCOL}${developmentUrlAnswer[ANSWERS.DEVELOPMENT_URL]}`
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

	async _executeAction(answers) {
		let authId;
		if (answers.mode === 'OAUTH') {
			await this._performBrowserBasedAuthentication({
				authId: answers.newAuthId,
				url: answers.url,
			});
			authId = answers.newAuthId;
		}
		if (answers.mode === 'SAVE') {
			await this._saveToken({
				authId: answers.newAuthId,
				tokenid: answers[ANSWERS.SAVE_TOKEN_ID],
				tokensecret: answers[ANSWERS.SAVE_TOKEN_SECRET],
				url: url,
				isDev: true,
			});
			authId = answers.newAuthId;
		}
		if (answers.mode === 'REUSE') {
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
			command: 'authenticate',
			params,
		});

		const operationResult = await executeWithSpinner({
			action: this._sdkExecutor.execute(authenticateSDKExecutionContext),
			message: 'Performing browser-based authentication. Please check your browser',
		});
		this._checkOperationResultIsSuccessful(operationResult);
	}

	async _saveToken(params) {
		const executionContextForSaveToken = new SDKExecutionContext({
			command: SAVE_TOKEN_COMMAND,
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
			case 'OAUTH':
				resultMessage = `Browser-based authentication completed successfully. This project will use the authentication with AuthId '${operationResult.authId}' as default`;
				break;
			case 'SAVE':
				resultMessage = `Token saved successfully. This project will use the authentication with AuthId '${operationResult.authId}' as default`;
				break;
			case 'REUSE':
				resultMessage = `This project will use the authentication with AuthId '${operationResult.authId}' as default`;
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
