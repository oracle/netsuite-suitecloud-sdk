/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const NodeTranslationService = require('../services/NodeTranslationService');
const { UTILS: { CLIENT_API_KEY_UTILS }, COMMAND_PROXY_START } = require('../services/TranslationKeys');
const { executeWithSpinner } = require('../ui/CliSpinner');
const SdkExecutionContext = require('../SdkExecutionContext');
const SdkOperationResultUtils = require('./SdkOperationResultUtils');
const { ClientAPIKeyObjectWrapper } = require('./ClientAPIKeyObjectWrapper');

const COMMANDS = {
	CLIENT_API_KEY: {
		READ_FILE_CONTENT: {
			SDK_COMMAND: 'readclientapikeycontent',
		},
		WRITE_FILE_CONTENT: {
			SDK_COMMAND: 'writeclientapikeycontent',
			PARAMS: {
				CONTENT: 'content'
			}
		}
	}
};

/**
 * @param {SdkExecutor} sdkExecutor
 * @returns {Promise<SdkOperationResult>} which contains the contents of 'client_api_key.p12' as string, within the .data parameter
 */
async function readClientAPIKeyFileContents(sdkExecutor) {
	const executionContext = SdkExecutionContext.Builder.forCommand(COMMANDS.CLIENT_API_KEY.READ_FILE_CONTENT.SDK_COMMAND)
		.integration()
		.build();

	const operationResult = await executeWithSpinner({
		action: sdkExecutor.execute(executionContext),
		message: NodeTranslationService.getMessage(CLIENT_API_KEY_UTILS.READING_FILE_CONTENTS),
	}).catch((error) => {
		throw [NodeTranslationService.getMessage(CLIENT_API_KEY_UTILS.ERRORS.READING_FILE_CONTENTS), error];
	});

	if (operationResult.status === SdkOperationResultUtils.STATUS.ERROR) {
		throw [NodeTranslationService.getMessage(CLIENT_API_KEY_UTILS.ERRORS.READING_FILE_CONTENTS), operationResult.errorMessages];
	}
	return operationResult;
}

/**
 * @param {SdkExecutor} sdkExecutor
 * @param {string} newFileContent raw JSON string to persist in client_api_key.p12
 * @returns {Promise<SdkOperationResult>}
 */
async function writeClientAPIKeyFileContents(sdkExecutor, newFileContent) {
	const executionContext = SdkExecutionContext.Builder.forCommand(COMMANDS.CLIENT_API_KEY.WRITE_FILE_CONTENT.SDK_COMMAND)
		.integration()
		// The SDK executor still assembles a shell command string, so keep that escaping
		// localized here instead of on the data model object itself.
		.addParam(COMMANDS.CLIENT_API_KEY.WRITE_FILE_CONTENT.PARAMS.CONTENT, formatForSdkCommandlineArgument(newFileContent))
		.build();

	const operationResult = await executeWithSpinner({
		action: sdkExecutor.execute(executionContext),
		message: NodeTranslationService.getMessage(CLIENT_API_KEY_UTILS.WRITING_FILE_CONTENTS),
	}).catch((error) => {
		throw [NodeTranslationService.getMessage(CLIENT_API_KEY_UTILS.ERRORS.WRITING_FILE_CONTENTS), error];
	});

	if (operationResult.status === SdkOperationResultUtils.STATUS.ERROR) {
		throw [NodeTranslationService.getMessage(CLIENT_API_KEY_UTILS.ERRORS.WRITING_FILE_CONTENTS), operationResult.errorMessages];
	}
	return operationResult;
}

/**
 * Resolves the default client API key used to authenticate requests sent to the local proxy server.
 *
 * @param {SdkExecutor} sdkExecutor
 * @returns {Promise<{apiKey: string}>} An object containing the resolved API key.
 * @throws {string|Array<string>} Throws translated/SDK errors when the key file cannot be read or parsed.
 */
async function resolveClientApiKey(sdkExecutor) {
	const readOperationResult = await readClientAPIKeyFileContents(sdkExecutor);
	const clientApiKeyObjectWrapper = new ClientAPIKeyObjectWrapper(readOperationResult.data);
	const apiKey = clientApiKeyObjectWrapper.getDefaultKeyValue();

	if (typeof apiKey !== 'string' || !apiKey.trim()) {
		throw NodeTranslationService.getMessage(COMMAND_PROXY_START.ERRORS.MISSING_API_KEY);
	}

	return {
		apiKey,
	};
}

function formatForSdkCommandlineArgument(fileContent) {
	return '"' + fileContent.replaceAll('"', String.raw`\"`) + '"';
}

module.exports = {
	readClientAPIKeyFileContents,
	resolveClientApiKey,
	writeClientAPIKeyFileContents,
};
