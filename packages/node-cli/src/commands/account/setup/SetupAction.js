/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseAction = require('../../base/BaseAction');
const AuthenticateActionResult = require('../../../services/actionresult/AuthenticateActionResult');
const SdkExecutionContext = require('../../../SdkExecutionContext');
const { executeWithSpinner } = require('../../../ui/CliSpinner');
const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const { setDefaultAuthentication, oauth, saveToken } = require('../../../utils/AuthenticationUtils');

const {
	COMMAND_SETUPACCOUNT: { MESSAGES },
} = require('../../../services/TranslationKeys');

const AUTH_MODE = {
	OAUTH: 'OAUTH',
	SAVE_TOKEN: 'SAVE_TOKEN',
	REUSE: 'REUSE',
};

const COMMANDS = {
	AUTHENTICATE: 'authenticate',
	MANAGEAUTH: 'manageauth',
};

const FLAGS = {
	LIST: 'list',
	SAVETOKEN: 'savetoken',
	DEVELOPMENTMODE: 'developmentmode',
};

module.exports = class SetupAction extends BaseAction {
	constructor(options) {
		super(options);
	}

	async execute(params) {
		try {
			let authId;
			let accountInfo;
			if (params.mode === AUTH_MODE.OAUTH) {
				return await oauth(params, this._sdkPath);
			} else if (params.mode === AUTH_MODE.SAVE_TOKEN) {
				return await saveToken(params, this._sdkPath);
			} else if (params.mode === AUTH_MODE.REUSE) {
				authId = params.authentication.authId;
				accountInfo = params.authentication.accountInfo;
				setDefaultAuthentication(this._executionPath, authId);
				return SetupActionResult.Builder.success().withMode(params.mode).withAuthId(authId).withAccountInfo(accountInfo).build();
			}
		} catch (error) {
			return SetupActionResult.Builder.withErrors([error]).build();
		}
	}
};
