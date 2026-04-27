/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const SdkExecutor = require('../../../SdkExecutor');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const { COMMAND_PROXY_START } = require('../../../services/TranslationKeys');
const { readClientAPIKeyFileContents } = require('../../../utils/ClientAPIKeyUtils');
const { ClientAPIKeyObjectWrapper } = require('../../../utils/ClientAPIKeyObjectWrapper');

const resolveClientApiKey = async ({ sdkPath, executionEnvironmentContext }) => {
	const sdkExecutor = new SdkExecutor(sdkPath, executionEnvironmentContext);
	const readOperationResult = await readClientAPIKeyFileContents(sdkExecutor);
	const clientApiKeyObjectWrapper = new ClientAPIKeyObjectWrapper(readOperationResult.data);
	const apiKey = clientApiKeyObjectWrapper.getDefaultKeyValue();

	if (typeof apiKey !== 'string' || !apiKey.trim()) {
		throw NodeTranslationService.getMessage(COMMAND_PROXY_START.ERRORS.MISSING_API_KEY);
	}

	return {
		apiKey,
	};
};

module.exports = {
	resolveClientApiKey,
};
