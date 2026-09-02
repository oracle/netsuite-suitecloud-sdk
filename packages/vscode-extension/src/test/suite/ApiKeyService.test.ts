/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import ApiKeyService, {
	ApiKeyStorage,
} from '../../service/controlPanel/devAssist/ApiKeyService';

const createStorage = (storedApiKey?: string): ApiKeyStorage => ({
	getProxyApiKeyFromSdkStorage: async () => storedApiKey,
	generateProxyApiKey: async () => 'generated-secret',
});

suite('Control Panel API Key Service', () => {
	test('loads and masks an existing SDK API key', async () => {
		const service = new ApiKeyService(createStorage('stored-secret'), () => undefined);

		const result = await service.resolve(false);

		assert.strictEqual(result.apiKey, 'stored-secret');
		assert.strictEqual(result.displayState.apiKeySource, 'sdk');
		assert.strictEqual(result.displayState.maskedApiKey, '*cret');
		assert.strictEqual(result.displayState.apiKeyVisible, false);
		assert.strictEqual(result.displayState.apiKeyExists, true);
		service.dispose();
	});

	test('generates an API key and exposes it only through the preview window', async () => {
		const service = new ApiKeyService(createStorage(), () => undefined);

		const result = await service.generate();

		assert.strictEqual(result.displayState.apiKeySource, 'generated');
		assert.strictEqual(result.displayState.apiKeyVisible, true);
		assert.ok(result.displayState.apiKeyVisibleUntilMs);
		assert.strictEqual(service.getCopyableApiKey(), 'generated-secret');
		service.dispose();
		assert.strictEqual(service.getCopyableApiKey(), undefined);
	});

	test('returns the missing-key presentation when storage is empty', async () => {
		const service = new ApiKeyService(createStorage(), () => undefined);

		const result = await service.resolve(false);

		assert.strictEqual(result.apiKey, undefined);
		assert.strictEqual(result.displayState.apiKeySource, 'unknown');
		assert.strictEqual(result.displayState.apiKeyExists, false);
		assert.strictEqual(result.displayState.maskedApiKey, 'No API key found');
		service.dispose();
	});

	test('generates a key when required and SDK storage is empty', async () => {
		const service = new ApiKeyService(createStorage(), () => undefined);

		const result = await service.resolve(true);

		assert.strictEqual(result.apiKey, 'generated-secret');
		assert.strictEqual(result.displayState.apiKeySource, 'generated');
		assert.strictEqual(result.displayState.apiKeyExists, true);
		service.dispose();
	});

	test('only propagates storage failures when a key is required', async () => {
		const storageError = new Error('secure storage unavailable');
		const storage: ApiKeyStorage = {
			getProxyApiKeyFromSdkStorage: async () => {
				throw storageError;
			},
			generateProxyApiKey: async () => 'generated-secret',
		};
		const service = new ApiKeyService(storage, () => undefined);

		const optionalResult = await service.resolve(false);
		assert.strictEqual(optionalResult.apiKey, undefined);
		await assert.rejects(service.resolve(true), storageError);
		service.dispose();
	});
});
