/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { installClineConversationIdentityAdapter } from '../../controlPanel/developerAssistant/cline/ConversationIdentityAdapter';

import ClineFileStore from '../../controlPanel/developerAssistant/cline/FileStore';
import { configureClineConversationIdentity } from '../../controlPanel/developerAssistant/cline/ConversationIdentityProfile';

const ADAPTER_NAME = 'suitecloud-conversation-identity.js';

suite('Cline Conversation Identity Adapter', () => {
	let workspace: string;

	setup(async () => {
		workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'suitecloud-cline-identity-'));
	});

	teardown(async () => {
		await fs.rm(workspace, { recursive: true, force: true });
	});

	test('publishes the bundled adapter once without overwriting user edits', async () => {
		const directory = path.join(workspace, '.cline', 'plugins');
		const destination = path.join(directory, ADAPTER_NAME);
		await installClineConversationIdentityAdapter(workspace);

		const original = await fs.readFile(destination);
		const installed = await fs.stat(destination);
		const sameAdapter = await fs.readFile(
			path.resolve(__dirname, '../../../resources/cline', ADAPTER_NAME)
		);
		assert.deepEqual(original, sameAdapter);
		await installClineConversationIdentityAdapter(workspace);
		assert.equal((await fs.stat(destination)).ino, installed.ino);

		await fs.writeFile(destination, 'user-owned code');
		await assert.rejects(() => installClineConversationIdentityAdapter(workspace));
		assert.equal(await fs.readFile(destination, 'utf8'), 'user-owned code');
		assert.deepEqual(await fs.readdir(directory), [ADAPTER_NAME]);
	});

	test('rejects a plugins directory pointing outside the workspace', async () => {
		const cline = path.join(workspace, '.cline');
		const other = await fs.mkdtemp(path.join(os.tmpdir(), 'suitecloud-cline-external-'));
		try {
			await fs.mkdir(cline);
			await fs.symlink(other, path.join(cline, 'plugins'), 'junction');
			await assert.rejects(() => installClineConversationIdentityAdapter(workspace));
			assert.deepEqual(await fs.readdir(other), []);
		} finally {
			await fs.rm(other, { recursive: true, force: true });
		}
	});

	test('adds a dedicated profile without changing existing profiles or rerouting a previous setup', async () => {
		const store = new ClineFileStore(path.join(workspace, 'cline-data'));
		const initial = { lastUsedProvider: 'openai-compatible', providers: {
			'openai-compatible': { settings: { model: 'unrelated-model' } },
		} };
		await store.writeJsonFile(store.providersFile, initial);
		const input = {
			workspacePath: workspace,
			baseUrl: 'http://127.0.0.1:18749/api/internal/devassist',
			apiKey: 'test-key',
			modelId: 'netsuite',
		};
		await configureClineConversationIdentity(store, input);
		const config = await store.readJsonFile(store.providersFile);
		assert.equal(config?.lastUsedProvider, initial.lastUsedProvider);
		assert.deepEqual(config?.providers?.['openai-compatible'], initial.providers['openai-compatible']);
		assert.equal(config?.providers?.['suitecloud-devassist']?.settings?.headers?.['x-netsuite-conversation-bridge'], 'cline-bundled-v1');
		await assert.rejects(() => configureClineConversationIdentity(store, {
			...input, baseUrl: 'http://127.0.0.1:18750/api/internal/devassist',
		}));
		assert.deepEqual(await store.readJsonFile(store.providersFile), config);
	});

	test('rejects a non-loopback model endpoint before provisioning', async () => {
		const store = new ClineFileStore(path.join(workspace, 'cline-data'));
		await assert.rejects(() => configureClineConversationIdentity(store, {
			workspacePath: workspace,
			baseUrl: 'https://example.com/api/internal/devassist',
			apiKey: 'test-key',
			modelId: 'netsuite',
		}));
		assert.deepEqual(await fs.readdir(workspace), []);
	});
});
