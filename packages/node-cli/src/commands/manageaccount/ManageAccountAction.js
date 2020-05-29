/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseAction = require('../base/BaseAction');
const SdkExecutionContext = require('../../SdkExecutionContext');
const { executeWithSpinner } = require('../../ui/CliSpinner');
const SdkOperationResultUtils = require('../../utils/SdkOperationResultUtils');
const CommandUtils = require('../../utils/CommandUtils');
const NodeTranslationService = require('../../services/NodeTranslationService');
const { ManageAccountActionResult, MANAGE_ACTION } = require('../../services/actionresult/ManageAccountActionResult');
const { throwValidationException } = require('../../utils/ExceptionUtils');
const {
	COMMAND_MANAGE_ACCOUNT: { MESSAGES },
} = require('../../services/TranslationKeys');

const COMMAND = {
	OPTIONS: {
		INFO: 'info',
		LIST: 'list',
		REMOVE: 'remove',
		RENAME: 'rename',
		RENAMETO: 'renameto',
	},
	FLAGS: {
		NO_PREVIEW: 'no_preview',
		SKIP_WARNING: 'skip_warning',
		VALIDATE: 'validate',
	},
};

const DATA_PROPERTIES = {
	INFO: "info",
	ACCOUNT_INFO: "accountInfo",
	URLS: "urls",
 };

module.exports = class ManageAccountAction extends BaseAction {
	constructor(options) {
		super(options);
	}

	async execute(params) {
		const sdkParams = CommandUtils.extractCommandOptions(params, this._commandMetadata);

		const flags = [];
		if (params[COMMAND.OPTIONS.LIST]) {
			flags.push(COMMAND.OPTIONS.LIST);
			delete sdkParams[COMMAND.OPTIONS.LIST];
		}

		const executionContext = SdkExecutionContext.Builder.forCommand(this._commandMetadata.sdkCommand)
			.integration()
			.addParams(sdkParams)
			.addFlags(flags)
			.build();

		const selectedAction = this._extractExecutedAction(params);
		const authId = this._extractAuthId(selectedAction, params);
		const message = this._getSpinnerMessage(selectedAction, authId);

		const operationResult = await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: message,
		});

		return operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
			? ManageAccountActionResult.Builder.withData(this._prepareData(selectedAction, operationResult.data))
					.withResultMessage(operationResult.resultMessage)
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
		throwValidationException([NodeTranslationService.getMessage(ERRORS.UNKNOWN_ACTION)], this._runInInteractiveMode, this._commandMetadata);
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

	_extractAuthId(action, answers) {
		switch (action) {
			case MANAGE_ACTION.REMOVE:
				return answers[COMMAND.OPTIONS.REMOVE];
			case MANAGE_ACTION.RENAME:
				return answers[COMMAND.OPTIONS.RENAME];
			case MANAGE_ACTION.LIST:
				return ;
			//case MANAGE_ACTION.REVOKE:
			//	return answers[COMMAND.OPTIONS.REVOKE];
			case MANAGE_ACTION.INFO:
				return answers[COMMAND.OPTIONS.INFO];
		}
		assert.fail(NodeTranslationService.getMessage(ERRORS.UNKNOWN_ACTION));
	}

	_prepareData(action, data) {
		console.log(JSON.stringify(action));
		console.log(JSON.stringify(data))
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
};
