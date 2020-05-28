/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const assert = require('assert');
const BaseCommandGenerator = require("./BaseCommandGenerator");
const SdkExecutionContext = require("../SdkExecutionContext");
const { executeWithSpinner } = require("../ui/CliSpinner");
const SdkOperationResultUtils = require("../utils/SdkOperationResultUtils");
const CommandUtils = require("../utils/CommandUtils");
const AccountCredentialsService = require('../services/AccountCredentialsService');
const NodeTranslationService = require("../services/NodeTranslationService");
const ManageAccountOutputFormatter = require("./outputFormatters/ManageAccountOutputFormatter");
const AuthenticationService = require("../services/AuthenticationService");
const { ManageAccountActionResult } = require("./actionresult/ManageAccountActionResult");

const inquirer = require('inquirer');

const {
	COMMAND_MANAGE_ACCOUNT: { ERRORS, QUESTIONS, QUESTIONS_CHOICES, MESSAGES },
	YES,
	NO,
} = require('../services/TranslationKeys');

const ACTION = {
	LIST: 'list',
	EXIT: 'exit',
	INFO: 'info',
	RENAME: 'rename',
	REMOVE: 'remove',
	REVOKE: 'revoke',
};

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
		this._accountCredentialsService = new AccountCredentialsService();
	}

	async _getCommandQuestions(prompt) {
		const authIDList = await AuthenticationService.getAuthIds(this._sdkPath);
		const answers = await this._selectAuthID(authIDList.data, prompt);
		this._consoleLogger.info(this._accountCredentialsService.buildAccountCredentialsInfo(answers[ANSWERS_NAMES.SELECTED_AUTH_ID]));
		const selectedAuthID = answers[ANSWERS_NAMES.SELECTED_AUTH_ID].authId;
		answers[ANSWERS_NAMES.ACTION] = await this._selectAction(prompt);
		if (answers[ANSWERS_NAMES.ACTION] == ACTION.RENAME) {
			answers[ANSWERS_NAMES.RENAMETO] = await this._introduceNewName(prompt, authIDList.data, selectedAuthID);
		} else if (answers[ANSWERS_NAMES.ACTION] == ACTION.REMOVE) {
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
			const accountCredentialString = this._accountCredentialsService.accountCredentialToString(authID, accountCredential);
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
					value: ACTION.RENAME,
				},
				{
					name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.ACTIONS.REMOVE),
					value: ACTION.REMOVE,
				},
				// {
				//    name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.ACTIONS.REVOKE),
				//    value: ACTION.REVOKE,
				// },
				{
					name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.ACTIONS.EXIT),
					value: ACTION.EXIT,
				},
			],
		});

		if (answer[ANSWERS_NAMES.ACTION] == ACTION.EXIT) {
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
		if (answers[ANSWERS_NAMES.ACTION] == ACTION.RENAME) {
			return {
				[COMMAND.OPTIONS.RENAME]: answers[ANSWERS_NAMES.SELECTED_AUTH_ID].authId,
				[COMMAND.OPTIONS.RENAMETO]: answers[ANSWERS_NAMES.RENAMETO],
			};
		} else if (answers[ANSWERS_NAMES.ACTION] == ACTION.REMOVE) {
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

		const action = this._getActionExecuted(answers);
		const message = this._getSpinnerMessage(action);

		const operationResult = await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: message,
		});

		return operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
			? ManageAccountActionResult.Builder.withData(this._prepareData(action, operationResult.data))
					.withResultMessage(operationResult.resultMessage)
					.withActionExecuted(action)
					.build()
			: ManageAccountActionResult.Builder.withErrors(SdkOperationResultUtils.collectErrorMessages(operationResult)).build();
	}

	_getSpinnerMessage(action) {
		switch (action) {
			case ACTION.REMOVE:
				return NodeTranslationService.getMessage(MESSAGES.REMOVING);
			case ACTION.RENAME:
				return NodeTranslationService.getMessage(MESSAGES.RENAMING);
			case ACTION.LIST:
				return NodeTranslationService.getMessage(MESSAGES.LISTING);
			case ACTION.REVOKE:
				return NodeTranslationService.getMessage(MESSAGES.REVOKING);
			case ACTION.INFO:
				return NodeTranslationService.getMessage(MESSAGES.INFO, this._authId);
		}
		assert.fail(NodeTranslationService.getMessage(ERRORS.UNKNOWN_ACTION));
	}

	_prepareData(action, data) {
		if (action != ACTION.INFO) {
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

	_getActionExecuted(answers) {
		if (answers.hasOwnProperty(COMMAND.OPTIONS.INFO)) {
			this._authId = answers[COMMAND.OPTIONS.INFO];
			return ACTION.INFO;
		}
		if (answers.hasOwnProperty(COMMAND.OPTIONS.LIST)) {
			return ACTION.LIST;
		}
		if (answers.hasOwnProperty(COMMAND.OPTIONS.REMOVE)) {
			return ACTION.REMOVE;
		}
		if (answers.hasOwnProperty(COMMAND.OPTIONS.RENAME)) {
			return ACTION.RENAME;
		}
		// if (answers.hasOwnProperty(COMMAND.OPTIONS.REVOKE)) {
		//    return ACTION.REVOKE;
		// }
		assert.fail(NodeTranslationService.getMessage(ERRORS.UNKNOWN_ACTION));
	}
};