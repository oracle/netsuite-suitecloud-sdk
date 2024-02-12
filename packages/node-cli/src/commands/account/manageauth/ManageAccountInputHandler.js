/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseInputHandler = require('../../base/BaseInputHandler');
const CommandUtils = require('../../../utils/CommandUtils');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const AccountCredentialsFormatter = require('../../../utils/AccountCredentialsFormatter');
const { getAuthIds } = require('../../../utils/AuthenticationUtils');
const { MANAGE_ACTION } = require('../../../services/actionresult/ManageAccountActionResult');
const { DOMAIN } = require('../../../ApplicationConstants');
const { prompt, Separator } = require('inquirer');
const {
	showValidationResults,
	validateAuthIDNotInList,
	validateAlphanumericHyphenUnderscore,
	validateFieldHasNoSpaces,
	validateFieldIsNotEmpty,
	validateMaximumLength,
	validateSameAuthID,
} = require('../../../validation/InteractiveAnswersValidator');

const {
	COMMAND_MANAGE_ACCOUNT: { QUESTIONS, QUESTIONS_CHOICES, MESSAGES, ERRORS },
	YES,
	NO,
} = require('../../../services/TranslationKeys');

const COMMAND = {
	OPTIONS: {
		INFO: 'info',
		LIST: 'list',
		REMOVE: 'remove',
		RENAME: 'rename',
		RENAMETO: 'renameto',
	},
};

const ANSWERS_NAMES = {
	SELECTED_AUTH_ID: 'selected_auth_id',
	ACTION: 'action',
	AUTHID: 'authId',
	RENAMETO: 'renameto',
	REMOVE: 'remove',
};

module.exports = class ManageAccountInputHandler extends BaseInputHandler {
	constructor(options) {
		super(options);
	}

	async getParameters(params) {
		if (!this._runInInteractiveMode) {
			return params;
		}
		let answers;
		const authIDActionResult = await getAuthIds(this._sdkPath);
		if (!authIDActionResult.isSuccess()) {
			throw authIDActionResult.errorMessages;
		}
		answers = await this._selectAuthID(authIDActionResult.data, prompt);
		this._log.info(AccountCredentialsFormatter.getInfoString(answers[ANSWERS_NAMES.SELECTED_AUTH_ID]));
		const selectedAuthID = answers[ANSWERS_NAMES.SELECTED_AUTH_ID].authId;
		answers[ANSWERS_NAMES.ACTION] = await this._selectAction(prompt);
		if (answers[ANSWERS_NAMES.ACTION] == MANAGE_ACTION.RENAME) {
			answers[ANSWERS_NAMES.RENAMETO] = await this._introduceNewName(prompt, authIDActionResult.data, selectedAuthID);
		} else if (answers[ANSWERS_NAMES.ACTION] == MANAGE_ACTION.REMOVE) {
			answers[ANSWERS_NAMES.REMOVE] = await this._confirmRemove(prompt);
		}

		return this._extractAnswers(answers);
	}

	_logAccountInfo(selectedAuthId) {
		const accountInfo = selectedAuthId.accountInfo;
		this._log.info(NodeTranslationService.getMessage(MESSAGES.ACCOUNT_INFO.AUTHID, selectedAuthId.authId));
		this._log.info(NodeTranslationService.getMessage(MESSAGES.ACCOUNT_INFO.ACCOUNT_NAME, accountInfo.companyName));
		this._log.info(NodeTranslationService.getMessage(MESSAGES.ACCOUNT_INFO.ACCOUNT_ID, accountInfo.companyId));
		this._log.info(NodeTranslationService.getMessage(MESSAGES.ACCOUNT_INFO.ROLE, accountInfo.roleName));
		this._log.info(NodeTranslationService.getMessage(MESSAGES.ACCOUNT_INFO.DOMAIN, accountInfo.roleName));
		this._log.info(NodeTranslationService.getMessage(MESSAGES.ACCOUNT_INFO.ACCOUNT_TYPE, accountInfo.roleName));
	}

	_accountCredentialToString(authID, accountCredential) {
		const urlInfo =
			accountCredential.urls &&
			!accountCredential.urls.app.match(DOMAIN.PRODUCTION.PRODUCTION_DOMAIN_REGEX) &&
			!accountCredential.urls.app.match(DOMAIN.PRODUCTION.PRODUCTION_ACCOUNT_SPECIFIC_DOMAIN_REGEX)
				? NodeTranslationService.getMessage(QUESTIONS_CHOICES.SELECT_AUTHID.EXISTING_AUTH_ID_URL_NOT_PRODUCTION, accountCredential.urls.app)
				: '';
		const accountInfo = `${accountCredential.accountInfo.roleName} @ ${accountCredential.accountInfo.companyName}`;
		const accountCredentialString = NodeTranslationService.getMessage(
			QUESTIONS_CHOICES.SELECT_AUTHID.EXISTING_AUTH_ID,
			authID,
			accountInfo,
			urlInfo
		);
		return accountCredentialString;
	}

	async _selectAuthID(authIDList, prompt) {
		var authIDs = Object.entries(authIDList).sort();
		if (authIDs.length <= 0) {
			throw NodeTranslationService.getMessage(ERRORS.CREDENTIALS_EMPTY);
		}
		const choices = [];
		authIDs.forEach((authIDArray) => {
			const authID = authIDArray[0];
			const accountCredential = authIDArray[1];
			const accountCredentialString = this._accountCredentialToString(authID, accountCredential);
			choices.push({
				name: accountCredentialString,
				value: { authId: authID, accountInfo: accountCredential.accountInfo, domain: accountCredential.urls.app },
			});
		});
		choices.push(new Separator());
		let answers = await prompt([
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: ANSWERS_NAMES.SELECTED_AUTH_ID,
				message: NodeTranslationService.getMessage(QUESTIONS.SELECT_CREDENTIALS),
				choices: choices,
			},
		]);
		return answers;
	}

	async _selectAction(prompt) {
		let answer = await prompt({
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: ANSWERS_NAMES.ACTION,
			message: NodeTranslationService.getMessage(QUESTIONS.SELECT_ACTION),
			choices: [
				{
					name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.ACTIONS.RENAME),
					value: MANAGE_ACTION.RENAME,
				},
				{
					name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.ACTIONS.REMOVE),
					value: MANAGE_ACTION.REMOVE,
				},
				{
					name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.ACTIONS.EXIT),
					value: MANAGE_ACTION.EXIT,
				},
			],
		});

		if (answer[ANSWERS_NAMES.ACTION] == MANAGE_ACTION.EXIT) {
			throw NodeTranslationService.getMessage(MESSAGES.CANCEL);
		}

		return answer[ANSWERS_NAMES.ACTION];
	}

	async _introduceNewName(prompt, authIDMap, originalAuthId) {
		let answer = await prompt({
			type: CommandUtils.INQUIRER_TYPES.INPUT,
			name: ANSWERS_NAMES.RENAMETO,
			message: NodeTranslationService.getMessage(QUESTIONS.NEW_NAME),
			filter: (fieldValue) => fieldValue.trim(),
			validate: (fieldValue) =>
				showValidationResults(
					fieldValue,
					validateFieldIsNotEmpty,
					validateFieldHasNoSpaces,
					(fieldValue) => validateSameAuthID(fieldValue, originalAuthId),
					(fieldValue) => validateAuthIDNotInList(fieldValue, Object.keys(authIDMap)),
					validateAlphanumericHyphenUnderscore,
					validateMaximumLength
				),
		});
		return answer[ANSWERS_NAMES.RENAMETO];
	}

	async _confirmRemove(prompt) {
		let answer = await prompt([
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: ANSWERS_NAMES.REMOVE,
				message: NodeTranslationService.getMessage(QUESTIONS.VERIFY_REMOVE),
				default: false,
				choices: [
					{ name: NodeTranslationService.getMessage(YES), value: true },
					{ name: NodeTranslationService.getMessage(NO), value: false },
				],
			},
		]);
		if (!answer[ANSWERS_NAMES.REMOVE]) {
			throw NodeTranslationService.getMessage(MESSAGES.CANCEL);
		}
		return answer[ANSWERS_NAMES.REMOVE];
	}

	_extractAnswers(answers) {
		if (answers[ANSWERS_NAMES.ACTION] == MANAGE_ACTION.RENAME) {
			return {
				[COMMAND.OPTIONS.RENAME]: answers[ANSWERS_NAMES.SELECTED_AUTH_ID].authId,
				[COMMAND.OPTIONS.RENAMETO]: answers[ANSWERS_NAMES.RENAMETO],
			};
		} else if (answers[ANSWERS_NAMES.ACTION] == MANAGE_ACTION.REMOVE) {
			return {
				[COMMAND.OPTIONS.REMOVE]: answers[ANSWERS_NAMES.SELECTED_AUTH_ID].authId,
			};
		}
	}
};
