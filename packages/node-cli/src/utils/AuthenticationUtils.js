/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const FileUtils = require('./FileUtils');
const NodeTranslationService = require('../services/NodeTranslationService');
const { ERRORS, UTILS } = require('../services/TranslationKeys');
const { FILES } = require('../ApplicationConstants');
const { ActionResult } = require('../services/actionresult/ActionResult');
const AuthenticateActionResult = require('../services/actionresult/AuthenticateActionResult');
const { executeWithSpinner } = require('../ui/CliSpinner');
const path = require('path');
const SdkExecutionContext = require('../SdkExecutionContext');
const SdkOperationResultUtils = require('../utils/SdkOperationResultUtils');
const SdkExecutor = require('../SdkExecutor');
const {lineBreak} = require('../loggers/LoggerConstants')

const DEFAULT_AUTH_ID_PROPERTY = 'defaultAuthId';

const COMMANDS = {
	AUTHENTICATE: {
		SDK_COMMAND: 'authenticate',
		PARAMS: {
			AUTH_ID: 'authid',
			ACCOUNT: 'account',
			TOKEN_ID: 'tokenid',
			TOKEN_SECRET: 'tokensecret',
			URL: 'url',
		},
		MODES: {
			OAUTH: 'OAUTH',
			SAVE_TOKEN: 'SAVE_TOKEN',
			REUSE: 'REUSE',
		},
	},
	MANAGEAUTH: {
		SDK_COMMAND: 'manageauth',
	},
};

const FLAGS = {
	LIST: 'list',
	SAVETOKEN: 'savetoken',
};

function setDefaultAuthentication(projectFolder, authId) {
	try {
		// nest the values into a DEFAULT_AUTH_ID_PROPERTY property
		const projectConfiguration = {
			[DEFAULT_AUTH_ID_PROPERTY]: authId,
		};
		FileUtils.create(path.join(projectFolder, FILES.PROJECT_JSON), projectConfiguration);
	} catch (error) {
		const errorMessage = error != null && error.message ? NodeTranslationService.getMessage(ERRORS.ADD_ERROR_LINE, error.message) : '';
		throw NodeTranslationService.getMessage(ERRORS.WRITING_PROJECT_JSON, errorMessage);
	}
}

function getProjectDefaultAuthId(projectFolder) {
	const projectFilePath = path.join(projectFolder, FILES.PROJECT_JSON);
	if (FileUtils.exists(projectFilePath)) {
		try {
			const fileContentJson = FileUtils.readAsJson(projectFilePath);
			if (!fileContentJson.hasOwnProperty(DEFAULT_AUTH_ID_PROPERTY)) {
				throw NodeTranslationService.getMessage(ERRORS.MISSING_DEFAULT_AUTH_ID, DEFAULT_AUTH_ID_PROPERTY);
			}
			return fileContentJson[DEFAULT_AUTH_ID_PROPERTY];
		} catch (error) {
			throw NodeTranslationService.getMessage(ERRORS.WRONG_JSON_FILE, projectFilePath, error) + 
			lineBreak + NodeTranslationService.getMessage(ERRORS.RUN_SETUP_ACCOUNT);
		}
	}
}

async function getAuthIds(sdkPath) {
	const sdkExecutor = new SdkExecutor(sdkPath);
	const getAuthListContext = SdkExecutionContext.Builder.forCommand(COMMANDS.MANAGEAUTH.SDK_COMMAND).integration().addFlag(FLAGS.LIST).build();

	const operationResult = await executeWithSpinner({
		action: sdkExecutor.execute(getAuthListContext),
		message: NodeTranslationService.getMessage(UTILS.AUTHENTICATION.LOADING_AUTHIDS),
	}).catch((error) => {
		return ActionResult.Builder.withErrors([error]).build();
	});
	return operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
		? ActionResult.Builder.withData(operationResult.data).build()
		: ActionResult.Builder.withErrors(operationResult.errorMessages).build();
}

async function saveToken(params, sdkPath, projectFolder, executionEnvironmentContext) {
	const authId = params.authid;
	const sdkExecutor = new SdkExecutor(sdkPath, executionEnvironmentContext);
	const contextBuilder = SdkExecutionContext.Builder.forCommand(COMMANDS.AUTHENTICATE.SDK_COMMAND)
		.integration()
		.addParam(COMMANDS.AUTHENTICATE.PARAMS.AUTH_ID, authId)
		.addParam(COMMANDS.AUTHENTICATE.PARAMS.ACCOUNT, params.account)
		.addParam(COMMANDS.AUTHENTICATE.PARAMS.TOKEN_ID, params.tokenid)
		.addParam(COMMANDS.AUTHENTICATE.PARAMS.TOKEN_SECRET, params.tokensecret)
		.addFlag(FLAGS.SAVETOKEN);

	if (params.url) {
		contextBuilder.addParam(COMMANDS.AUTHENTICATE.PARAMS.URL, params.url);
	}

	const tokenExecutionContext = contextBuilder.build();
	const operationResult = await executeWithSpinner({
		action: sdkExecutor.execute(tokenExecutionContext),
		message: NodeTranslationService.getMessage(UTILS.AUTHENTICATION.SAVING_TBA_TOKEN),
	});
	if (operationResult.status === SdkOperationResultUtils.STATUS.ERROR) {
		return AuthenticateActionResult.Builder.withErrors(operationResult.errorMessages).build();
	}
	setDefaultAuthentication(projectFolder, authId);
	return AuthenticateActionResult.Builder.success()
		.withMode(COMMANDS.AUTHENTICATE.MODES.SAVE_TOKEN)
		.withAuthId(authId)
		.withAccountInfo(operationResult.data.accountInfo)
		.withCommandParameters(tokenExecutionContext.getParams())
		.build();
}

async function authenticateWithOauth(params, sdkPath, projectFolder, cancelToken, executionEnvironmentContext) {
	let authId = params.authid;
	const sdkExecutor = new SdkExecutor(sdkPath, executionEnvironmentContext);
	const contextBuilder = SdkExecutionContext.Builder.forCommand(COMMANDS.AUTHENTICATE.SDK_COMMAND)
		.integration()
		.addParam(COMMANDS.AUTHENTICATE.PARAMS.AUTH_ID, authId);

	if (params.url) {
		contextBuilder.addParam(COMMANDS.AUTHENTICATE.PARAMS.URL, params.url);
	}
	const oauthContext = contextBuilder.build();
	return executeWithSpinner({
		action: sdkExecutor.execute(oauthContext, cancelToken),
		message: NodeTranslationService.getMessage(UTILS.AUTHENTICATION.STARTING_OAUTH_FLOW),
	})
		.then((operationResult) => {
			if (operationResult.status === SdkOperationResultUtils.STATUS.ERROR) {
				return AuthenticateActionResult.Builder.withErrors(operationResult.errorMessages)
					.withCommandParameters(oauthContext.getParams())
					.build();
			}
			setDefaultAuthentication(projectFolder, authId);
			return AuthenticateActionResult.Builder.success()
				.withMode(COMMANDS.AUTHENTICATE.MODES.OAUTH)
				.withAuthId(authId)
				.withAccountInfo(operationResult.data.accountInfo)
				.withCommandParameters(oauthContext.getParams())
				.build();
		})
		.catch((error) => AuthenticateActionResult.Builder.withErrors([error]));
}

module.exports = { setDefaultAuthentication, getProjectDefaultAuthId, getAuthIds, saveToken, authenticateWithOauth };
