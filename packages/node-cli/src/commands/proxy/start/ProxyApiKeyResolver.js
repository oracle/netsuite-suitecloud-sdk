/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { executeWithSpinner } = require('../../../ui/CliSpinner');
const SdkExecutionContext = require('../../../SdkExecutionContext');
const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');
const SdkExecutor = require('../../../SdkExecutor');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const { COMMAND_PROXY_START } = require('../../../services/TranslationKeys');
const ProxyApiKeyExtractor = require('./ProxyApiKeyExtractor');

const READ_CLIENT_API_KEY_CLI_COMMAND = 'readclientapikeycontent';

const resolveClientApiKey = async ({ sdkPath, executionEnvironmentContext }) => {
	const executionContext = SdkExecutionContext.Builder.forCommand(READ_CLIENT_API_KEY_CLI_COMMAND)
		.integration()
		.addFlags([])
		.build();

	const sdkExecutor = new SdkExecutor(sdkPath, executionEnvironmentContext);
	const operationResult = await executeWithSpinner({
		action: sdkExecutor.execute(executionContext),
		message: NodeTranslationService.getMessage(COMMAND_PROXY_START.MESSAGES.READING_CLIENT_API_CONTENTS),
	});

	if (operationResult.errorMessages && operationResult.errorMessages.length > 0) {
		throw operationResult.errorMessages;
	}

	if (operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS) {
		return ProxyApiKeyExtractor.extractApiKey(operationResult.data);
	}

	throw NodeTranslationService.getMessage(COMMAND_PROXY_START.ERRORS.READING_CLIENT_API_CONTENTS);
};

module.exports = {
	resolveClientApiKey,
};
