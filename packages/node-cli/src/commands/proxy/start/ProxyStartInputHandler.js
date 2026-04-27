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
const { resolveClientApiKey } = require('../../../utils/ClientAPIKeyUtils');
const { COMMAND_PROXY_START, COMMAND_SETUPACCOUNT } = require('../../../services/TranslationKeys');

const COMMAND = {
	OPTIONS: {
		AUTH_ID: 'authid',
		PORT: 'port',
	},
};

const PORT_RANGE = {
	MIN: 1024,
	MAX: 65535,
};

const DEFAULT_PORT = 8181;

module.exports = class ProxyStartInputHandler extends BaseInputHandler {
	async getParameters(params) {
		const sdkExecutor = new SdkExecutor(this._sdkPath, this._executionEnvironmentContext);
		const apiKeyParams = await resolveClientApiKey(sdkExecutor);

		const authIDActionResult = await getAuthIds(this._sdkPath);
		if (!authIDActionResult.isSuccess()) {
			throw authIDActionResult.errorMessages;
		}

		const answers = await prompt([
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND.OPTIONS.AUTH_ID,
				message: NodeTranslationService.getMessage(COMMAND_PROXY_START.QUESTIONS.SELECT_AUTH_ID),
				choices: this._toAuthIdChoices(authIDActionResult.data),
			},
			{
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: COMMAND.OPTIONS.PORT,
				message: NodeTranslationService.getMessage(COMMAND_PROXY_START.QUESTIONS.PORT),
				default: params[COMMAND.OPTIONS.PORT] || DEFAULT_PORT,
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
		const port = Number(value);
		if (Number.isNaN(port)) {
			return this._getInvalidPortMessage();
		}

		if (port < PORT_RANGE.MIN || port > PORT_RANGE.MAX) {
			return this._getInvalidPortMessage();
		}

		return true;
	}

	_getInvalidPortMessage() {
		return NodeTranslationService.getMessage(COMMAND_PROXY_START.ERRORS.PORT_MUST_BE_NUMBER, PORT_RANGE.MIN, PORT_RANGE.MAX);
	}
};
