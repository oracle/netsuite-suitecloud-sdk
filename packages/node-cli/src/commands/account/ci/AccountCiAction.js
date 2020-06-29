/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseAction = require('../../base/BaseAction');
const { setDefaultAuthentication, saveToken } = require('../../../utils/AuthenticationUtils');
const { PROD_ENVIRONMENT_ADDRESS } = require('../../../ApplicationConstants');
const AuthenticateActionResult = require('../../../services/actionresult/AuthenticateActionResult');

const {
	COMMAND_MANAGE_ACCOUNT: { MESSAGES },
} = require('../../../services/TranslationKeys');

const COMMAND = {
	OPTIONS: {
		AUTH_ID: 'authid',
		TOKEN_ID: 'tokenid',
		TOKEN_SECRET: 'tokensecret',
		ACCOUNT_ID: 'accountid',
		URL: 'url',
	},
	FLAGS: {
		SAVETOKEN: 'savetoken',
	},
	SDK_COMMAND: 'authenticate',
};

const AUTH_MODE = {
	OAUTH: 'OAUTH',
	SAVE_TOKEN: 'SAVE_TOKEN',
	REUSE: 'REUSE',
};

module.exports = class ManageAccountAction extends BaseAction {
	constructor(options) {
		super(options);
	}

	async execute(params) {
		if (params[COMMAND.FLAGS.SAVETOKEN]) {
			const commandParams = {
				authid: params[COMMAND.OPTIONS.AUTH_ID],
				account: params[COMMAND.OPTIONS.ACCOUNT_ID],
				tokenid: params[COMMAND.OPTIONS.TOKEN_ID],
				tokensecret: params[COMMAND.OPTIONS.TOKEN_SECRET],
			};

			let devMode = false;
			if (params[COMMAND.OPTIONS.URL]) {
				commandParams.url = params[COMMAND.OPTIONS.URL];
				devMode = params[COMMAND.OPTIONS.URL] !== PROD_ENVIRONMENT_ADDRESS;
			}

			const saveTokenResult = await saveToken(this._sdkPath, commandParams, devMode);
			return saveTokenResult.isSuccess()
				? AuthenticateActionResult.Builder.withAccountInfo(saveTokenResult.data.accountInfo)
					.success()
					.withAuthId(commandParams.authid)
					.withMode(AUTH_MODE.SAVE_TOKEN)
					.build()
				: AuthenticateActionResult.Builder.withErrors(saveTokenResult.errorMessages).build();
		}
	}
};
