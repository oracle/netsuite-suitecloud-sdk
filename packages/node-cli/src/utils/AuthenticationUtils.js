/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const FileUtils = require('./FileUtils');
const NodeTranslationService = require('../services/NodeTranslationService');
const {
	ERRORS,
	UTILS,
	COMMAND_SETUPACCOUNTCI: { ERRORS: { NOT_EXISTING_AUTH_ID } },
} = require('../services/TranslationKeys');
const { FILES} = require('../ApplicationConstants');
const { ActionResult } = require('../services/actionresult/ActionResult');
const AuthenticateActionResult = require('../services/actionresult/AuthenticateActionResult');
const { executeWithSpinner } = require('../ui/CliSpinner');
const path = require('path');
const SdkExecutionContext = require('../SdkExecutionContext');
const SdkOperationResultUtils = require('../utils/SdkOperationResultUtils');
const SdkExecutor = require('../SdkExecutor');
const { lineBreak } = require('../loggers/LoggerOsConstants')
const ExecutionEnvironmentContext = require('../ExecutionEnvironmentContext');
const SdkOperationResult = require('../utils/SdkOperationResult')

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
			REUSE: 'REUSE',
			CLIENT_CREDENTIALS: 'CLIENT_CREDENTIALS'
		},
	},
	AUTHENTICATE_CI: {
		SDK_COMMAND: 'authenticateci',
		PARAMS: {
			ACCOUNT: 'account',
			AUTH_ID: 'authid',
			CERTIFICATEID: 'certificateid',
			PRIVATEKEYPATH: 'privatekeypath',
			URL: 'url',
		}
	},
	MANAGEAUTH: {
		SDK_COMMAND: 'manageauth',
	},
	INSPECT_AUTHORIZATION: {
		SDK_COMMAND: 'inspectauthorization',
		PARAMS: {
			AUTH_ID: 'authid',
		}
	},
	REFRESH_AUTHORIZATION: {
		SDK_COMMAND: 'refreshauthorization',
		PARAMS: {
			AUTH_ID: 'authid',
		}
	},
	FORCE_REFRESH_AUTHORIZATION: {
		SDK_COMMAND: 'forcerefreshauthorization',
		PARAMS: {
			AUTH_ID: 'authid',
		}
	},
};

const FLAGS = {
	LIST: 'list'
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
		.catch((error) => AuthenticateActionResult.Builder.withErrors([error]).build());
}

async function authenticateCi(params, sdkPath, projectFolder, executionEnvironmentContext) {
	const authId = params.authid;
	const sdkExecutor = new SdkExecutor(sdkPath, executionEnvironmentContext);
	const contextBuilder = SdkExecutionContext.Builder.forCommand(COMMANDS.AUTHENTICATE_CI.SDK_COMMAND)
		.integration()
		.addParam(COMMANDS.AUTHENTICATE_CI.PARAMS.AUTH_ID, authId)
		.addParam(COMMANDS.AUTHENTICATE_CI.PARAMS.ACCOUNT, params.account)
		.addParam(COMMANDS.AUTHENTICATE_CI.PARAMS.CERTIFICATEID, params.certificateid)
		.addParam(COMMANDS.AUTHENTICATE_CI.PARAMS.PRIVATEKEYPATH, params.privatekeypath)

	if (params.domain) {
		contextBuilder.addParam(COMMANDS.AUTHENTICATE_CI.PARAMS.URL, params.domain);
	}

	const authenticateCiExecutionContext = contextBuilder.build();
	const operationResult = await executeWithSpinner({
		action: sdkExecutor.execute(authenticateCiExecutionContext),
		message: NodeTranslationService.getMessage(UTILS.AUTHENTICATION.AUTHENTICATING),
	});
	if (operationResult.status === SdkOperationResultUtils.STATUS.ERROR) {
		return AuthenticateActionResult.Builder.withErrors(operationResult.errorMessages).build();
	}
	setDefaultAuthentication(projectFolder, authId);
	return AuthenticateActionResult.Builder.success()
		.withMode(COMMANDS.AUTHENTICATE.MODES.CLIENT_CREDENTIALS)
		.withAuthId(authId)
		.withAccountInfo(operationResult.data.accountInfo)
		.withCommandParameters(authenticateCiExecutionContext.getParams())
		.build();
}

async function selectAuthenticationCI(authId, sdkPath, projectFolder) {
	//Validate authId exists into the CI file
	const authIDActionResult = await getAuthIds(sdkPath);
	if (!authIDActionResult.isSuccess()) {
		throw authIDActionResult.errorMessages;
	}
	const authIDs = Object.keys(authIDActionResult.data);

	if (authIDs.includes(authId)) {
		setDefaultAuthentication(projectFolder, authId);
		return AuthenticateActionResult.Builder.success()
			.withMode(COMMANDS.AUTHENTICATE.MODES.REUSE)
			.withAuthId(authId)
			.withAccountInfo(authIDActionResult.data[authId].accountInfo)
			.build();
	} else {
		throw NodeTranslationService.getMessage(NOT_EXISTING_AUTH_ID, authId);
	}
}

/**
 * 
 * @param {String} authid 
 * @param {String} sdkPath 
 * @param {ExecutionEnvironmentContext} executionEnvironmentContext 
 * @returns {Promise<SdkOperationResult>}
 */
async function checkIfReauthorizationIsNeeded(authid, sdkPath, executionEnvironmentContext) {
	const sdkExecutor = new SdkExecutor(sdkPath, executionEnvironmentContext);
	const inspectAuthContext = SdkExecutionContext.Builder
		.forCommand(COMMANDS.INSPECT_AUTHORIZATION.SDK_COMMAND)
		.addParam(COMMANDS.INSPECT_AUTHORIZATION.PARAMS.AUTH_ID, authid)
		.integration()
		.build();
	const result = await sdkExecutor.execute(inspectAuthContext);
	return new SdkOperationResult(result);
}

/**
 * 
 * @param {String} authid 
 * @param {String} sdkPath 
 * @param {ExecutionEnvironmentContext} executionEnvironmentContext 
 * @returns {Promise<SdkOperationResult>}
 */
async function refreshAuthorization(authid, sdkPath, executionEnvironmentContext) {
	const sdkExecutor = new SdkExecutor(sdkPath, executionEnvironmentContext);
	const reauthorizeAuthContext = SdkExecutionContext.Builder
		.forCommand(COMMANDS.REFRESH_AUTHORIZATION.SDK_COMMAND)
		.addParam(COMMANDS.REFRESH_AUTHORIZATION.PARAMS.AUTH_ID, authid)
		.integration()
		.build();
	const result = await executeWithSpinner({
		action: sdkExecutor.execute(reauthorizeAuthContext),
		message: NodeTranslationService.getMessage(UTILS.AUTHENTICATION.AUTHORIZING)
	});
	return new SdkOperationResult(result);
}

/**
 * 
 * @param {String} authid 
 * @param {String} sdkPath 
 * @param {ExecutionEnvironmentContext} executionEnvironmentContext 
 * @returns {Promise<SdkOperationResult>} with data that contains the refreshed accessToken
 */
async function forceRefreshAuthorization(authid, sdkPath, executionEnvironmentContext) {
	const sdkExecutor = new SdkExecutor(sdkPath, executionEnvironmentContext);
	const reauthorizeAuthContext = SdkExecutionContext.Builder
		.forCommand(COMMANDS.FORCE_REFRESH_AUTHORIZATION.SDK_COMMAND)
		.addParam(COMMANDS.FORCE_REFRESH_AUTHORIZATION.PARAMS.AUTH_ID, authid)
		.integration()
		.build();
	const result = await executeWithSpinner({
		action: sdkExecutor.execute(reauthorizeAuthContext),
		message: NodeTranslationService.getMessage(UTILS.AUTHENTICATION.AUTHORIZING)
	});
	
	return new SdkOperationResult(result);
}

module.exports = { setDefaultAuthentication, getProjectDefaultAuthId, getAuthIds, authenticateWithOauth, authenticateCi, selectAuthenticationCI, checkIfReauthorizationIsNeeded, refreshAuthorization, forceRefreshAuthorization, COMMANDS};
