/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { dirname } from 'path';
import * as vscode from 'vscode';
import { VSCODE_PLATFORM } from '../../../ApplicationConstants';
import SuiteCloudRunner from '../../../core/SuiteCloudRunner';
import { getSdkPath } from '../../../core/sdksetup/SdkProperties';
import VSConsoleLogger from '../../../loggers/VSConsoleLogger';
import { ActionResult } from '../../../types/ActionResult';
import type { RawSdkOperationResult } from '../../../types/JavascriptNodeCli';
import {
	ClientAPIKeyObjectWrapper,
	ExecutionEnvironmentContext,
	readClientAPIKeyFileContents,
	SdkExecutor,
} from '../../../util/ExtensionUtil';
import type { ApiKeyStorage } from './ApiKeyService';

type ProxyGenerateKeyData = {
	proxyAPIKey?: string;
};

type StoredApiKeyReader = () => Promise<RawSdkOperationResult<string>>;
type ApiKeyGenerator = () => Promise<ActionResult<ProxyGenerateKeyData>>;

const readStoredProxyApiKey = async (): Promise<RawSdkOperationResult<string>> => {
	const executionEnvironmentContext = new ExecutionEnvironmentContext({
		platform: VSCODE_PLATFORM,
		platformVersion: vscode.version,
	});
	const sdkExecutor = new SdkExecutor(getSdkPath(), executionEnvironmentContext);
	return readClientAPIKeyFileContents(sdkExecutor);
};

const generateAndStoreProxyApiKey = (): Promise<ActionResult<ProxyGenerateKeyData>> =>
	new SuiteCloudRunner(new VSConsoleLogger(), dirname(getSdkPath())).run({
		commandName: 'proxy:generatekey',
		arguments: {},
	});

export default class SdkApiKeyStorage implements ApiKeyStorage {
	constructor(
		private readonly _readStoredApiKey: StoredApiKeyReader = readStoredProxyApiKey,
		private readonly _generateApiKey: ApiKeyGenerator = generateAndStoreProxyApiKey
	) {}

	async getProxyApiKeyFromSdkStorage(): Promise<string | undefined> {
		const readResult = await this._readStoredApiKey();
		if (readResult.status !== 'SUCCESS' || typeof readResult.data !== 'string') {
			throw new Error(
				readResult.errorMessages.join('\n') || 'Unable to read proxy API key storage.'
			);
		}
		const apiKey = new ClientAPIKeyObjectWrapper(readResult.data).getDefaultKeyValue();
		return typeof apiKey === 'string' && apiKey.trim() ? apiKey.trim() : undefined;
	}

	async generateProxyApiKey(): Promise<string> {
		const result = await this._generateApiKey();
		if (!result.isSuccess()) {
			throw new Error(
				result.errorMessages?.join('\n') || 'Unable to generate and persist proxy API key.'
			);
		}

		const apiKey = result.data?.proxyAPIKey;
		if (typeof apiKey !== 'string' || !apiKey.trim()) {
			throw new Error('Generated proxy API key is empty.');
		}
		return apiKey.trim();
	}
}
