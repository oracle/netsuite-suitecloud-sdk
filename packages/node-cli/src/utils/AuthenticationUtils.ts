/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { create, exists, readAsJson} from './FileUtils';
import { NodeTranslationService } from '../services/NodeTranslationService';
import { ERRORS, UTILS } from '../services/TranslationKeys';
import { FILES } from '../ApplicationConstants';
import { ActionResult } from '../services/actionresult/ActionResult';
import { AuthenticateActionResult, AuthListData } from '../services/actionresult/AuthenticateActionResult';
import { executeWithSpinner } from '../ui/CliSpinner';
import path from 'path';
import { SdkExecutionContext } from '../SdkExecutionContext';
import { isSuccess, OperationResult } from '../utils/SdkOperationResultUtils';
import { SdkExecutor } from '../SdkExecutor';

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
	DEVELOPMENTMODE: 'developmentmode',
};

export function setDefaultAuthentication(projectFolder: string, authId: string) {
	try {
		// nest the values into a DEFAULT_AUTH_ID_PROPERTY property
		const projectConfiguration = {
			[DEFAULT_AUTH_ID_PROPERTY]: authId,
		};
		create(path.join(projectFolder, FILES.PROJECT_JSON), projectConfiguration);
	} catch (error) {
		const errorMessage = error != null && error.message ? NodeTranslationService.getMessage(ERRORS.ADD_ERROR_LINE, error.message) : '';
		throw NodeTranslationService.getMessage(ERRORS.WRITING_PROJECT_JSON, errorMessage);
	}
}

export function getProjectDefaultAuthId(projectFolder: string) {
	const projectFilePath = path.join(projectFolder, FILES.PROJECT_JSON);
	if (exists(projectFilePath)) {
		try {
			const fileContentJson = readAsJson(projectFilePath);
			if (!fileContentJson.hasOwnProperty(DEFAULT_AUTH_ID_PROPERTY)) {
				throw NodeTranslationService.getMessage(ERRORS.MISSING_DEFAULT_AUTH_ID, DEFAULT_AUTH_ID_PROPERTY);
			}
			return fileContentJson[DEFAULT_AUTH_ID_PROPERTY];
		} catch (error) {
			throw NodeTranslationService.getMessage(ERRORS.WRONG_JSON_FILE, projectFilePath, error);
		}
	}
}

export async function getAuthIds(sdkPath: string): Promise<ActionResult<any>> {
	const sdkExecutor = new SdkExecutor(sdkPath);
	const getAuthListContext = SdkExecutionContext.Builder.forCommand(COMMANDS.MANAGEAUTH.SDK_COMMAND).integration().addFlag(FLAGS.LIST).build();

	const operationResult: OperationResult<AuthListData> = await executeWithSpinner({
		action: sdkExecutor.execute(getAuthListContext),
		message: NodeTranslationService.getMessage(UTILS.AUTHENTICATION.LOADING_AUTHIDS),
	});

	return isSuccess(operationResult)
		? ActionResult.Builder.withData(operationResult.data).build()
		: ActionResult.Builder.withErrors(operationResult.errorMessages).build();
}

export async function saveToken(params: {authid: string; account: string; tokenid: string; tokensecret: string; url?: string; dev?: boolean}, sdkPath: string, projectFolder: string) {
	const authId = params.authid;
	const sdkExecutor = new SdkExecutor(sdkPath);
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
	if (params.dev === true) {
		contextBuilder.addFlag(FLAGS.DEVELOPMENTMODE);
	}

	const operationResult = await executeWithSpinner({
		action: sdkExecutor.execute(contextBuilder.build()),
		message: NodeTranslationService.getMessage(UTILS.AUTHENTICATION.SAVING_TBA_TOKEN),
	});
	if (!isSuccess(operationResult)) {
		return AuthenticateActionResult.Builder.withErrors(operationResult.errorMessages).build();
	}
	setDefaultAuthentication(projectFolder, authId);
	return AuthenticateActionResult.Builder.success()
		.withMode(COMMANDS.AUTHENTICATE.MODES.SAVE_TOKEN)
		.withAuthId(authId)
		.withAccountInfo(operationResult.data.accountInfo)
		.build();
}

export async function authenticateWithOauth(params: {authid: string; url?: string; dev?: boolean}, sdkPath: string, projectFolder: string, cancelToken: {cancel?: (x: string) => void}) {
	let authId = params.authid;
	const sdkExecutor = new SdkExecutor(sdkPath);
	const contextBuilder = SdkExecutionContext.Builder.forCommand(COMMANDS.AUTHENTICATE.SDK_COMMAND)
		.integration()
		.addParam(COMMANDS.AUTHENTICATE.PARAMS.AUTH_ID, authId);

	if (params.url) {
		contextBuilder.addParam(COMMANDS.AUTHENTICATE.PARAMS.URL, params.url);
	}
	if (params.dev === true) {
		contextBuilder.addFlag(FLAGS.DEVELOPMENTMODE);
	}

	return executeWithSpinner({
		action: sdkExecutor.execute(contextBuilder.build(), cancelToken),
		message: NodeTranslationService.getMessage(UTILS.AUTHENTICATION.STARTING_OAUTH_FLOW),
	})
		.then((operationResult) => {
			if (!isSuccess(operationResult)) {
				return AuthenticateActionResult.Builder.withErrors(operationResult.errorMessages).build();
			}
			setDefaultAuthentication(projectFolder, authId);
			return AuthenticateActionResult.Builder.success()
				.withMode(COMMANDS.AUTHENTICATE.MODES.OAUTH)
				.withAuthId(authId)
				.withAccountInfo(operationResult.data.accountInfo)
				.build();
		})
		.catch((error) => AuthenticateActionResult.Builder.withErrors([error]).build());
}
