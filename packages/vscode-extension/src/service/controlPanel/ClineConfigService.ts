/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import type ClineIntegrationAdapter from './cline/IntegrationAdapter';
import { ClineScope } from '../../controlPanel/Types';

const PENDING_CONFIG_STORAGE_KEY = 'suitecloud.controlPanel.pendingClineConfig.v1';
const POST_WRITE_VERIFICATION_DELAY_MS = 750;

type ClineConfigAdapter = Pick<ClineIntegrationAdapter, 'applyConfig' | 'checkConfigSync'>;

export type ClineConfigStorage = {
	get<T>(key: string): T | undefined;
	update(key: string, value: unknown): PromiseLike<void>;
};

export type PendingClineConfig = {
	baseUrl: string;
	modelId: string;
};

export type ApplyPanelClineConfigInput = {
	isProxyAvailable: boolean;
	isConfigInSync: boolean;
	scope: ClineScope;
	workspacePath: string;
	baseUrl: string;
	modelId: string;
	resolveApiKey: () => Promise<string | undefined>;
};

export type ApplyPanelClineConfigOutcome =
	| { kind: 'proxyUnavailable' }
	| { kind: 'workspaceManual' }
	| { kind: 'alreadyInSync' }
	| { kind: 'missingApiKey' }
	| { kind: 'applyFailed'; message: string }
	| { kind: 'applied' };

export default class ClineConfigService {
	private readonly _adapter: ClineConfigAdapter;
	private readonly _storage: ClineConfigStorage;
	private readonly _sleep: (milliseconds: number) => Promise<void>;

	constructor(
		adapter: ClineConfigAdapter,
		storage: ClineConfigStorage,
		sleep: (milliseconds: number) => Promise<void> =
			(milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))
	) {
		this._adapter = adapter;
		this._storage = storage;
		this._sleep = sleep;
	}

	async applyPendingConfig(
		workspacePath: string,
		resolveApiKey: () => Promise<string | undefined>
	): Promise<boolean> {
		const pendingConfig = this._storage.get<PendingClineConfig>(PENDING_CONFIG_STORAGE_KEY);
		if (!pendingConfig?.baseUrl || !pendingConfig.modelId) {
			return false;
		}

		const apiKey = await resolveApiKey();
		if (!apiKey) {
			throw new Error('SuiteCloud CLI API key is not available.');
		}

		const applyResult = await this._adapter.applyConfig({
			scope: 'user',
			workspacePath,
			apiKey,
			baseUrl: pendingConfig.baseUrl,
			modelId: pendingConfig.modelId,
		});
		if (!applyResult.applied) {
			throw new Error(applyResult.message);
		}

		await this._sleep(POST_WRITE_VERIFICATION_DELAY_MS);
		const syncResult = await this._adapter.checkConfigSync({
			scope: 'user',
			workspacePath,
			apiKey,
			baseUrl: pendingConfig.baseUrl,
			modelId: pendingConfig.modelId,
		});
		if (!syncResult.comparable || !syncResult.inSync) {
			throw new Error(syncResult.message);
		}

		await this._storage.update(PENDING_CONFIG_STORAGE_KEY, undefined);
		return true;
	}

	async applyPanelConfig(
		input: ApplyPanelClineConfigInput
	): Promise<ApplyPanelClineConfigOutcome> {
		if (!input.isProxyAvailable) {
			return { kind: 'proxyUnavailable' };
		}
		if (input.scope === 'workspace') {
			return { kind: 'workspaceManual' };
		}
		if (input.isConfigInSync) {
			return { kind: 'alreadyInSync' };
		}

		const apiKey = await input.resolveApiKey();
		if (!apiKey) {
			return { kind: 'missingApiKey' };
		}

		const result = await this._adapter.applyConfig({
			scope: input.scope,
			workspacePath: input.workspacePath,
			apiKey,
			baseUrl: input.baseUrl,
			modelId: input.modelId,
		});
		if (!result.applied) {
			return { kind: 'applyFailed', message: result.message };
		}

		await this._storage.update(PENDING_CONFIG_STORAGE_KEY, {
			baseUrl: input.baseUrl,
			modelId: input.modelId,
		} satisfies PendingClineConfig);
		await this._sleep(POST_WRITE_VERIFICATION_DELAY_MS);
		return { kind: 'applied' };
	}
}
