/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { ClineScope } from '../SuiteCloudPanelTypes';
import {
	PREFERRED_BASE_URL_KEYS,
	PREFERRED_MODEL_KEYS,
	PREFERRED_PROVIDER_KEYS,
	PREFERRED_SECRET_KEYS,
} from './ClineConstants';
import ClineFileStore from './ClineFileStore';
import {
	ApplyClineConfigInput,
	ApplyClineConfigResult,
	CompatibilityDetails,
	ClineCompatibilityResult,
	JsonObject,
} from './ClineIntegrationTypes';

export default class ClineLegacyConfigStrategy {
	private readonly _fileStore: ClineFileStore;

	constructor(fileStore: ClineFileStore) {
		this._fileStore = fileStore;
	}

	async checkCompatibility(scope: ClineScope, workspacePath: string): Promise<ClineCompatibilityResult> {
		const statePath = scope === 'workspace' ? this._fileStore.getWorkspaceStatePath(workspacePath) : this._fileStore.globalStateFile;
		const state = await this._fileStore.readJsonFile(statePath);
		if (!state) {
			return {
				compatible: false,
				message: 'Cline state file was not found for the selected scope. Configure Cline once before applying settings.',
			};
		}

		const secrets = await this._fileStore.readJsonFile(this._fileStore.secretsFile);
		if (!secrets) {
			return {
				compatible: false,
				message: 'Cline secrets file was not found. Configure Cline once before applying settings.',
			};
		}

		const providerKey = this._findKeyByPreference(state, PREFERRED_PROVIDER_KEYS, /api.?provider/i);
		const modelKey = this._findKeyByPreference(state, PREFERRED_MODEL_KEYS, /model.?id/i);
		const baseUrlKey = this._findKeyByPreference(state, PREFERRED_BASE_URL_KEYS, /base.?url/i);
		const secretKey = this._findKeyByPreference(secrets, PREFERRED_SECRET_KEYS, /api.?key/i);

		if (!providerKey || !modelKey || !baseUrlKey || !secretKey) {
			return {
				compatible: false,
				message:
					'Cline storage format is not recognized on this machine. Use manual copy, or configure Cline once and retry experimental apply.',
			};
		}

		return {
			compatible: true,
			message: 'Cline storage compatibility check passed.',
			details: {
				providerKey,
				baseUrlKey,
				modelKey,
				secretKey,
			},
		};
	}

	async apply(input: ApplyClineConfigInput, details: CompatibilityDetails): Promise<ApplyClineConfigResult> {
		const targetStatePath =
			input.scope === 'workspace'
				? this._fileStore.getWorkspaceStatePath(input.workspacePath)
				: this._fileStore.globalStateFile;

		const backups: string[] = [];
		const createdPaths: string[] = [];
		const writtenRevisions = new Map<string, string>();
		try {
			const stateSnapshot = await this._fileStore.readJsonFileSnapshot(targetStatePath);
			const secretsSnapshot = await this._fileStore.readJsonFileSnapshot(this._fileStore.secretsFile);
			if (await this._fileStore.exists(targetStatePath)) {
				backups.push(await this._fileStore.createBackup(targetStatePath));
			} else {
				createdPaths.push(targetStatePath);
			}
			if (await this._fileStore.exists(this._fileStore.secretsFile)) {
				backups.push(await this._fileStore.createBackup(this._fileStore.secretsFile));
			} else {
				createdPaths.push(this._fileStore.secretsFile);
			}

			const state = stateSnapshot.data || {};
			const secrets = secretsSnapshot.data || {};

			state[details.providerKey] = 'openai';
			state[details.baseUrlKey] = input.baseUrl;
			state[details.modelKey] = input.modelId;
			secrets[details.secretKey] = input.apiKey;

			writtenRevisions.set(
				targetStatePath,
				await this._fileStore.writeJsonFile(targetStatePath, state, stateSnapshot.revision)
			);
			writtenRevisions.set(
				this._fileStore.secretsFile,
				await this._fileStore.writeJsonFile(
					this._fileStore.secretsFile,
					secrets,
					secretsSnapshot.revision
				)
			);

			return {
				applied: true,
				message: 'Cline settings were updated successfully.',
			};
		} catch (error) {
			await this._fileStore.restoreFromBackups(backups, writtenRevisions);
			await this._fileStore.removeFiles(createdPaths, writtenRevisions);
			return {
				applied: false,
				message: `Unable to apply Cline settings automatically: ${error instanceof Error ? error.message : String(error)}`,
			};
		} finally {
			await this._fileStore.cleanupBackups(backups);
		}
	}

	private _findKeyByPreference(data: JsonObject, preferredKeys: string[], fallbackPattern: RegExp): string | undefined {
		for (const key of preferredKeys) {
			if (Object.prototype.hasOwnProperty.call(data, key)) {
				return key;
			}
		}

		return Object.keys(data).find((key) => fallbackPattern.test(key));
	}
}
