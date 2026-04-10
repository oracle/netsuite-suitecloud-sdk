/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const NodeTranslationService = require('../services/NodeTranslationService');
const { UTILS: { CLIENT_API_KEY_UTILS }, } = require('../services/TranslationKeys');
const { executeWithSpinner } = require('../ui/CliSpinner');
const SdkExecutionContext = require('../SdkExecutionContext');

const COMMANDS = {
	CLIENT_API_KEY: {
		READ_FILE_CONTENT: {
			SDK_COMMAND: 'readclientapikeycontent',
		},
		WRITE_FILE_CONTENT: {
			SDK_COMMAND: 'writeclientapicontent',
			PARAMS: {
				CONTENT: 'content'
			}
		}
	}
};

/**
 * @param {SdkExecutor} sdkExecutor
 * @returns {Promise<SdkOperationResult>}
 */
async function readClientAPIKeyFileContents(sdkExecutor) {
	const executionContext = SdkExecutionContext.Builder.forCommand(COMMANDS.CLIENT_API_KEY.READ_FILE_CONTENT.SDK_COMMAND)
		.integration()
		.build();

	return await executeWithSpinner({
		action: sdkExecutor.execute(executionContext),
		message: NodeTranslationService.getMessage(CLIENT_API_KEY_UTILS.READING_FILE_CONTENTS),
	}).catch((error) => {
		throw [NodeTranslationService.getMessage(CLIENT_API_KEY_UTILS.ERRORS.READING_FILE_CONTENTS), error];
	})
}

/**
 * @param {SdkExecutor} sdkExecutor
 * @param {string} newStringifiedFileContent must not contain any '"' double quote character to avoid shell quoting/escaping issues
 * @returns {Promise<SdkOperationResult>}
 */
async function writeClientAPIKeyFileContents(sdkExecutor, newStringifiedFileContent) {
	const executionContext = SdkExecutionContext.Builder.forCommand(COMMANDS.CLIENT_API_KEY.WRITE_FILE_CONTENT.SDK_COMMAND)
		.integration()
		.addParam(COMMANDS.CLIENT_API_KEY.WRITE_FILE_CONTENT.PARAMS.CONTENT, newStringifiedFileContent)
		.build();

	return await executeWithSpinner({
		action: sdkExecutor.execute(executionContext),
		message: NodeTranslationService.getMessage(CLIENT_API_KEY_UTILS.WRITING_FILE_CONTENTS),
	}).catch((error) => {
		throw [NodeTranslationService.getMessage(CLIENT_API_KEY_UTILS.ERRORS.WRITING_FILE_CONTENTS), error];
	})
}

module.exports = { readClientAPIKeyFileContents, writeClientAPIKeyFileContents };
