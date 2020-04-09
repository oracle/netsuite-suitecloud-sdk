/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const chalk = require('chalk');
const path = require('path');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const SetupActionResult = require('../commands/actionresult/SetupActionResult');
const SDKExecutionContext = require('../SDKExecutionContext');
const { executeWithSpinner } = require('../ui/CliSpinner');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const FileUtils = require('../utils/FileUtils');
const CommandUtils = require('../utils/CommandUtils');
const NodeTranslationService = require('../services/NodeTranslationService');
const AuthenticationService = require('./../core/authentication/AuthenticationService');
const SetupOutputFormatter = require('./outputFormatters/SetupOutputFormatter');

const inquirer = require('inquirer');

const {
	FILES: { MANIFEST_XML },
} = require('../ApplicationConstants');

const {
	COMMAND_SETUPACCOUNT: { ERRORS, QUESTIONS, QUESTIONS_CHOICES, MESSAGES },
} = require('../services/TranslationKeys');

const ANSWERS = {
	DEVELOPMENT_MODE_URL: 'developmentModeUrl',
	SELECTED_AUTH_ID: 'selected_auth_id',
	AUTH_MODE: 'AUTH_MODE',
	NEW_AUTH_ID: 'NEW_AUTH_ID',
	SAVE_TOKEN_ACCOUNT_ID: 'accountId',
	SAVE_TOKEN_ID: 'saveTokenId',
	SAVE_TOKEN_SECRET: 'saveTokenSecret',
};

const AUTH_MODE = {
	OAUTH: 'OAUTH',
	SAVE_TOKEN: 'SAVE_TOKEN',
	REUSE: 'REUSE',
};

const COMMANDS = {
	AUTHENTICATE: 'authenticate',
	MANAGEAUTH: 'manageauth',
};

const FLAGS = {
	LIST: 'list',
	SAVETOKEN: 'savetoken',
	DEVELOPMENTMODE: 'developmentmode',
};

const {
	validateFieldHasNoSpaces,
	validateFieldIsNotEmpty,
	validateAuthIDNotInList,
	validateAlphanumericHyphenUnderscore,
	validateMaximumLength,
	showValidationResults,
} = require('../validation/InteractiveAnswersValidator');

const CREATE_NEW_AUTH = '******CREATE_NEW_AUTH*******!£$%&*';

module.exports = class SetupCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._authenticationService = new AuthenticationService(options.executionPath);
		this._outputFormatter = new SetupOutputFormatter(options.consoleLogger);
	}

	async _getCommandQuestions(prompt, commandArguments) {
		this._checkWorkingDirectoryContainsValidProject();

		const getAuthListContext = new SDKExecutionContext({
			command: COMMANDS.MANAGEAUTH,
			flags: [FLAGS.LIST],
		});

		const existingAuthIDsResponse = await executeWithSpinner({
			action: this._sdkExecutor.execute(getAuthListContext),
			message: NodeTranslationService.getMessage(MESSAGES.GETTING_AVAILABLE_AUTHIDS),
		});

		if (existingAuthIDsResponse.status === SDKOperationResultUtils.STATUS.ERROR) {
			throw SDKOperationResultUtils.getResultMessage(existingAuthIDsResponse);
		}

		let authIdAnswer;
		const choices = [];
		const authIDs = Object.keys(existingAuthIDsResponse.data);

		if (authIDs.length > 0) {
			choices.push({
				name: chalk.bold(NodeTranslationService.getMessage(QUESTIONS_CHOICES.SELECT_AUTHID.NEW_AUTH_ID)),
				value: CREATE_NEW_AUTH,
			});
			choices.push(new inquirer.Separator());
			choices.push(new inquirer.Separator(NodeTranslationService.getMessage(MESSAGES.SELECT_CONFIGURED_AUTHID)));

			authIDs.forEach((authID) => {
				const authentication = existingAuthIDsResponse.data[authID];
				const isDevLabel = authentication.developmentMode
					? NodeTranslationService.getMessage(QUESTIONS_CHOICES.SELECT_AUTHID.EXISTING_AUTH_ID_DEV_URL, authentication.urls.app)
					: '';
				const accountInfo = `${authentication.accountInfo.companyName} [${authentication.accountInfo.roleName}]`;
				choices.push({
					name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.SELECT_AUTHID.EXISTING_AUTH_ID, authID, accountInfo, isDevLabel),
					value: { authId: authID, accountInfo: authentication.accountInfo },
				});
			});
			choices.push(new inquirer.Separator());

			authIdAnswer = await prompt([
				{
					type: CommandUtils.INQUIRER_TYPES.LIST,
					name: ANSWERS.SELECTED_AUTH_ID,
					message: NodeTranslationService.getMessage(QUESTIONS.SELECT_AUTHID),
					choices: choices,
				},
			]);
		} else {
			// There was no previous authIDs
			authIdAnswer = {
				[ANSWERS.SELECTED_AUTH_ID]: CREATE_NEW_AUTH,
			};
		}

		const selectedAuth = authIdAnswer[ANSWERS.SELECTED_AUTH_ID];

		if (selectedAuth !== CREATE_NEW_AUTH) {
			// reuse existing authID
			return {
				createNewAuthentication: false,
				authentication: selectedAuth,
				mode: AUTH_MODE.REUSE,
			};
		}

		// creating a new authID
		let developmentModeUrlAnswer;
		if (selectedAuth === CREATE_NEW_AUTH) {
			const developmentMode = commandArguments && commandArguments.dev !== undefined && commandArguments.dev;

			if (developmentMode) {
				developmentModeUrlAnswer = await prompt([
					{
						type: CommandUtils.INQUIRER_TYPES.INPUT,
						name: ANSWERS.DEVELOPMENT_MODE_URL,
						message: NodeTranslationService.getMessage(QUESTIONS.DEVELOPMENT_MODE_URL),
						filter: (answer) => answer.trim(),
						validate: (fieldValue) => showValidationResults(fieldValue, validateFieldIsNotEmpty, validateFieldHasNoSpaces),
					},
				]);
			}
			const newAuthenticationAnswers = await prompt([
				{
					type: CommandUtils.INQUIRER_TYPES.LIST,
					name: ANSWERS.AUTH_MODE,
					message: NodeTranslationService.getMessage(QUESTIONS.AUTH_MODE),
					choices: [
						{
							name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.AUTH_MODE.OAUTH),
							value: AUTH_MODE.OAUTH,
						},
						{
							name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.AUTH_MODE.SAVE_TOKEN),
							value: AUTH_MODE.SAVE_TOKEN,
						},
					],
				},
				{
					type: CommandUtils.INQUIRER_TYPES.INPUT,
					name: ANSWERS.NEW_AUTH_ID,
					message: NodeTranslationService.getMessage(QUESTIONS.NEW_AUTH_ID),
					filter: (answer) => answer.trim(),
					validate: (fieldValue) =>
						showValidationResults(
							fieldValue,
							validateFieldIsNotEmpty,
							validateFieldHasNoSpaces,
							(fieldValue) => validateAuthIDNotInList(fieldValue, authIDs),
							validateAlphanumericHyphenUnderscore,
							validateMaximumLength
						),
				},
				{
					when: (response) => response[ANSWERS.AUTH_MODE] === AUTH_MODE.SAVE_TOKEN,
					type: CommandUtils.INQUIRER_TYPES.INPUT,
					name: ANSWERS.SAVE_TOKEN_ACCOUNT_ID,
					message: NodeTranslationService.getMessage(QUESTIONS.SAVE_TOKEN_ACCOUNT_ID),
					filter: (fieldValue) => fieldValue.trim(),
					validate: (fieldValue) =>
						showValidationResults(fieldValue, validateFieldIsNotEmpty, validateFieldHasNoSpaces, validateAlphanumericHyphenUnderscore),
				},
				{
					when: (response) => response[ANSWERS.AUTH_MODE] === AUTH_MODE.SAVE_TOKEN,
					type: CommandUtils.INQUIRER_TYPES.PASSWORD,
					mask: CommandUtils.INQUIRER_TYPES.PASSWORD_MASK,
					name: ANSWERS.SAVE_TOKEN_ID,
					message: NodeTranslationService.getMessage(QUESTIONS.SAVE_TOKEN_ID),
					filter: (fieldValue) => fieldValue.trim(),
					validate: (fieldValue) => showValidationResults(fieldValue, validateFieldIsNotEmpty),
				},
				{
					when: (response) => response[ANSWERS.AUTH_MODE] === AUTH_MODE.SAVE_TOKEN,
					type: CommandUtils.INQUIRER_TYPES.PASSWORD,
					mask: CommandUtils.INQUIRER_TYPES.PASSWORD_MASK,
					name: ANSWERS.SAVE_TOKEN_SECRET,
					message: NodeTranslationService.getMessage(QUESTIONS.SAVE_TOKEN_SECRET),
					filter: (fieldValue) => fieldValue.trim(),
					validate: (fieldValue) => showValidationResults(fieldValue, validateFieldIsNotEmpty),
				},
			]);

			const executeActionContext = {
				developmentMode: developmentMode,
				createNewAuthentication: true,
				newAuthId: newAuthenticationAnswers[ANSWERS.NEW_AUTH_ID],
				mode: newAuthenticationAnswers[ANSWERS.AUTH_MODE],
				saveToken: {
					account: newAuthenticationAnswers[ANSWERS.SAVE_TOKEN_ACCOUNT_ID],
					tokenId: newAuthenticationAnswers[ANSWERS.SAVE_TOKEN_ID],
					tokenSecret: newAuthenticationAnswers[ANSWERS.SAVE_TOKEN_SECRET],
				},
			};

			if (developmentModeUrlAnswer) {
				executeActionContext.url = developmentModeUrlAnswer[ANSWERS.DEVELOPMENT_MODE_URL];
			}

			return executeActionContext;
		}
	}

	_checkWorkingDirectoryContainsValidProject() {
		if (!FileUtils.exists(path.join(this._projectFolder, MANIFEST_XML))) {
			throw NodeTranslationService.getMessage(ERRORS.NOT_PROJECT_FOLDER, MANIFEST_XML, this._projectFolder);
		}
	}

	async _executeAction(executeActionContext) {
		try {
			let authId;
			let accountInfo;
			if (executeActionContext.mode === AUTH_MODE.OAUTH) {
				const commandParams = {
					authId: executeActionContext.newAuthId,
				};

				if (executeActionContext.url) {
					commandParams.url = executeActionContext.url;
				}

				const operationResult = await this._performBrowserBasedAuthentication(commandParams, executeActionContext.developmentMode);
				if (operationResult.status === SDKOperationResultUtils.STATUS.ERROR) {
					return SetupActionResult.Builder.withErrors(SDKOperationResultUtils.collectErrorMessages(operationResult)).build();
				}
				authId = executeActionContext.newAuthId;
				accountInfo = operationResult.data.accountInfo;
			} else if (executeActionContext.mode === AUTH_MODE.SAVE_TOKEN) {
				const commandParams = {
					authid: executeActionContext.newAuthId,
					account: executeActionContext.saveToken.account,
					tokenid: executeActionContext.saveToken.tokenId,
					tokensecret: executeActionContext.saveToken.tokenSecret,
				};

				if (executeActionContext.url) {
					commandParams.url = executeActionContext.url;
				}

				const operationResult = await this._saveToken(commandParams, executeActionContext.developmentMode);
				if (operationResult.status === SDKOperationResultUtils.STATUS.ERROR) {
					return SetupActionResult.Builder.withErrors(SDKOperationResultUtils.collectErrorMessages(operationResult)).build();
				}
				authId = executeActionContext.newAuthId;
				accountInfo = operationResult.data.accountInfo;
			} else if (executeActionContext.mode === AUTH_MODE.REUSE) {
				authId = executeActionContext.authentication.authId;
				accountInfo = executeActionContext.authentication.accountInfo;
			}
			this._authenticationService.setDefaultAuthentication(authId);

			return SetupActionResult.Builder.success().withMode(executeActionContext.mode).withAuthId(authId).withAccountInfo(accountInfo).build();
		} catch (error) {
			return SetupActionResult.Builder.withErrors([error]).build();
		}
	}

	async _performBrowserBasedAuthentication(params, developmentMode) {
		const executionContextOptions = {
			command: COMMANDS.AUTHENTICATE,
			params,
		};

		if (developmentMode) {
			executionContextOptions.flags = [FLAGS.DEVELOPMENTMODE];
		}

		const authenticateSDKExecutionContext = new SDKExecutionContext(executionContextOptions);

		const operationResult = await executeWithSpinner({
			action: this._sdkExecutor.execute(authenticateSDKExecutionContext),
			message: NodeTranslationService.getMessage(MESSAGES.STARTING_OAUTH_FLOW),
		});
		this._checkOperationResultIsSuccessful(operationResult);

		return operationResult;
	}

	async _saveToken(params, developmentMode) {
		const executionContextOptions = {
			command: COMMANDS.AUTHENTICATE,
			params,
			flags: [FLAGS.SAVETOKEN],
		};

		if (developmentMode) {
			executionContextOptions.flags.push(FLAGS.DEVELOPMENTMODE);
		}

		const executionContext = new SDKExecutionContext(executionContextOptions);

		const operationResult = await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: NodeTranslationService.getMessage(MESSAGES.SAVING_TBA_TOKEN),
		});
		this._checkOperationResultIsSuccessful(operationResult);

		return operationResult;
	}

	_checkOperationResultIsSuccessful(operationResult) {
		if (operationResult.status === SDKOperationResultUtils.STATUS.ERROR) {
			const errorMessage = SDKOperationResultUtils.getResultMessage(operationResult);
			if (errorMessage) {
				throw errorMessage;
			}
			throw SDKOperationResultUtils.collectErrorMessages(operationResult);
		}
	}
};
