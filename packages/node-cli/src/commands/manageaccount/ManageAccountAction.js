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
const { ManageAccountActionResult } = require('../../services/actionresult/ManageAccountActionResult');
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

const PROPERTIES = {
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

		let message = this._getSpinnerMessage(params);

		const operationResult = await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: message,
		});

		return operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
			? ManageAccountActionResult.Builder.withData(this._prepareData(params, operationResult.data))
					.withResultMessage(operationResult.resultMessage)
					.build()
			: ManageAccountActionResult.Builder.withErrors(SdkOperationResultUtils.collectErrorMessages(operationResult)).build();
	}

	_getSpinnerMessage(params) {
		let message = '';
		if (params.hasOwnProperty(COMMAND.OPTIONS.REMOVE)) {
			message = NodeTranslationService.getMessage(MESSAGES.REMOVING);
		} else if (params.hasOwnProperty(COMMAND.OPTIONS.RENAME)) {
			message = NodeTranslationService.getMessage(MESSAGES.RENAMING);
		} else if (params.hasOwnProperty(COMMAND.OPTIONS.LIST)) {
			message = NodeTranslationService.getMessage(MESSAGES.LISTING);
			// } else if (params.hasOwnProperty(COMMAND.OPTIONS.REVOKE)) {
			//    message = NodeTranslationService.getMessage(MESSAGES.REVOKING);
		} else if (params.hasOwnProperty(COMMAND.OPTIONS.INFO)) {
			message = NodeTranslationService.getMessage(MESSAGES.INFO, params.info);
		}
		return message;
	}

	_prepareData(params, data) {
		let actionResultData;
		if (!params.hasOwnProperty(PROPERTIES.INFO)) {
			return data;
		}

		assert(data.hasOwnProperty(PROPERTIES.ACCOUNT_INFO));
		actionResultData = { authId: params.info, accountInfo: data.accountInfo };
		if (data.hasOwnProperty(PROPERTIES.URLS)) {
			actionResultData[DOMAIN] = data.urls.app;
		}
		return actionResultData;
	}
};
