/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseAction = require('../../base/BaseAction');
const AuthenticateActionResult = require('../../../services/actionresult/AuthenticateActionResult');
const { setDefaultAuthentication, authenticateWithOauth, saveToken } = require('../../../utils/AuthenticationUtils');

const AUTH_MODE = {
	OAUTH: 'OAUTH',
	SAVE_TOKEN: 'SAVE_TOKEN',
	REUSE: 'REUSE',
};

module.exports = class SetupAction extends BaseAction {
	constructor(options) {
		super(options);
	}

	async execute(params) {
		try {
			if (params.mode === AUTH_MODE.OAUTH) {
				return await authenticateWithOauth(params, this._sdkPath, this._executionPath, this._executionEnvironmentContext);
			} else if (params.mode === AUTH_MODE.SAVE_TOKEN) {
				return await saveToken(params, this._sdkPath, this._executionPath);
			} else if (params.mode === AUTH_MODE.REUSE) {
				const authId = params.authentication.authId;
				const accountInfo = params.authentication.accountInfo;
				setDefaultAuthentication(this._executionPath, authId);
				return AuthenticateActionResult.Builder.success()
					.withMode(AUTH_MODE.REUSE)
					.withAuthId(authId)
					.withAccountInfo(accountInfo)
					.build();
			}
		} catch (error) {
			return AuthenticateActionResult.Builder.withErrors([error]).build();
		}
	}
};
