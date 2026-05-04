/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { default: { prompt, Separator } } = require('inquirer');
const SdkExecutor = require('../../../SdkExecutor');
const BaseInputHandler = require('../../base/BaseInputHandler');
const CommandUtils = require('../../../utils/CommandUtils');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const { getAuthIds } = require('../../../utils/AuthenticationUtils');
const { resolveDefaultClientApiKey } = require('../../../utils/ClientAPIKeyUtils');
const { COMMAND_PROXY_START, COMMAND_SETUPACCOUNT, COMMAND_MANAGE_ACCOUNT } = require('../../../services/TranslationKeys');
const {
	PROXY_START: {
		COMMAND: { OPTIONS },
		DEFAULT_PORT,
	},
} = require('./ProxyStartConstants');
const { isValidProxyStartPort, getInvalidProxyStartPortMessage } = require('./ProxyStartValidation');

module.exports = class ProxyStartInputHandler extends BaseInputHandler {
	async getParameters(params) {
		const sdkExecutor = new SdkExecutor(this._sdkPath, this._executionEnvironmentContext);
		const apiKeyParams = await resolveDefaultClientApiKey(sdkExecutor);

		const authIDActionResult = await getAuthIds(this._sdkPath);
		if (!authIDActionResult.isSuccess()) {
			throw authIDActionResult.errorMessages;
		}

		const answers = await prompt([
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: OPTIONS.AUTH_ID,
				message: NodeTranslationService.getMessage(COMMAND_PROXY_START.QUESTIONS.SELECT_AUTH_ID),
				choices: this._toAuthIdChoices(authIDActionResult.data),
			},
			{
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: OPTIONS.PORT,
				message: NodeTranslationService.getMessage(COMMAND_PROXY_START.QUESTIONS.PORT),
				default: params[OPTIONS.PORT] || DEFAULT_PORT,
				filter: (value) => Number(value),
				validate: (value) => this._validatePortInput(value),
			},
		]);

		return {
			...params,
			...apiKeyParams,
			...answers,
		};
	}

	_toAuthIdChoices(authIdData) {
		const authIds = Object.keys(authIdData).sort();
		if (authIds.length <= 0) {
			throw NodeTranslationService.getMessage(COMMAND_MANAGE_ACCOUNT.ERRORS.CREDENTIALS_EMPTY);
		}

		const choices = [];

		authIds.forEach((authId) => {
			const credentials = authIdData[authId];
			const accountInfo = `${credentials.accountInfo.companyName} [${credentials.accountInfo.roleName}]`;
			choices.push({
				name: NodeTranslationService.getMessage(COMMAND_SETUPACCOUNT.QUESTIONS_CHOICES.SELECT_AUTHID.EXISTING_AUTH_ID, authId, accountInfo, ''),
				value: authId,
			});
		});

		choices.push(new Separator());
		return choices;
	}

	_validatePortInput(value) {
		if (!isValidProxyStartPort(value)) {
			return getInvalidProxyStartPortMessage();
		}

		return true;
	}
};
