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
const { setDefaultAuthentication, saveToken } = require('../../../utils/AuthenticationUtils');

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
				const commandParams = {
					authId: params.newAuthId,
				};

				if (params.url) {
					commandParams.url = params.url;
				}

				const operationResult = await this._performBrowserBasedAuthentication(commandParams, params.developmentMode);
				if (operationResult.status === SdkOperationResultUtils.STATUS.ERROR) {
					return AuthenticateActionResult.Builder.withErrors(operationResult.errorMessages).build();
				}
				authId = params.newAuthId;
				accountInfo = operationResult.data.accountInfo;
			} else if (params.mode === AUTH_MODE.SAVE_TOKEN) {
				const commandParams = {
					authid: params.newAuthId,
					account: params.saveToken.account,
					tokenid: params.saveToken.tokenId,
					tokensecret: params.saveToken.tokenSecret,
				};

				if (params.url) {
					commandParams.url = params.url;
				}

				const saveTokenResult = await saveToken(this._sdkPath, commandParams, params.developmentMode);
				if (!saveTokenResult.isSuccess()) {
					return AuthenticateActionResult.Builder.withErrors(saveTokenResult.errorMessages).build();
				}
				authId = params.newAuthId;
				accountInfo = saveTokenResult.data.accountInfo;
			} else if (params.mode === AUTH_MODE.REUSE) {
				authId = params.authentication.authId;
				accountInfo = params.authentication.accountInfo;
			}
			setDefaultAuthentication(this._executionPath, authId);

			return AuthenticateActionResult.Builder.success().withMode(params.mode).withAuthId(authId).withAccountInfo(accountInfo).build();
		} catch (error) {
			return AuthenticateActionResult.Builder.withErrors([error]).build();
		}
	}

	async _performBrowserBasedAuthentication(params, developmentMode) {
		const contextBuilder = SdkExecutionContext.Builder.forCommand(COMMANDS.AUTHENTICATE)
			.integration()
			.addParams(params)

		if (developmentMode) {
			contextBuilder.addFlag(FLAGS.DEVELOPMENTMODE);
		}

		return executeWithSpinner({
			action: this._sdkExecutor.execute(contextBuilder.build()),
			message: NodeTranslationService.getMessage(MESSAGES.STARTING_OAUTH_FLOW),
		});
	}
};
