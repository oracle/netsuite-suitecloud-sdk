/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import type ClineIntegrationAdapter from './IntegrationAdapter';
import { ClineScope, SuiteCloudPanelState } from '../State';
import { SUITECLOUD_PANEL_RUNTIME_STRINGS } from '../Strings';

type ClineCompatibilityState = Pick<
	SuiteCloudPanelState,
	| 'isClineInstalled'
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
				isClineInstalled: false,
				isClineCompatible: false,
				clineCompatibilityMessage: SUITECLOUD_PANEL_RUNTIME_STRINGS.cline.notInstalled,
				isClineConfigInSync: false,
				clineConfigSyncMessage: null,
			};
		}

		if (input.scope === 'workspace') {
			return {
				isClineInstalled: true,
				isClineCompatible: true,
				clineCompatibilityMessage: SUITECLOUD_PANEL_RUNTIME_STRINGS.cline.workspaceManual,
				isClineConfigInSync: false,
				clineConfigSyncMessage: SUITECLOUD_PANEL_RUNTIME_STRINGS.cline.workspaceCopyInstructions,
			};
		}

		const compatibility = await this._adapter.checkCompatibility(
			input.scope,
			input.workspacePath
		);
		if (!compatibility.compatible) {
			return {
				isClineInstalled: true,
				isClineCompatible: false,
				clineCompatibilityMessage: compatibility.message,
				isClineConfigInSync: false,
				clineConfigSyncMessage: SUITECLOUD_PANEL_RUNTIME_STRINGS.cline.automaticUpdateUnsupported,
			};
		}

		if (!input.apiKey) {
			return {
				isClineInstalled: true,
				isClineCompatible: true,
				clineCompatibilityMessage: SUITECLOUD_PANEL_RUNTIME_STRINGS.cline.automaticUpdateSupported,
				isClineConfigInSync: false,
				clineConfigSyncMessage: SUITECLOUD_PANEL_RUNTIME_STRINGS.cline.generateApiKey,
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
			isClineInstalled: true,
			isClineCompatible: true,
			clineCompatibilityMessage: SUITECLOUD_PANEL_RUNTIME_STRINGS.cline.automaticUpdateSupported,
			isClineConfigInSync: syncResult.comparable && syncResult.inSync,
			clineConfigSyncMessage: syncResult.comparable ? null : syncResult.message,
		};
	}
}
