/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ActionResult } = require('../../../services/actionresult/ActionResult');
const BaseAction = require('../../base/BaseAction');
const { generateApiKey } = require('../../../utils/APIKeyGenerator');
const SdkExecutionContext = require('../../../SdkExecutionContext');
const { executeWithSpinner } = require('../../../ui/CliSpinner');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');

const PROXY_KEY = 'PROXY_KEY';
const READ_CLIENT_API_CONTENT_CLI_COMMAND = 'readclientapikeycontent';
const WRITE_CLIENT_API_CONTENT_CLI_COMMAND = 'writeclientapicontent';


module.exports = class ProxyGenerateKeyAction extends BaseAction {
	constructor(options) {
		super(options);
	}

	async execute() {
		try {
			//1.- Get the current contents of client_api_key.p12
			const clientApiContents = await this._readClientAPIContents();
			//2.- Generate the API Key
			const apiKey = generateApiKey();
			//3.- Generate/update the new JSON Api Key
			const newClientApiContent = this._modifyClientApiContentsWithNewKey(clientApiContents, apiKey);

			const updatedClientApiContentsJson = this._normalizeJsonString(newClientApiContent);
			await this._writeClientAPIContents(updatedClientApiContentsJson);

			return ActionResult.Builder.withData({ apiKey: apiKey }).build();
		} catch (err_) {
			return ActionResult.Builder.withErrors(Array.isArray(err_) ? err_ : [err_]).build();
		}
	}

	_normalizeJsonString(jsonString) {
		return JSON.stringify(jsonString).replaceAll('"', String.raw`\"`);
	}

	_modifyClientApiContentsWithNewKey(clientApiContents, newApiKey) {
		try {
			const newClientApiContents = (clientApiContents) ?
				JSON.parse(clientApiContents)
				: {};

			if (Object.hasOwn(newClientApiContents, PROXY_KEY)) {
				delete newClientApiContents[PROXY_KEY];
			}

			newClientApiContents[PROXY_KEY] = {
				creationDate: new Date().toISOString(),
				apiKey: newApiKey,
			};
			return newClientApiContents;

		} catch (err) {
			throw ['Client API contents must be a valid format. Please, delete client_api_key.p12 file and try again', err];
		}
	}

	async _readClientAPIContents() {
		const executionContext = SdkExecutionContext.Builder.forCommand(READ_CLIENT_API_CONTENT_CLI_COMMAND)
			.integration()
			.addFlags([])
			.build();

		const operationResult = await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: 'Reading Client API Contents', //TODO move to language files
		});

		if (operationResult.errorMessages && operationResult.errorMessages.length > 0) {
			throw operationResult.errorMessages;
		}

		if (operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS) {
			return operationResult.data;
		} else {
			throw new Error('Error reading Client API contents');  //TODO move to language files
		}
	}

	async _writeClientAPIContents(proxyKeyJson) {
		const executionContext = SdkExecutionContext.Builder.forCommand(WRITE_CLIENT_API_CONTENT_CLI_COMMAND)
			.integration()
			.addParam('content', proxyKeyJson) //TODO content to a const
			.build();
		const operationResult = await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: 'Writing Client API Contents', //TODO move to language files
		});

		if (operationResult.errorMessages && operationResult.errorMessages.length > 0) {
			throw operationResult.errorMessages;
		}

		if (operationResult.status !== SdkOperationResultUtils.STATUS.SUCCESS) {
			throw new Error('Error reading writing API contents');  //TODO move to language files
		}

	}
};
