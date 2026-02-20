/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const loadLoggerFontFormatter = async () => {
	const { COLORS, BOLD } = await import('../../../loggers/LoggerFontFormatter.mjs');
	return { COLORS, BOLD };
};
const fontFormatterPromise = loadLoggerFontFormatter();
const { default : { prompt, Separator } } = require('inquirer');
const BaseInputHandler = require('../../base/BaseInputHandler');
const CommandUtils = require('../../../utils/CommandUtils');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const { getAuthIds } = require('../../../utils/AuthenticationUtils');
const { validateBrowserBasedAuthIsAllowed } = require('../../../services/ExecutionContextService');
const {
	DOMAIN
} = require('../../../ApplicationConstants');
const ProjectInfoService = require('../../../services/ProjectInfoService');

const {
	COMMAND_SETUPACCOUNT: { QUESTIONS, QUESTIONS_CHOICES, MESSAGES }
} = require('../../../services/TranslationKeys');

const {
	validateFieldHasNoSpaces,
	validateFieldIsNotEmpty,
	validateAuthIDNotInList,
	validateAlphanumericHyphenUnderscore,
	validateMaximumLength,
	showValidationResults,
} = require('../../../validation/InteractiveAnswersValidator');

const ANSWERS = {
	SELECTED_AUTH_ID: 'selected_auth_id',
	AUTH_MODE: 'AUTH_MODE',
	NEW_AUTH_ID: 'NEW_AUTH_ID',
	URL: 'url',
};

const AUTH_MODE = {
	OAUTH: 'OAUTH',
	REUSE: 'REUSE',
};

const CREATE_NEW_AUTH = '******CREATE_NEW_AUTH*******!£$%&*';

module.exports = class SetupInputHandler extends BaseInputHandler {
	constructor(options) {
		super(options);
		this._projectInfoService = new ProjectInfoService(this._projectFolder);
	}

	async getParameters(params) {
		this._projectInfoService.checkWorkingDirectoryContainsValidProject(this._commandMetadata.name);
		validateBrowserBasedAuthIsAllowed();
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
				name: (await fontFormatterPromise).BOLD(NodeTranslationService.getMessage(QUESTIONS_CHOICES.SELECT_AUTHID.NEW_AUTH_ID)),
				value: CREATE_NEW_AUTH,
			});
			choices.push(new Separator());
			choices.push(new Separator(NodeTranslationService.getMessage(MESSAGES.SELECT_CONFIGURED_AUTHID)));
			authIDs.forEach((authID) => {
				const accountCredentials = authIDActionResult.data[authID];
				// just fixed the isNotProductionUrl because of new credentials format, but the previous version was always false
				// TODO: review if we want to show non-production urls on the list of selectable authIds
				const isNotProductionUrl =
					accountCredentials.hostInfo &&
					accountCredentials.hostInfo.hostName &&
					!accountCredentials.hostInfo.hostName.match(DOMAIN.PRODUCTION.PRODUCTION_DOMAIN_REGEX) &&
					!accountCredentials.hostInfo.hostName.match(DOMAIN.PRODUCTION.PRODUCTION_ACCOUNT_SPECIFIC_DOMAIN_REGEX);
				const notProductionLabel = isNotProductionUrl
					? NodeTranslationService.getMessage(
						QUESTIONS_CHOICES.SELECT_AUTHID.EXISTING_AUTH_ID_URL_NOT_PRODUCTION,
						accountCredentials.hostInfo.hostName
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
		const newAuthenticationAnswers = await prompt([
			{
				when: params && params.dev !== undefined && params.dev,
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: ANSWERS.URL,
				message: NodeTranslationService.getMessage(QUESTIONS.URL),
				filter: (fieldValue) => fieldValue.trim(),
				validate: (fieldValue) => showValidationResults(fieldValue.trim(), validateFieldIsNotEmpty, validateFieldHasNoSpaces),

			},
			{
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: ANSWERS.NEW_AUTH_ID,
				message: NodeTranslationService.getMessage(QUESTIONS.NEW_AUTH_ID),
				filter: (answer) => answer.trim(),
				validate: (fieldValue) =>
					showValidationResults(
						fieldValue.trim(),
						validateFieldIsNotEmpty,
						validateFieldHasNoSpaces,
						(fieldValue) => validateAuthIDNotInList(fieldValue.trim(), Object.keys(authIDActionResult.data)),
						validateAlphanumericHyphenUnderscore,
						validateMaximumLength
					),
			},
		]);

		const executeActionContext = {
			createNewAuthentication: true,
			authid: newAuthenticationAnswers[ANSWERS.NEW_AUTH_ID],
			mode: AUTH_MODE.OAUTH,
			...(newAuthenticationAnswers[ANSWERS.URL] && { url: newAuthenticationAnswers[ANSWERS.URL] })
		};

		return executeActionContext;
	}
};
