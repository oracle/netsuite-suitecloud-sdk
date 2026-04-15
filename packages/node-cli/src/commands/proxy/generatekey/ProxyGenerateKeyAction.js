/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ActionResult } = require('../../../services/actionresult/ActionResult');
const BaseAction = require('../../base/BaseAction');
const { generateAPIKey } = require('../../../utils/APIKeyGenerator');
const { parseClientApiKeyContent, setProxyKey } = require('../../../utils/ClientAPIKeyFileContent');
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
			const newApiKey = generateAPIKey();
			const readOperationResult = await readClientAPIKeyFileContents(this._sdkExecutor);
			const clientApiKeyFileContents = parseClientApiKeyContent(readOperationResult.data);
			clientApiKeyFileContents.setDefaultProxyKey(newApiKey);

			const writeOperationResult = await writeClientAPIKeyFileContents(
				this._sdkExecutor,
				clientApiKeyFileContents.toCommandlineCompatibleString()
			);

			return writeOperationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
				? ActionResult.Builder.withData({ "proxyAPIKey": newApiKey }).build()
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
