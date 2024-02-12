/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { prompt, Separator } = require('inquirer');
const chalk = require('chalk');
const path = require('path');
const BaseInputHandler = require('../../base/BaseInputHandler');
const FileUtils = require('../../../utils/FileUtils');
const CommandUtils = require('../../../utils/CommandUtils');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const SdkExecutor = require('../../../SdkExecutor');
const { getAuthIds } = require('../../../utils/AuthenticationUtils');
const CLIException = require('../../../CLIException');
const {
	DOMAIN,
	FILES: { MANIFEST_XML },
	LINKS: { INFO },
} = require('../../../ApplicationConstants');

const {
	COMMAND_SETUPACCOUNT: { QUESTIONS, QUESTIONS_CHOICES, MESSAGES },
	ERRORS,
} = require('../../../services/TranslationKeys');

const {
	validateFieldHasNoSpaces,
	validateFieldIsNotEmpty,
	validateAuthIDNotInList,
	validateAlphanumericHyphenUnderscore,
	validateMaximumLength,
	showValidationResults,
} = require('../../../validation/InteractiveAnswersValidator');
const { lineBreak } = require('../../../loggers/LoggerConstants');

const ANSWERS = {
	SELECTED_AUTH_ID: 'selected_auth_id',
	AUTH_MODE: 'AUTH_MODE',
	NEW_AUTH_ID: 'NEW_AUTH_ID',
	SAVE_TOKEN_ACCOUNT_ID: 'account',
	SAVE_TOKEN_ID: 'saveTokenId',
	SAVE_TOKEN_SECRET: 'saveTokenSecret',
	URL: 'url',
};

const AUTH_MODE = {
	OAUTH: 'OAUTH',
	SAVE_TOKEN: 'SAVE_TOKEN',
	REUSE: 'REUSE',
};

const CREATE_NEW_AUTH = '******CREATE_NEW_AUTH*******!£$%&*';

module.exports = class SetupInputHandler extends BaseInputHandler {
	constructor(options) {
		super(options);
		// TODO input handlers shouldn't execute actions. rework this
		this._sdkExecutor = new SdkExecutor(this._sdkPath);
	}

	async getParameters(params) {
		this._checkWorkingDirectoryContainsValidProject();

		const authIDActionResult = await getAuthIds(this._sdkPath);
		if (!authIDActionResult.isSuccess()) {
			throw authIDActionResult.errorMessages;
		}
		const selectedAuth = await this.selectAuthIdOption(authIDActionResult);

		if (selectedAuth !== CREATE_NEW_AUTH) {
			return {
				createNewAuthentication: false,
				authentication: selectedAuth,
				mode: AUTH_MODE.REUSE,
			};
		}

		// creating a new authID
		return await this.getParamsCreateNewAuthId(params, authIDActionResult);
	}

	async selectAuthIdOption(authIDActionResult) {
		const choices = [];
		let authIdAnswer;
		let authIDs = Object.keys(authIDActionResult.data);
		if (authIDs.length > 0) {
			choices.push({
				name: chalk.bold(NodeTranslationService.getMessage(QUESTIONS_CHOICES.SELECT_AUTHID.NEW_AUTH_ID)),
				value: CREATE_NEW_AUTH,
			});
			choices.push(new Separator());
			choices.push(new Separator(NodeTranslationService.getMessage(MESSAGES.SELECT_CONFIGURED_AUTHID)));
			authIDs.forEach((authID) => {
				const accountCredentials = authIDActionResult.data[authID];
				const isNotProductionUrl =
					!accountCredentials.urls &&
					!accountCredentials.urls.app.match(DOMAIN.PRODUCTION.PRODUCTION_DOMAIN_REGEX) &&
					!accountCredentials.urls.app.match(DOMAIN.PRODUCTION.PRODUCTION_ACCOUNT_SPECIFIC_DOMAIN_REGEX);
				const notProductionLabel = isNotProductionUrl
					? NodeTranslationService.getMessage(
							QUESTIONS_CHOICES.SELECT_AUTHID.EXISTING_AUTH_ID_URL_NOT_PRODUCTION,
							accountCredentials.urls.app
					  )
					: '';
				const accountInfo = `${accountCredentials.accountInfo.companyName} [${accountCredentials.accountInfo.roleName}]`;
				choices.push({
					name: NodeTranslationService.getMessage(
						QUESTIONS_CHOICES.SELECT_AUTHID.EXISTING_AUTH_ID,
						authID,
						accountInfo,
						notProductionLabel
					),
					value: { authId: authID, accountInfo: accountCredentials.accountInfo },
				});
			});
			choices.push(new Separator());
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
		return authIdAnswer[ANSWERS.SELECTED_AUTH_ID];
	}

	async getParamsCreateNewAuthId(params, authIDActionResult) {
		let urlAnswer;
		if (params && params.dev !== undefined && params.dev) {
			urlAnswer = await prompt([
				{
					type: CommandUtils.INQUIRER_TYPES.INPUT,
					name: ANSWERS.URL,
					message: NodeTranslationService.getMessage(QUESTIONS.URL),
					filter: (fieldValue) => fieldValue.trim(),
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
						(fieldValue) => validateAuthIDNotInList(fieldValue, Object.keys(authIDActionResult.data)),
						validateAlphanumericHyphenUnderscore,
						validateMaximumLength
					),
			},
			{
				when: (response) => response[ANSWERS.AUTH_MODE] === AUTH_MODE.SAVE_TOKEN,
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: ANSWERS.SAVE_TOKEN_ACCOUNT_ID,
				message: NodeTranslationService.getMessage(QUESTIONS.SAVE_TOKEN_ACCOUNT_ID),
				transformer: (answer) => answer.toUpperCase(),
				filter: (fieldValue) => fieldValue.trim().toUpperCase(),
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
			createNewAuthentication: true,
			authid: newAuthenticationAnswers[ANSWERS.NEW_AUTH_ID],
			mode: newAuthenticationAnswers[ANSWERS.AUTH_MODE],
			account: newAuthenticationAnswers[ANSWERS.SAVE_TOKEN_ACCOUNT_ID],
			tokenid: newAuthenticationAnswers[ANSWERS.SAVE_TOKEN_ID],
			tokensecret: newAuthenticationAnswers[ANSWERS.SAVE_TOKEN_SECRET],
		};
		if (urlAnswer) {
			executeActionContext.url = urlAnswer[ANSWERS.URL];
		}
		return executeActionContext;
	}

	_checkWorkingDirectoryContainsValidProject() {
		if (!FileUtils.exists(path.join(this._projectFolder, MANIFEST_XML))) {
			const errorMessage =
				NodeTranslationService.getMessage(ERRORS.NOT_PROJECT_FOLDER, MANIFEST_XML, this._projectFolder, this._commandMetadata.name) +
				lineBreak +
				NodeTranslationService.getMessage(ERRORS.SEE_PROJECT_STRUCTURE, INFO.PROJECT_STRUCTURE);
			throw new CLIException(errorMessage);
		}
	}
};
