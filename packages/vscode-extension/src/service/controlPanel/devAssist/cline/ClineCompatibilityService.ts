/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import type ClineIntegrationAdapter from './IntegrationAdapter';
import { ClineScope, SuiteCloudPanelState } from '../../../../controlPanel/devAssist/State';

type ClineCompatibilityState = Pick<
	SuiteCloudPanelState,
	| 'isClineCompatible'
	| 'clineCompatibilityMessage'
	| 'isClineConfigInSync'
	| 'clineConfigSyncMessage'
>;

type ClineCompatibilityAdapter = Pick<
	ClineIntegrationAdapter,
	'checkCompatibility' | 'checkConfigSync'
>;

export type ClineCompatibilityInput = {
	isExtensionInstalled: boolean;
	scope: ClineScope;
	workspacePath: string;
	apiKey: string | undefined;
	baseUrl: string;
	modelId: string;
};

export default class ClineCompatibilityService {
	private readonly _adapter: ClineCompatibilityAdapter;

	constructor(adapter: ClineCompatibilityAdapter) {
		this._adapter = adapter;
	}

	async evaluate(input: ClineCompatibilityInput): Promise<ClineCompatibilityState> {
		if (!input.isExtensionInstalled) {
			return {
				isClineCompatible: false,
				clineCompatibilityMessage: 'Cline is not installed.',
				isClineConfigInSync: false,
				clineConfigSyncMessage: null,
			};
		}

		if (input.scope === 'workspace') {
			return {
				isClineCompatible: true,
				clineCompatibilityMessage:
					'Workspace Manual Setup is copy-only. Cline provider config is global in supported Cline versions.',
				isClineConfigInSync: false,
				clineConfigSyncMessage:
					'Copy Base URL and Model ID from Proxy Status, then copy the visible API key after rotating it if needed.',
			};
		}

		const compatibility = await this._adapter.checkCompatibility(
			input.scope,
			input.workspacePath
		);
		if (!compatibility.compatible) {
			return {
				isClineCompatible: false,
				clineCompatibilityMessage: compatibility.message,
				isClineConfigInSync: false,
				clineConfigSyncMessage:
					'Automatic Cline update is not supported on this machine. Copy Base URL and API key manually into Cline settings.',
			};
		}

		if (!input.apiKey) {
			return {
				isClineCompatible: true,
				clineCompatibilityMessage: 'Automatic Cline update is supported on this machine.',
				isClineConfigInSync: false,
				clineConfigSyncMessage:
					'Generate or rotate API key to enable automatic Cline sync checks.',
			};
		}

		const syncResult = await this._adapter.checkConfigSync({
			scope: input.scope,
			workspacePath: input.workspacePath,
			apiKey: input.apiKey,
			baseUrl: input.baseUrl,
			modelId: input.modelId,
		});
		return {
			isClineCompatible: true,
			clineCompatibilityMessage: 'Automatic Cline update is supported on this machine.',
			isClineConfigInSync: syncResult.comparable && syncResult.inSync,
			clineConfigSyncMessage: syncResult.message,
		};
	}
}
