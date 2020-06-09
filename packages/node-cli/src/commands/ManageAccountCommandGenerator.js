/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const SdkExecutionContext = require('../SdkExecutionContext');
const { executeWithSpinner } = require('../ui/CliSpinner');
const SdkOperationResultUtils = require('../utils/SdkOperationResultUtils');
const CommandUtils = require('../utils/CommandUtils');
const AccountCredentialsFormatter = require('../utils/AccountCredentialsFormatter');
const NodeTranslationService = require('../services/NodeTranslationService');
const ManageAccountOutputFormatter = require('./outputFormatters/ManageAccountOutputFormatter');
const AuthenticationService = require('../core/authentication/AuthenticationService');
const { ManageAccountActionResult, MANAGE_ACTION } = require('./actionresult/ManageAccountActionResult');
const assert = require('assert');

const inquirer = require('inquirer');

const {
	COMMAND_MANAGE_ACCOUNT: { ERRORS, QUESTIONS, QUESTIONS_CHOICES, MESSAGES },
	YES,
	NO,
} = require('../services/TranslationKeys');

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

const {
	showValidationResults,
	validateAuthIDNotInList,
	validateAlphanumericHyphenUnderscore,
	validateFieldHasNoSpaces,
	validateFieldIsNotEmpty,
	validateMaximumLength,
	validateSameAuthID,
} = require('../validation/InteractiveAnswersValidator');

const DATA_PROPERTIES = {
	ACCOUNT_INFO: 'accountInfo',
	URLS: 'urls',
};

const DOMAIN = 'domain';

module.exports = class ManageAccountCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._authenticationService = new AuthenticationService(options.executionPath);
		this._outputFormatter = new ManageAccountOutputFormatter(options.consoleLogger);
		this._consoleLogger = options.consoleLogger;
		this._accountCredentialsFormatter = new AccountCredentialsFormatter();
	}

	async _getCommandQuestions(prompt) {
		const authIDList = await this._authenticationService.getAuthIds(this._sdkExecutor);
		const answers = await this._selectAuthID(authIDList, prompt);
		this._consoleLogger.info(this._accountCredentialsFormatter.getInfoString(answers[ANSWERS_NAMES.SELECTED_AUTH_ID]));
		const selectedAuthID = answers[ANSWERS_NAMES.SELECTED_AUTH_ID].authId;
		answers[ANSWERS_NAMES.ACTION] = await this._selectAction(prompt);
		if (answers[ANSWERS_NAMES.ACTION] == MANAGE_ACTION.RENAME) {
			answers[ANSWERS_NAMES.RENAMETO] = await this._introduceNewName(prompt, authIDList, selectedAuthID);
		} else if (answers[ANSWERS_NAMES.ACTION] == MANAGE_ACTION.REMOVE) {
			answers[ANSWERS_NAMES.REMOVE] = await this._confirmRemove(prompt);
		}

		return this._extractAnswers(answers);
	}

	async _selectAuthID(authIDList, prompt) {
		const authIDs = Object.entries(authIDList).sort();
		if (authIDs.length <= 0) {
			throw NodeTranslationService.getMessage(ERRORS.CREDENTIALS_EMPTY);
		}
		const choices = [];
		authIDs.forEach((authIDArray) => {
			const authID = authIDArray[0];
			const accountCredential = authIDArray[1];
			const accountCredentialString = this._accountCredentialsFormatter.getListItemString(authID, accountCredential);
			choices.push({
				name: accountCredentialString,
				value: { authId: authID, accountInfo: accountCredential.accountInfo, domain: accountCredential.urls.app },
			});
		});
		choices.push(new inquirer.Separator());
		return prompt([
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: ANSWERS_NAMES.SELECTED_AUTH_ID,
				message: NodeTranslationService.getMessage(MESSAGES.SELECT_CONFIGURED_AUTHID),
				choices: choices,
			},
		]);
	}

	async _selectAction(prompt) {
		const answer = await prompt({
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
		const answer = await prompt({
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
		const answer = await prompt([
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

	async _executeAction(answers) {
		const sdkParams = CommandUtils.extractCommandOptions(answers, this._commandMetadata);
		const flags = [];
		if (answers[COMMAND.OPTIONS.LIST]) {
			flags.push(COMMAND.OPTIONS.LIST);
			delete sdkParams[COMMAND.OPTIONS.LIST];
		}
		const executionContext = new SdkExecutionContext({
			command: this._commandMetadata.sdkCommand,
			params: sdkParams,
			flags,
		});

		const selectedOptions = this._extractSelectedOptions(answers);
		const message = this._getSpinnerMessage(selectedOptions);

		const operationResult = await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: message,
		});

		return operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
			? ManageAccountActionResult.Builder.withData(this._prepareData(selectedOptions, operationResult.data))
					.withResultMessage(operationResult.resultMessage)
					.withExecutedAction(selectedOptions.action)
					.build()
			: ManageAccountActionResult.Builder.withErrors(SdkOperationResultUtils.collectErrorMessages(operationResult)).build();
	}

	_extractSelectedOptions(answers) {
		let action;
		let authId;
		if (answers.hasOwnProperty(COMMAND.OPTIONS.INFO)) {
			action = MANAGE_ACTION.INFO;
			authId = answers[COMMAND.OPTIONS.INFO];
		} else if (answers.hasOwnProperty(COMMAND.OPTIONS.LIST)) {
			action = MANAGE_ACTION.LIST;
		} else if (answers.hasOwnProperty(COMMAND.OPTIONS.REMOVE)) {
			action = MANAGE_ACTION.REMOVE;
			authId = answers[COMMAND.OPTIONS.REMOVE];
		} else if (answers.hasOwnProperty(COMMAND.OPTIONS.RENAME)) {
			action = MANAGE_ACTION.RENAME;
			authId = answers[COMMAND.OPTIONS.RENAME];
		} else {
			assert.fail(NodeTranslationService.getMessage(ERRORS.UNKNOWN_ACTION));
		}
		return {
			action: action,
			...(authId && { authId: authId }),
		};
	}

	_getSpinnerMessage(selectedOptions) {
		switch (selectedOptions.action) {
			case MANAGE_ACTION.REMOVE:
				return NodeTranslationService.getMessage(MESSAGES.REMOVING);
			case MANAGE_ACTION.RENAME:
				return NodeTranslationService.getMessage(MESSAGES.RENAMING);
			case MANAGE_ACTION.LIST:
				return NodeTranslationService.getMessage(MESSAGES.LISTING);
			case MANAGE_ACTION.INFO:
				return NodeTranslationService.getMessage(MESSAGES.INFO, selectedOptions.authId);
		}
		assert.fail(NodeTranslationService.getMessage(ERRORS.UNKNOWN_ACTION));
	}

	_prepareData(selectedOptions, data) {
		if (selectedOptions.action != MANAGE_ACTION.INFO) {
			return data;
		}
		assert(selectedOptions.authId);
		assert(data.hasOwnProperty(DATA_PROPERTIES.ACCOUNT_INFO));
		let actionResultData = { authId: selectedOptions.authId, accountInfo: data.accountInfo };
		if (data.hasOwnProperty(DATA_PROPERTIES.URLS)) {
			actionResultData[DOMAIN] = data.urls.app;
		}
		return actionResultData;
	}
};
