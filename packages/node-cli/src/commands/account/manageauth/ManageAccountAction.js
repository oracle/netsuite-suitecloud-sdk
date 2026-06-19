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
	COMMAND_OPTIONS,
	MANAGE_AUTH_VALIDATION_ERROR,
	selectManageAuthAction,
	prepareManageAuthActionData,
} = require('@oracle/suitecloud-sdk-core/commands/account/manageauth/ManageAuthHandler');
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

module.exports = class ManageAccountAction extends BaseAction {
	constructor(options) {
		super(options);
	}

	async execute(params) {
		const selectedOptions = this._extractSelectedOptions(params);
		const sdkParams = CommandUtils.extractCommandOptions(params, this._commandMetadata);

		const flags = [];
		if (selectedOptions.action === MANAGE_ACTION.LIST) {
			flags.push(COMMAND.OPTIONS.LIST);
			delete sdkParams[COMMAND.OPTIONS.LIST];
		}

		const executionContext = SdkExecutionContext.Builder.forCommand(this._commandMetadata.sdkCommand)
			.integration()
			.addParams(sdkParams)
			.addFlags(flags)
			.build();

		const message = this._getSpinnerMessage(selectedOptions);
		const operationResult = await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: message,
		});
		return operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
			? ManageAccountActionResult.Builder.withData(prepareManageAuthActionData(selectedOptions, operationResult.data))
					.withResultMessage(operationResult.resultMessage)
					.withExecutedAction(selectedOptions.action)
					.withCommandParameters(sdkParams)
					.build()
			: ManageAccountActionResult.Builder.withErrors(operationResult.errorMessages).withCommandParameters(sdkParams).build();
	}

	_extractSelectedOptions(params) {
		const selectedAction = selectManageAuthAction(params);
		if (selectedAction.validationError) {
			const validationError = selectedAction.validationError;
			let validationMessage;

			switch (validationError.errorCode) {
				case MANAGE_AUTH_VALIDATION_ERROR.NO_OPTION:
					validationMessage = NodeTranslationService.getMessage(ERRORS.OPTION_NOT_SPECIFIED);
					break;
				case MANAGE_AUTH_VALIDATION_ERROR.ONLY_ONE_OPTION_ALLOWED:
					validationMessage = NodeTranslationService.getMessage(ERRORS.ONLY_ONE_OPTION_ALLOWED);
					break;
				case MANAGE_AUTH_VALIDATION_ERROR.MISSING_OPTION: {
					const isMissingRenameTo = validationError.missingOption === COMMAND_OPTIONS.RENAMETO;
					const missingOption = isMissingRenameTo
						? NodeTranslationService.getMessage(ERRORS.OPTION_RENAMETO)
						: NodeTranslationService.getMessage(ERRORS.OPTION_RENAME);
					validationMessage = NodeTranslationService.getMessage(ERRORS.MISSING_OPTION, missingOption);
					break;
				}
				default:
					validationMessage = NodeTranslationService.getMessage(ERRORS.OPTION_NOT_SPECIFIED);
					break;
			}
			throwValidationException([validationMessage], this._runInInteractiveMode, this._commandMetadata);
		}

		return {
			action: selectedAction.action,
			...(selectedAction.authId && { authId: selectedAction.authId }),
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
};
