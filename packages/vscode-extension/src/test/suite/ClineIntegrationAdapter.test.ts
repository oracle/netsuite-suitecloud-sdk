/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import ClineIntegrationAdapter from '../../service/controlPanel/cline/IntegrationAdapter';
import ClineFileStore from '../../service/controlPanel/cline/FileStore';

const API_KEY = 'test-api-key';
const MODEL_ID = 'NetSuite';
const PANEL_BASE_URL = 'http://127.0.0.1:8283/api/internal/devassist';

suite('Cline Integration Adapter', () => {
	let dataDirectory: string;
	let fileStore: ClineFileStore;
	let adapter: ClineIntegrationAdapter;

	setup(async () => {
		dataDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'suitecloud-cline-sync-'));
		fileStore = new ClineFileStore(dataDirectory);
		adapter = new ClineIntegrationAdapter(fileStore);
		await fileStore.writeJsonFile(fileStore.providersFile, {
			providers: {
				'openai-compatible': {
					settings: {
						baseUrl: PANEL_BASE_URL,
						model: MODEL_ID,
						apiKey: API_KEY,
					},
				},
			},
		});
	});

	teardown(async () => {
		await fs.rm(dataDirectory, { recursive: true, force: true });
	});

	test('detects when active Cline state uses a different port than providers config', async () => {
		await fileStore.writeJsonFile(fileStore.globalStateFile, {
			actModeApiProvider: 'openai',
			planModeApiProvider: 'openai',
			openAiBaseUrl: 'http://127.0.0.1:8181/api/internal/devassist',
			actModeOpenAiModelId: MODEL_ID,
			planModeOpenAiModelId: MODEL_ID,
		});

		const result = await adapter.checkConfigSync({
			scope: 'user',
			workspacePath: dataDirectory,
			apiKey: API_KEY,
			baseUrl: PANEL_BASE_URL,
			modelId: MODEL_ID,
		});

		assert.strictEqual(result.comparable, true);
		assert.strictEqual(result.inSync, false);
		assert.strictEqual(
			result.message,
			'Cline uses different settings. Select Apply settings to configure it for Dev Assist.'
		);
	});

	test('reports in sync when provider and active Cline state both match', async () => {
		await fileStore.writeJsonFile(fileStore.globalStateFile, {
			actModeApiProvider: 'openai',
			planModeApiProvider: 'openai',
			openAiBaseUrl: PANEL_BASE_URL,
			actModeOpenAiModelId: MODEL_ID,
			planModeOpenAiModelId: MODEL_ID,
		});

		const result = await adapter.checkConfigSync({
			scope: 'user',
			workspacePath: dataDirectory,
			apiKey: API_KEY,
			baseUrl: PANEL_BASE_URL,
			modelId: MODEL_ID,
		});

		assert.strictEqual(result.comparable, true);
		assert.strictEqual(result.inSync, true);
	});

	test('rolls back every Cline file when a providers-format write fails', async () => {
		const originalProviders = await fileStore.readJsonFile(fileStore.providersFile);
		class FailingFileStore extends ClineFileStore {
				override async writeJsonFile(
					filePath: string,
					data: any,
					expectedRevision?: string
				): Promise<string> {
					if (filePath === this.globalStateFile) {
						throw new Error('simulated global state write failure');
					}
					return super.writeJsonFile(filePath, data, expectedRevision);
				}
		}
		const failingStore = new FailingFileStore(dataDirectory);
		const failingAdapter = new ClineIntegrationAdapter(failingStore);

		const result = await failingAdapter.applyConfig({
			scope: 'user',
			workspacePath: dataDirectory,
			apiKey: 'replacement-key',
			baseUrl: 'http://127.0.0.1:9999/api/internal/devassist',
			modelId: MODEL_ID,
		});

		assert.strictEqual(result.applied, false);
		assert.deepStrictEqual(await fileStore.readJsonFile(fileStore.providersFile), originalProviders);
		assert.strictEqual(await fileStore.exists(fileStore.secretsFile), false);
		assert.strictEqual(await fileStore.exists(fileStore.globalStateFile), false);
	});

	test('does not overwrite Cline configuration changed during apply', async () => {
		class ConcurrentChangeFileStore extends ClineFileStore {
			private _changeInjected = false;

			override async createBackup(originalPath: string): Promise<string> {
				const backupPath = await super.createBackup(originalPath);
				if (!this._changeInjected && originalPath === this.providersFile) {
					this._changeInjected = true;
					await super.writeJsonFile(this.providersFile, {
						providers: {
							'openai-compatible': {
								settings: {
									baseUrl: 'http://cline-updated.example',
									model: 'ClineModel',
									apiKey: 'cline-updated-key',
								},
							},
						},
					});
				}
				return backupPath;
			}
		}
		const concurrentStore = new ConcurrentChangeFileStore(dataDirectory);
		const concurrentAdapter = new ClineIntegrationAdapter(concurrentStore);

		const result = await concurrentAdapter.applyConfig({
			scope: 'user',
			workspacePath: dataDirectory,
			apiKey: 'replacement-key',
			baseUrl: 'http://127.0.0.1:9999/api/internal/devassist',
			modelId: MODEL_ID,
		});

		assert.strictEqual(result.applied, false);
		assert.match(result.message, /changed while SuiteCloud was preparing the update/);
		const providers = await fileStore.readJsonFile(fileStore.providersFile);
		assert.strictEqual(
			providers?.providers?.['openai-compatible']?.settings?.baseUrl,
			'http://cline-updated.example'
		);
		assert.strictEqual(await fileStore.exists(fileStore.secretsFile), false);
		assert.strictEqual(await fileStore.exists(fileStore.globalStateFile), false);
	});

	test('does not roll back over a newer Cline change', async () => {
		class LateConcurrentChangeFileStore extends ClineFileStore {
			override async writeJsonFile(
				filePath: string,
				data: any,
				expectedRevision?: string
			): Promise<string> {
				if (filePath === this.globalStateFile) {
					await fs.writeFile(
						this.providersFile,
						JSON.stringify({
							providers: {
								'openai-compatible': {
									settings: {
										baseUrl: 'http://cline-latest.example',
										model: 'ClineLatestModel',
										apiKey: 'cline-latest-key',
									},
								},
							},
						}),
						'utf8'
					);
					throw new Error('simulated write failure after Cline changed providers');
				}
				return super.writeJsonFile(filePath, data, expectedRevision);
			}
		}
		const concurrentStore = new LateConcurrentChangeFileStore(dataDirectory);
		const concurrentAdapter = new ClineIntegrationAdapter(concurrentStore);

		const result = await concurrentAdapter.applyConfig({
			scope: 'user',
			workspacePath: dataDirectory,
			apiKey: 'replacement-key',
			baseUrl: 'http://127.0.0.1:9999/api/internal/devassist',
			modelId: MODEL_ID,
		});

		assert.strictEqual(result.applied, false);
		const providers = await fileStore.readJsonFile(fileStore.providersFile);
		assert.strictEqual(
			providers?.providers?.['openai-compatible']?.settings?.baseUrl,
			'http://cline-latest.example'
		);
		assert.strictEqual(await fileStore.exists(fileStore.secretsFile), false);
	});
});
