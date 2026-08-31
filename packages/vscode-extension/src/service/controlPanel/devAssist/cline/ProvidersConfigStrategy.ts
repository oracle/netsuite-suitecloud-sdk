/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import ClineFileStore from './FileStore';
import {
	CLINE_OPENAI_COMPATIBLE_PROVIDER_ID,
} from './Constants';
import {
	ApplyClineConfigInput,
	ApplyClineConfigResult,
	ClineCompatibilityResult,
	JsonObject,
} from './IntegrationTypes';

export default class ClineProvidersConfigStrategy {
	private readonly _fileStore: ClineFileStore;

	constructor(fileStore: ClineFileStore) {
		this._fileStore = fileStore;
	}

	async isApplicable(): Promise<boolean> {
		const providers = await this._fileStore.readJsonFile(this._fileStore.providersFile);
		const openAiCompatibleSettings = providers?.providers?.[CLINE_OPENAI_COMPATIBLE_PROVIDER_ID]?.settings;
		return !!(openAiCompatibleSettings && typeof openAiCompatibleSettings === 'object');
	}

	async checkCompatibility(): Promise<ClineCompatibilityResult> {
		const applicable = await this.isApplicable();
		if (!applicable) {
			return {
				compatible: false,
				message: 'Cline providers settings format is not available.',
			};
		}

		return {
			compatible: true,
			message: 'Cline providers.json format detected.',
			details: {
				providerKey: CLINE_OPENAI_COMPATIBLE_PROVIDER_ID,
				baseUrlKey: 'baseUrl',
				modelKey: 'model',
				secretKey: 'apiKey',
			},
		};
	}

	async apply(input: ApplyClineConfigInput): Promise<ApplyClineConfigResult> {
		const providersSnapshot = await this._fileStore.readJsonFileSnapshot(this._fileStore.providersFile);
		const providers = providersSnapshot.data;
		if (!providers || typeof providers !== 'object') {
			return {
				applied: false,
				message: 'Cline providers settings file is not available.',
			};
		}

		const targetPaths = [
			this._fileStore.providersFile,
			this._fileStore.secretsFile,
			this._fileStore.globalStateFile,
		];
		if (input.scope === 'workspace') {
			targetPaths.push(this._fileStore.getWorkspaceStatePath(input.workspacePath));
		}
		const backups: string[] = [];
		const createdPaths: string[] = [];
		const writtenRevisions = new Map<string, string>();
		try {
			const secretsSnapshot = await this._fileStore.readJsonFileSnapshot(this._fileStore.secretsFile);
			const globalStateSnapshot = await this._fileStore.readJsonFileSnapshot(this._fileStore.globalStateFile);
			const workspaceStatePath =
				input.scope === 'workspace'
					? this._fileStore.getWorkspaceStatePath(input.workspacePath)
					: undefined;
			const workspaceStateSnapshot = workspaceStatePath
				? await this._fileStore.readJsonFileSnapshot(workspaceStatePath)
				: undefined;

			for (const targetPath of targetPaths) {
				if (await this._fileStore.exists(targetPath)) {
					backups.push(await this._fileStore.createBackup(targetPath));
				} else {
					createdPaths.push(targetPath);
				}
			}

			const updatedProviders = { ...providers } as JsonObject;
			if (!updatedProviders.providers || typeof updatedProviders.providers !== 'object') {
				updatedProviders.providers = {};
			}
			if (!updatedProviders.providers[CLINE_OPENAI_COMPATIBLE_PROVIDER_ID]) {
				updatedProviders.providers[CLINE_OPENAI_COMPATIBLE_PROVIDER_ID] = { settings: {} };
			}

			const providerNode = updatedProviders.providers[CLINE_OPENAI_COMPATIBLE_PROVIDER_ID];
			const settings = providerNode.settings && typeof providerNode.settings === 'object' ? providerNode.settings : {};
			providerNode.settings = {
				...settings,
				provider: CLINE_OPENAI_COMPATIBLE_PROVIDER_ID,
				apiKey: input.apiKey,
				model: input.modelId,
				baseUrl: input.baseUrl,
				headers: settings.headers || {},
				reasoning: settings.reasoning || { budgetTokens: 1024 },
			};
			providerNode.updatedAt = new Date().toISOString();
			updatedProviders.lastUsedProvider = CLINE_OPENAI_COMPATIBLE_PROVIDER_ID;

			writtenRevisions.set(
				this._fileStore.providersFile,
				await this._fileStore.writeJsonFile(
					this._fileStore.providersFile,
					updatedProviders,
					providersSnapshot.revision
				)
			);

			const secrets = secretsSnapshot.data || {};
			secrets.openAiApiKey = input.apiKey;
			writtenRevisions.set(
				this._fileStore.secretsFile,
				await this._fileStore.writeJsonFile(
					this._fileStore.secretsFile,
					secrets,
					secretsSnapshot.revision
				)
			);

			const globalState = globalStateSnapshot.data || {};
			globalState.actModeApiProvider = 'openai';
			globalState.planModeApiProvider = 'openai';
			globalState.openAiBaseUrl = input.baseUrl;
			globalState.actModeOpenAiModelId = input.modelId;
			globalState.planModeOpenAiModelId = input.modelId;
			writtenRevisions.set(
				this._fileStore.globalStateFile,
				await this._fileStore.writeJsonFile(
					this._fileStore.globalStateFile,
					globalState,
					globalStateSnapshot.revision
				)
			);

			if (workspaceStatePath && workspaceStateSnapshot) {
				const workspaceState = workspaceStateSnapshot.data || {};
				workspaceState.actModeApiProvider = 'openai';
				workspaceState.planModeApiProvider = 'openai';
				workspaceState.openAiBaseUrl = input.baseUrl;
				workspaceState.actModeOpenAiModelId = input.modelId;
				workspaceState.planModeOpenAiModelId = input.modelId;
				writtenRevisions.set(
					workspaceStatePath,
					await this._fileStore.writeJsonFile(
						workspaceStatePath,
						workspaceState,
						workspaceStateSnapshot.revision
					)
				);
			}

			return {
				applied: true,
				message:
					input.scope === 'user'
						? 'Cline global settings were updated successfully (providers format).'
						: 'Cline workspace settings were updated successfully (providers format).',
			};
		} catch (error) {
			await this._fileStore.restoreFromBackups(backups, writtenRevisions);
			await this._fileStore.removeFiles(createdPaths, writtenRevisions);
			return {
				applied: false,
				message: `Unable to apply providers-format Cline settings: ${error instanceof Error ? error.message : String(error)}`,
			};
		} finally {
			await this._fileStore.cleanupBackups(backups);
		}
	}
}
