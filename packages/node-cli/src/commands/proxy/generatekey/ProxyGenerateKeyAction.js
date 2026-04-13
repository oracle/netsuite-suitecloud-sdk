/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ActionResult } = require('../../../services/actionresult/ActionResult');
const BaseAction = require('../../base/BaseAction');
const APIKeyGenerator = require('../../../utils/APIKeyGenerator');
const ClientApiKeyDTO = require('../../../utils/ClientApiKeyDTO');
const { readClientAPIKeyFileContents, writeClientAPIKeyFileContents } = require('../../../utils/ClientApiKeyUtils');
const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');
const { COMMAND_PROXY_GENERATEKEY : { ERRORS : { UNABLE_TO_GENERATE_KEY } } } = require('../../../services/TranslationKeys');
const NodeTranslationService = require('../../../services/NodeTranslationService');

module.exports = class ProxyGenerateKeyAction extends BaseAction {
	constructor(options) {
		super(options);
	}

	async execute() {
		try {
			const newApiKey = APIKeyGenerator.generateApiKey();
			const existingFileContent = await readClientAPIKeyFileContents(this._sdkExecutor);
			const clientApiKeyFileContents = ClientApiKeyDTO.Builder
				.fromRawString(existingFileContent.data)
				.withNewProxyKey(newApiKey)
				.build();

			const writeOperationResult = await writeClientAPIKeyFileContents(
				this._sdkExecutor,
				clientApiKeyFileContents.toNormalizedString()
			);

			return writeOperationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
				? ActionResult.Builder.withData({ newApiKey }).build()
				: ActionResult.Builder.withErrors(
					[NodeTranslationService.getMessage(UNABLE_TO_GENERATE_KEY), writeOperationResult.errorMessages]).build();

		} catch (error) {
			const errorMessages = Array.isArray(error) ? error : [error];
			return ActionResult.Builder.withErrors([
				NodeTranslationService.getMessage(UNABLE_TO_GENERATE_KEY),
				...errorMessages,
			]).build();
		}
	}
};
