/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const assert = require('assert');
const BaseAction = require('../../base/BaseAction');
const SdkExecutionContext = require('../../../SdkExecutionContext');
const { executeWithSpinner } = require('../../../ui/CliSpinner');
const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');
const CommandUtils = require('../../../utils/CommandUtils');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const { ManageAccountActionResult, MANAGE_ACTION } = require('../../../services/actionresult/ManageAccountActionResult');
const { throwValidationException } = require('../../../utils/ExceptionUtils');
const {
	COMMAND_MANAGE_ACCOUNT: { MESSAGES, ERRORS },
} = require('../../../services/TranslationKeys');

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
	INFO: 'info',
	ACCOUNT_INFO: 'accountInfo',
	URLS: 'urls',
};

const DOMAIN = 'domain';

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

		const selectedOptions = this._extractSelectedOptions(params);
		const message = this._getSpinnerMessage(selectedOptions);
		const operationResult = await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: message,
		});
		return operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
			? ManageAccountActionResult.Builder.withData(this._prepareData(selectedOptions, operationResult.data))
					.withResultMessage(operationResult.resultMessage)
					.withExecutedAction(selectedOptions.action)
					.withCommandParameters(sdkParams)
					.build()
			: ManageAccountActionResult.Builder.withErrors(operationResult.errorMessages).withCommandParameters(sdkParams).build();
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
			throwValidationException([NodeTranslationService.getMessage(ERRORS.OPTION_NOT_SPECIFIED)], this._runInInteractiveMode, this._commandMetadata);
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
