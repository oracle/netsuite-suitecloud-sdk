/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const assert = require('assert');
const inquirer = require('inquirer');
const AccountCredentialsFormatter = require('../utils/AccountCredentialsFormatter');
const BaseCommandGenerator = require("./BaseCommandGenerator");
const SdkExecutionContext = require("../SdkExecutionContext");
const { executeWithSpinner } = require("../ui/CliSpinner");
const SdkOperationResultUtils = require("../utils/SdkOperationResultUtils");
const CommandUtils = require("../utils/CommandUtils");
const NodeTranslationService = require("../services/NodeTranslationService");
const ManageAccountOutputFormatter = require("./outputFormatters/ManageAccountOutputFormatter");
const AuthenticationService = require("../services/AuthenticationService");
const { ManageAccountActionResult, MANAGE_ACTION } = require("./actionresult/ManageAccountActionResult");

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
		this._outputFormatter = new ManageAccountOutputFormatter(options.consoleLogger);
		this._consoleLogger = options.consoleLogger;
		this._accountCredentialsFormatter = new AccountCredentialsFormatter();
	}

	async _getCommandQuestions(prompt) {
		const authIDList = await AuthenticationService.getAuthIds(this._sdkPath);
		const answers = await this._selectAuthID(authIDList.data, prompt);
		this._consoleLogger.info(this._accountCredentialsFormatter.getInfoString(answers[ANSWERS_NAMES.SELECTED_AUTH_ID]));
		const selectedAuthID = answers[ANSWERS_NAMES.SELECTED_AUTH_ID].authId;
		answers[ANSWERS_NAMES.ACTION] = await this._selectAction(prompt);
		if (answers[ANSWERS_NAMES.ACTION] == MANAGE_ACTION.RENAME) {
			answers[ANSWERS_NAMES.RENAMETO] = await this._introduceNewName(prompt, authIDList.data, selectedAuthID);
		} else if (answers[ANSWERS_NAMES.ACTION] == MANAGE_ACTION.REMOVE) {
			answers[ANSWERS_NAMES.REMOVE] = await this._confirmRemove(prompt);
		}
         answers[ANSWERS_NAMES.RENAMETO] = await this.introduceNewName(prompt, authIDList.data, selectedAuthID);

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
				// {
				//    name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.ACTIONS.REVOKE),
				//    value: ACTION.REVOKE,
				// },
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

	async _introduceNewName(prompt, authIDList, originalAuthId) {
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
					(fieldValue) => validateAuthIDNotInList(fieldValue, Object.keys(authIDList)),
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
			// } else if (answers[ANSWERS_NAMES.ACTION] == ACTION.REVOKE) {
			//    return {
			//    [COMMAND.OPTIONS.REVOKE]: answers[ANSWERS_NAMES.SELECTED_AUTH_ID].authId,
			// }
		}
	}

	async _executeAction(answers) {
		const sdkParams = CommandUtils.extractCommandOptions(answers, this._commandMetadata);
		const flags = [];
		if (answers[COMMAND.OPTIONS.LIST]) {
			flags.push(COMMAND.OPTIONS.LIST);
			delete sdkParams[COMMAND.OPTIONS.LIST];
		}
		const executionContext = SdkExecutionContext.Builder.forCommand(this._commandMetadata.sdkCommand)
			.integration()
         	.addParams(sdkParams)
			.addFlags(flags)
         	.build();

		const selectedAction = this._extractExecutedAction(answers);
		const authId = this._extractAuthId(answers);
		const message = this._getSpinnerMessage(selectedAction, authId);

		const operationResult = await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: message,
		});

		return operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
			? ManageAccountActionResult.Builder.withData(this._prepareData(selectedAction, operationResult.data))
					.withResultMessage(operationResult.resultMessage)
					.withExecutedAction(selectedAction)
					.build()
			: ManageAccountActionResult.Builder.withErrors(SdkOperationResultUtils.collectErrorMessages(operationResult)).build();
	}

	_getSpinnerMessage(action, authId) {
		switch (action) {
			case MANAGE_ACTION.REMOVE:
				return NodeTranslationService.getMessage(MESSAGES.REMOVING);
			case MANAGE_ACTION.RENAME:
				return NodeTranslationService.getMessage(MESSAGES.RENAMING);
			case MANAGE_ACTION.LIST:
				return NodeTranslationService.getMessage(MESSAGES.LISTING);
			case MANAGE_ACTION.REVOKE:
				return NodeTranslationService.getMessage(MESSAGES.REVOKING);
			case MANAGE_ACTION.INFO:
				return NodeTranslationService.getMessage(MESSAGES.INFO, authId);
		}
		assert.fail(NodeTranslationService.getMessage(ERRORS.UNKNOWN_ACTION));
	}

	_prepareData(action, data) {
		if (action != MANAGE_ACTION.INFO) {
			return data;
		}
		assert(this._authId);
		assert(data.hasOwnProperty(DATA_PROPERTIES.ACCOUNT_INFO));
		let actionResultData = { authId: this._authId, accountInfo: data.accountInfo };
		if (data.hasOwnProperty(DATA_PROPERTIES.URLS)) {
			actionResultData[DOMAIN] = data.urls.app;
		}
		return actionResultData;
	}

	_extractExecutedAction(answers) {
		if (answers.hasOwnProperty(COMMAND.OPTIONS.INFO)) {
			this._authId = answers[COMMAND.OPTIONS.INFO];
			return MANAGE_ACTION.INFO;
		}
		if (answers.hasOwnProperty(COMMAND.OPTIONS.LIST)) {
			return MANAGE_ACTION.LIST;
		}
		if (answers.hasOwnProperty(COMMAND.OPTIONS.REMOVE)) {
			return MANAGE_ACTION.REMOVE;
		}
		if (answers.hasOwnProperty(COMMAND.OPTIONS.RENAME)) {
			return MANAGE_ACTION.RENAME;
		}
		// if (answers.hasOwnProperty(COMMAND.OPTIONS.REVOKE)) {
		//    return ACTION.REVOKE;
		// }
		assert.fail(NodeTranslationService.getMessage(ERRORS.UNKNOWN_ACTION));
	}

	_extractAuthId(answers) {
		if (answers.hasOwnProperty(COMMAND.OPTIONS.INFO)) {
			return answers[COMMAND.OPTIONS.INFO];
		}
		if (answers.hasOwnProperty(COMMAND.OPTIONS.LIST)) {
			return;
		}
		if (answers.hasOwnProperty(COMMAND.OPTIONS.REMOVE)) {
			return answers[COMMAND.OPTIONS.REMOVE];
		}
		if (answers.hasOwnProperty(COMMAND.OPTIONS.RENAME)) {
			return answers[COMMAND.OPTIONS.RENAME];
		}
		// if (answers.hasOwnProperty(COMMAND.OPTIONS.REVOKE)) {
		//    return answers[COMMAND.OPTIONS.REVOKE];
		// }
		assert.fail(NodeTranslationService.getMessage(ERRORS.UNKNOWN_ACTION));
	}
};
