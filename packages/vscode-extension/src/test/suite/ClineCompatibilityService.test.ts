/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import ClineCompatibilityService from '../../service/controlPanel/ClineCompatibilityService';

const baseInput = {
	isExtensionInstalled: true,
	scope: 'user' as const,
	workspacePath: '/workspace',
	apiKey: 'secret',
	baseUrl: 'http://localhost:7777',
	modelId: 'NetSuite',
};

suite('Control Panel Cline Compatibility Service', () => {
	test('reports an unavailable extension without consulting Cline storage', async () => {
		let adapterCalled = false;
		const service = new ClineCompatibilityService({
			checkCompatibility: async () => {
				adapterCalled = true;
				return { compatible: true, message: 'compatible' };
			},
			checkConfigSync: async () => {
				adapterCalled = true;
				return { comparable: true, inSync: true, message: 'in sync' };
			},
		});

		const result = await service.evaluate({ ...baseInput, isExtensionInstalled: false });

		assert.strictEqual(result.isClineCompatible, false);
		assert.strictEqual(result.clineCompatibilityMessage, 'Cline is not installed.');
		assert.strictEqual(adapterCalled, false);
	});

	test('keeps workspace configuration as a manual flow', async () => {
		let adapterCalled = false;
		const service = new ClineCompatibilityService({
			checkCompatibility: async () => {
				adapterCalled = true;
				return { compatible: true, message: 'compatible' };
			},
			checkConfigSync: async () => {
				adapterCalled = true;
				return { comparable: true, inSync: true, message: 'in sync' };
			},
		});

		const result = await service.evaluate({ ...baseInput, scope: 'workspace' });

		assert.strictEqual(result.isClineCompatible, true);
		assert.strictEqual(result.isClineConfigInSync, false);
		assert.match(result.clineConfigSyncMessage || '', /Copy Base URL and Model ID/);
		assert.strictEqual(adapterCalled, false);
	});

	test('preserves an adapter incompatibility result', async () => {
		const service = new ClineCompatibilityService({
			checkCompatibility: async () => ({ compatible: false, message: 'Unsupported Cline version.' }),
			checkConfigSync: async () => ({ comparable: true, inSync: true, message: 'in sync' }),
		});

		const result = await service.evaluate(baseInput);

		assert.strictEqual(result.isClineCompatible, false);
		assert.strictEqual(result.clineCompatibilityMessage, 'Unsupported Cline version.');
		assert.match(result.clineConfigSyncMessage || '', /Copy Base URL and API key manually/);
	});

	test('does not check sync until an API key is available', async () => {
		let syncChecked = false;
		const service = new ClineCompatibilityService({
			checkCompatibility: async () => ({ compatible: true, message: 'compatible' }),
			checkConfigSync: async () => {
				syncChecked = true;
				return { comparable: true, inSync: true, message: 'in sync' };
			},
		});

		const result = await service.evaluate({ ...baseInput, apiKey: undefined });

		assert.strictEqual(result.isClineCompatible, true);
		assert.strictEqual(result.isClineConfigInSync, false);
		assert.match(result.clineConfigSyncMessage || '', /Generate or rotate API key/);
		assert.strictEqual(syncChecked, false);
	});

	test('reports the current config sync result', async () => {
		const service = new ClineCompatibilityService({
			checkCompatibility: async () => ({ compatible: true, message: 'compatible' }),
			checkConfigSync: async (input) => {
				assert.deepStrictEqual(input, {
					scope: 'user',
					workspacePath: '/workspace',
					apiKey: 'secret',
					baseUrl: 'http://localhost:7777',
					modelId: 'NetSuite',
				});
				return { comparable: true, inSync: true, message: 'Configuration is current.' };
			},
		});

		const result = await service.evaluate(baseInput);

		assert.strictEqual(result.isClineCompatible, true);
		assert.strictEqual(result.isClineConfigInSync, true);
		assert.strictEqual(result.clineConfigSyncMessage, 'Configuration is current.');
	});
});
