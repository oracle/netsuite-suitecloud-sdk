/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const path = require('path');
const os = require('os');
const { ActionResult } = require('../../../services/actionresult/ActionResult');
const BaseAction = require('../../base/BaseAction');
const { readClientAPIKeyFileContents, writeClientAPIKeyFileContents } = require('../../../utils/ClientAPIKeyUtils');
const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');
const { FILES, FOLDERS } = require('../../../ApplicationConstants');
const {
	COMMAND_PROXY_GENERATEKEY : { ERRORS : { UNABLE_TO_GENERATE_KEY } },
	UTILS: { CLIENT_API_KEY_UTILS },
} = require('../../../services/TranslationKeys');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const {
	buildProxyGenerateKeyResult,
	PROXY_GENERATE_KEY_ERROR,
} = require('@oracle/suitecloud-sdk-core/commands/proxy/generatekey/ProxyGenerateKeyHandler');

const CLIENT_API_KEY_FILEPATH = path.join(os.homedir(), FOLDERS.SUITECLOUD_SDK, FILES.CLIENT_API_KEY);

module.exports = class ProxyGenerateKeyAction extends BaseAction {
	constructor(options) {
		super(options);
	}

	async execute() {
		try {
			const readOperationResult = await readClientAPIKeyFileContents(this._sdkExecutor);
			const generateKeyResult = buildProxyGenerateKeyResult(readOperationResult.data);
			if (generateKeyResult.validationError) {
				const validationMessage =
					generateKeyResult.validationError.errorCode === PROXY_GENERATE_KEY_ERROR.INVALID_KEY_FILE_CONTENTS
						? NodeTranslationService.getMessage(CLIENT_API_KEY_UTILS.ERRORS.INVALID_FILE_CONTENTS, CLIENT_API_KEY_FILEPATH)
						: NodeTranslationService.getMessage(UNABLE_TO_GENERATE_KEY);
				return ActionResult.Builder.withErrors([
					NodeTranslationService.getMessage(UNABLE_TO_GENERATE_KEY),
					validationMessage,
				]).build();
			}

			const writeOperationResult = await writeClientAPIKeyFileContents(
				this._sdkExecutor,
				generateKeyResult.updatedClientApiKeyContent
			);

			return writeOperationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
				? ActionResult.Builder.withData({ "proxyAPIKey": generateKeyResult.proxyAPIKey }).build()
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
