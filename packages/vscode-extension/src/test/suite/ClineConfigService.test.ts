/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import ClineConfigService, {
	ApplyPanelClineConfigInput,
	ClineConfigStorage,
} from '../../service/controlPanel/devAssist/cline/ClineConfigService';

const PENDING_CONFIG_STORAGE_KEY = 'suitecloud.controlPanel.pendingClineConfig.v1';

const baseInput: ApplyPanelClineConfigInput = {
	isProxyAvailable: true,
	isConfigInSync: false,
	scope: 'user',
	workspacePath: '/workspace',
	baseUrl: 'http://localhost:7777',
	modelId: 'NetSuite',
	resolveApiKey: async () => 'secret',
};

const createStorage = (initialValue?: unknown) => {
	const values = new Map<string, unknown>();
	if (initialValue !== undefined) {
		values.set(PENDING_CONFIG_STORAGE_KEY, initialValue);
	}
	const storage: ClineConfigStorage = {
		get: <T>(key: string) => values.get(key) as T | undefined,
		update: async (key: string, value: unknown) => {
			if (value === undefined) {
				values.delete(key);
			} else {
				values.set(key, value);
			}
		},
	};
	return { storage, values };
};

suite('Control Panel Cline Config Service', () => {
	test('does nothing when no pending config exists', async () => {
		const { storage } = createStorage();
		let apiKeyResolved = false;
		const service = new ClineConfigService(
			{
				applyConfig: async () => ({ applied: true, message: 'applied' }),
				checkConfigSync: async () => ({ comparable: true, inSync: true, message: 'in sync' }),
			},
			storage,
			async () => undefined
		);

		const applied = await service.applyPendingConfig('/workspace', async () => {
			apiKeyResolved = true;
			return 'secret';
		});

		assert.strictEqual(applied, false);
		assert.strictEqual(apiKeyResolved, false);
	});

	test('applies, verifies, and clears a pending config', async () => {
		const pendingConfig = { baseUrl: 'http://localhost:9000', modelId: 'NetSuite' };
		const { storage, values } = createStorage(pendingConfig);
		const receivedInputs: unknown[] = [];
		let sleepDuration = 0;
		const service = new ClineConfigService(
			{
				applyConfig: async (input) => {
					receivedInputs.push(input);
					return { applied: true, message: 'applied' };
				},
				checkConfigSync: async (input) => {
					receivedInputs.push(input);
					return { comparable: true, inSync: true, message: 'in sync' };
				},
			},
			storage,
			async (milliseconds) => {
				sleepDuration = milliseconds;
			}
		);

		const applied = await service.applyPendingConfig('/workspace', async () => 'secret');

		assert.strictEqual(applied, true);
		assert.strictEqual(sleepDuration, 750);
		assert.strictEqual(receivedInputs.length, 2);
		assert.deepStrictEqual(receivedInputs[0], receivedInputs[1]);
		assert.strictEqual(values.has(PENDING_CONFIG_STORAGE_KEY), false);
	});

	test('keeps pending config when verification fails', async () => {
		const pendingConfig = { baseUrl: 'http://localhost:9000', modelId: 'NetSuite' };
		const { storage, values } = createStorage(pendingConfig);
		const service = new ClineConfigService(
			{
				applyConfig: async () => ({ applied: true, message: 'applied' }),
				checkConfigSync: async () => ({ comparable: true, inSync: false, message: 'not in sync' }),
			},
			storage,
			async () => undefined
		);

		await assert.rejects(
			service.applyPendingConfig('/workspace', async () => 'secret'),
			/not in sync/
		);
		assert.deepStrictEqual(values.get(PENDING_CONFIG_STORAGE_KEY), pendingConfig);
	});

	test('returns early outcomes without resolving secrets or writing config', async () => {
		const { storage, values } = createStorage();
		let apiKeyResolved = false;
		const service = new ClineConfigService(
			{
				applyConfig: async () => ({ applied: true, message: 'applied' }),
				checkConfigSync: async () => ({ comparable: true, inSync: true, message: 'in sync' }),
			},
			storage,
			async () => undefined
		);
		const resolveApiKey = async () => {
			apiKeyResolved = true;
			return 'secret';
		};

		assert.deepStrictEqual(
			await service.applyPanelConfig({ ...baseInput, isProxyAvailable: false, resolveApiKey }),
			{ kind: 'proxyUnavailable' }
		);
		assert.deepStrictEqual(
			await service.applyPanelConfig({ ...baseInput, scope: 'workspace', resolveApiKey }),
			{ kind: 'workspaceManual' }
		);
		assert.deepStrictEqual(
			await service.applyPanelConfig({ ...baseInput, isConfigInSync: true, resolveApiKey }),
			{ kind: 'alreadyInSync' }
		);
		assert.strictEqual(apiKeyResolved, false);
		assert.strictEqual(values.size, 0);
	});

	test('reports a missing API key without invoking the adapter', async () => {
		const { storage } = createStorage();
		let adapterCalled = false;
		const service = new ClineConfigService(
			{
				applyConfig: async () => {
					adapterCalled = true;
					return { applied: true, message: 'applied' };
				},
				checkConfigSync: async () => ({ comparable: true, inSync: true, message: 'in sync' }),
			},
			storage,
			async () => undefined
		);

		const outcome = await service.applyPanelConfig({
			...baseInput,
			resolveApiKey: async () => undefined,
		});

		assert.deepStrictEqual(outcome, { kind: 'missingApiKey' });
		assert.strictEqual(adapterCalled, false);
	});

	test('returns adapter failures without persisting pending config', async () => {
		const { storage, values } = createStorage();
		const service = new ClineConfigService(
			{
				applyConfig: async () => ({ applied: false, message: 'write failed' }),
				checkConfigSync: async () => ({ comparable: true, inSync: true, message: 'in sync' }),
			},
			storage,
			async () => undefined
		);

		const outcome = await service.applyPanelConfig(baseInput);

		assert.deepStrictEqual(outcome, { kind: 'applyFailed', message: 'write failed' });
		assert.strictEqual(values.size, 0);
	});

	test('persists successful panel config before the verification delay', async () => {
		const { storage, values } = createStorage();
		let configWasStoredBeforeSleep = false;
		const service = new ClineConfigService(
			{
				applyConfig: async () => ({ applied: true, message: 'applied' }),
				checkConfigSync: async () => ({ comparable: true, inSync: true, message: 'in sync' }),
			},
			storage,
			async () => {
				configWasStoredBeforeSleep = values.has(PENDING_CONFIG_STORAGE_KEY);
			}
		);

		const outcome = await service.applyPanelConfig(baseInput);

		assert.deepStrictEqual(outcome, { kind: 'applied' });
		assert.strictEqual(configWasStoredBeforeSleep, true);
		assert.deepStrictEqual(values.get(PENDING_CONFIG_STORAGE_KEY), {
			baseUrl: baseInput.baseUrl,
			modelId: baseInput.modelId,
		});
	});
});
