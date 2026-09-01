/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import SdkApiKeyStorage from '../../service/controlPanel/devAssist/SdkApiKeyStorage';
import type { ActionResult } from '../../types/ActionResult';
import type { RawSdkOperationResult } from '../../types/JavascriptNodeCli';

const createActionResult = (
	isSuccess: boolean,
	proxyAPIKey?: string,
	errorMessages: string[] = []
): ActionResult<{ proxyAPIKey?: string }> => ({
	status: isSuccess ? 'SUCCESS' : 'ERROR',
	resultMessage: '',
	errorMessages,
	data: { proxyAPIKey },
	isSuccess: () => isSuccess,
});

const createReadResult = (
	value = 'stored-secret'
): RawSdkOperationResult<string> => ({
	status: 'SUCCESS',
	data: JSON.stringify({
		schemaVersion: 1,
		defaultKey: 'proxyKey',
		keys: {
			proxyKey: {
				creationDate: '2026-09-01T00:00:00.000Z',
				value,
			},
		},
	}),
	errorMessages: [],
});

suite('Control Panel SDK API Key Storage', () => {
	test('reads the existing key through the SDK storage adapter', async () => {
		const storage = new SdkApiKeyStorage(
			async () => createReadResult(),
			async () => createActionResult(true, 'unused')
		);

		assert.strictEqual(await storage.getProxyApiKeyFromSdkStorage(), 'stored-secret');
	});

	test('uses the canonical proxy:generatekey result', async () => {
		const storage = new SdkApiKeyStorage(
			async () => createReadResult(''),
			async () => createActionResult(true, ' generated-secret ')
		);

		assert.strictEqual(await storage.generateProxyApiKey(), 'generated-secret');
	});

	test('preserves command errors when key generation fails', async () => {
		const storage = new SdkApiKeyStorage(
			async () => createReadResult(''),
			async () => createActionResult(false, undefined, ['Unable to write API key.'])
		);

		await assert.rejects(storage.generateProxyApiKey(), /Unable to write API key/);
	});

	test('rejects a successful command with an empty key', async () => {
		const storage = new SdkApiKeyStorage(
			async () => createReadResult(''),
			async () => createActionResult(true, ' ')
		);

		await assert.rejects(storage.generateProxyApiKey(), /Generated proxy API key is empty/);
	});

	test('reports a plain SDK read error without requiring isSuccess()', async () => {
		const storage = new SdkApiKeyStorage(
			async () => ({
				status: 'ERROR',
				errorMessages: ['Unable to read client API key file.'],
			}),
			async () => createActionResult(true, 'unused')
		);

		await assert.rejects(
			storage.getProxyApiKeyFromSdkStorage(),
			/Unable to read client API key file/
		);
	});
});
