/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const NodeTranslationService = require('../services/NodeTranslationService');
const { UTILS: { CLIENT_API_KEY_UTILS }, } = require('../services/TranslationKeys');
const { executeWithSpinner } = require('../ui/CliSpinner');
const SdkExecutionContext = require('../SdkExecutionContext');
const SdkOperationResultUtils = require('./SdkOperationResultUtils');

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
		throw [NodeTranslationService.getMessage(CLIENT_API_KEY_UTILS.ERRORS.READING_FILE_CONTENTS, error),];
	});

	if (operationResult.status === SdkOperationResultUtils.STATUS.ERROR) {
		throw [NodeTranslationService.getMessage(CLIENT_API_KEY_UTILS.ERRORS.READING_FILE_CONTENTS, operationResult.errorMessages)];
	}
	return operationResult;
}

/**
 * @param {SdkExecutor} sdkExecutor
 * @param {string} newFileContent must start and end with '"' double quote character, but the rest of in-between "' should be escaped '\"' to avoid shell quoting/escaping issues
 * @returns {Promise<SdkOperationResult>}
 */
async function writeClientAPIKeyFileContents(sdkExecutor, newFileContent) {
	const executionContext = SdkExecutionContext.Builder.forCommand(COMMANDS.CLIENT_API_KEY.WRITE_FILE_CONTENT.SDK_COMMAND)
		.integration()
		.addParam(COMMANDS.CLIENT_API_KEY.WRITE_FILE_CONTENT.PARAMS.CONTENT, newFileContent)
		.build();

	return await executeWithSpinner({
		action: sdkExecutor.execute(executionContext),
		message: NodeTranslationService.getMessage(CLIENT_API_KEY_UTILS.WRITING_FILE_CONTENTS),
	}).catch((error) => {
		throw [NodeTranslationService.getMessage(CLIENT_API_KEY_UTILS.ERRORS.WRITING_FILE_CONTENTS), error];
	})
}

module.exports = { readClientAPIKeyFileContents, writeClientAPIKeyFileContents };
