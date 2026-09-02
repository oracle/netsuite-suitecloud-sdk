/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { ClineScope } from '../../../../controlPanel/devAssist/State';
import {
	CLINE_OPENAI_COMPATIBLE_PROVIDER_ID,
} from './Constants';
import ClineFileStore from './FileStore';
import {
	ApplyClineConfigInput,
	ApplyClineConfigResult,
	ClineConfigSyncResult,
	ClineCompatibilityResult,
} from './IntegrationTypes';
import ClineLegacyConfigStrategy from './LegacyConfigStrategy';
import ClineProvidersConfigStrategy from './ProvidersConfigStrategy';

export type {
	ApplyClineConfigInput,
	ApplyClineConfigResult,
	ClineConfigSyncResult,
	ClineCompatibilityResult,
} from './IntegrationTypes';

const CLINE_CONFIG_MISMATCH_MESSAGE =
	'Cline uses different settings. Select Apply settings to configure it for Dev Assist.';

export default class ClineIntegrationAdapter {
	private readonly _fileStore: ClineFileStore;
	private readonly _providersStrategy: ClineProvidersConfigStrategy;
	private readonly _legacyStrategy: ClineLegacyConfigStrategy;

	constructor(fileStore: ClineFileStore = new ClineFileStore()) {
		this._fileStore = fileStore;
		this._providersStrategy = new ClineProvidersConfigStrategy(this._fileStore);
		this._legacyStrategy = new ClineLegacyConfigStrategy(this._fileStore);
	}

	async checkCompatibility(scope: ClineScope, workspacePath: string): Promise<ClineCompatibilityResult> {
		const dirExists = await this._fileStore.exists(this._fileStore.dataDirectory);
		if (!dirExists) {
			return {
				compatible: false,
				message: 'Cline storage directory was not found. Open Cline once before applying settings automatically.',
			};
		}

		const providersCompatibility = await this._providersStrategy.checkCompatibility();
		if (providersCompatibility.compatible) {
			return providersCompatibility;
		}

		return this._legacyStrategy.checkCompatibility(scope, workspacePath);
	}

	async applyConfig(input: ApplyClineConfigInput): Promise<ApplyClineConfigResult> {
		if (await this._providersStrategy.isApplicable()) {
			return this._providersStrategy.apply(input);
		}

		const compatibility = await this._legacyStrategy.checkCompatibility(input.scope, input.workspacePath);
		if (!compatibility.compatible || !compatibility.details) {
			return {
				applied: false,
				message: compatibility.message,
			};
		}

		return this._legacyStrategy.apply(input, compatibility.details);
	}

	async checkConfigSync(input: ApplyClineConfigInput): Promise<ClineConfigSyncResult> {
		if (!input.apiKey || !input.apiKey.trim()) {
			return {
				comparable: false,
				inSync: false,
				message: 'No API key available yet. Generate or rotate API key before checking Cline sync.',
			};
		}

		if (await this._providersStrategy.isApplicable()) {
			const providers = await this._fileStore.readJsonFile(this._fileStore.providersFile);
			const settings = providers?.providers?.[CLINE_OPENAI_COMPATIBLE_PROVIDER_ID]?.settings;
			if (!settings || typeof settings !== 'object') {
				return {
					comparable: false,
					inSync: false,
					message: 'Cline providers settings are not available for sync comparison.',
				};
			}

			const detectedBaseUrl = this._normalizeBaseUrl(settings.baseUrl);
			const detectedModelId = this._normalizeString(settings.model);
			const detectedApiKey = this._normalizeString(settings.apiKey);

			if (!detectedBaseUrl || !detectedModelId || !detectedApiKey) {
				return {
					comparable: false,
					inSync: false,
					message: 'Cline providers settings are missing base URL, model, or API key.',
				};
			}

			const providerInSync =
				detectedBaseUrl === this._normalizeBaseUrl(input.baseUrl) &&
				detectedModelId === this._normalizeString(input.modelId) &&
				detectedApiKey === this._normalizeString(input.apiKey);

			const globalState = await this._fileStore.readJsonFile(this._fileStore.globalStateFile);
			const activeBaseUrl = this._normalizeBaseUrl(globalState?.openAiBaseUrl);
			const activeModelIds = [
				this._normalizeString(globalState?.actModeOpenAiModelId),
				this._normalizeString(globalState?.planModeOpenAiModelId),
			].filter((modelId): modelId is string => !!modelId);
			const activeProviders = [
				this._normalizeString(globalState?.actModeApiProvider),
				this._normalizeString(globalState?.planModeApiProvider),
			].filter((provider): provider is string => !!provider);
			const hasActiveOpenAiConfig =
				!!activeBaseUrl || activeModelIds.length > 0 || activeProviders.length > 0;
			const expectedBaseUrl = this._normalizeBaseUrl(input.baseUrl);
			const expectedModelId = this._normalizeString(input.modelId);
			const supportedActiveProviders = new Set(['openai', CLINE_OPENAI_COMPATIBLE_PROVIDER_ID]);
			const activeConfigInSync =
				!hasActiveOpenAiConfig ||
				(
					activeBaseUrl === expectedBaseUrl &&
					activeModelIds.every((modelId) => modelId === expectedModelId) &&
					activeProviders.every((provider) => supportedActiveProviders.has(provider))
				);
			const inSync = providerInSync && activeConfigInSync;

			return {
				comparable: true,
				inSync,
				message: inSync
					? 'No change detected. Nothing to apply to Cline config.'
					: CLINE_CONFIG_MISMATCH_MESSAGE,
			};
		}

		const compatibility = await this._legacyStrategy.checkCompatibility(input.scope, input.workspacePath);
		if (!compatibility.compatible || !compatibility.details) {
			return {
				comparable: false,
				inSync: false,
				message: compatibility.message,
			};
		}

		const statePath =
			input.scope === 'workspace'
				? this._fileStore.getWorkspaceStatePath(input.workspacePath)
				: this._fileStore.globalStateFile;
		const state = await this._fileStore.readJsonFile(statePath);
		const secrets = await this._fileStore.readJsonFile(this._fileStore.secretsFile);
		if (!state || !secrets) {
			return {
				comparable: false,
				inSync: false,
				message: 'Cline state/secrets are missing for sync comparison.',
			};
		}

		const detectedBaseUrl = this._normalizeBaseUrl(state[compatibility.details.baseUrlKey]);
		const detectedModelId = this._normalizeString(state[compatibility.details.modelKey]);
		const detectedApiKey = this._normalizeString(secrets[compatibility.details.secretKey]);
		if (!detectedBaseUrl || !detectedModelId || !detectedApiKey) {
			return {
				comparable: false,
				inSync: false,
				message: 'Cline state/secrets are missing base URL, model, or API key.',
			};
		}

		const inSync =
			detectedBaseUrl === this._normalizeBaseUrl(input.baseUrl) &&
			detectedModelId === this._normalizeString(input.modelId) &&
			detectedApiKey === this._normalizeString(input.apiKey);

		return {
			comparable: true,
			inSync,
			message: inSync
				? 'No change detected. Nothing to apply to Cline config.'
				: CLINE_CONFIG_MISMATCH_MESSAGE,
		};
	}

	private _normalizeString(value: unknown): string {
		return typeof value === 'string' ? value.trim() : '';
	}

	private _normalizeBaseUrl(value: unknown): string {
		const normalized = this._normalizeString(value);
		return normalized.replace(/\/+$/, '');
	}
}
