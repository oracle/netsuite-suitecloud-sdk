/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import type ClineChatOpener from './ChatOpener';
import type ClineCompatibilityService from './ClineCompatibilityService';
import type ClineConfigService from './ClineConfigService';
import type {
	ApplyPanelClineConfigOutcome,
} from './ClineConfigService';
import type ExtensionHostRestartService from './ExtensionHostRestartService';
import { SuiteCloudPanelState } from '../State';
import { SUITECLOUD_PANEL_RUNTIME_STRINGS } from '../Strings';
import type ProxyWorkflow from '../proxy/ProxyWorkflow';

export type ClineWorkflowPresenter = {
	info(message: string): void;
	error(message: string): void;
	logSuccess(message: string): void;
	showSuccess(message: string): void;
	showError(message: string): void;
};

export const CLINE_PENDING_PROXY_RESTART_STORAGE_KEY =
	'suitecloud.controlPanel.pendingClineProxyRestart.v1';

export type ClineWorkflowStorage = {
	update(key: string, value: unknown): PromiseLike<void>;
};

const assertUnreachable = (value: never): never => {
	throw new Error(`Unhandled Cline configuration outcome: ${String(value)}`);
};

export type ClineWorkflowDependencies = {
	chatOpener: ClineChatOpener;
	compatibilityService: ClineCompatibilityService;
	configService: ClineConfigService;
	extensionHostRestartService: ExtensionHostRestartService;
	globalState: ClineWorkflowStorage;
	presenter: ClineWorkflowPresenter;
	proxyWorkflow: ProxyWorkflow;
	getState: () => SuiteCloudPanelState;
	getWorkspacePath: () => string;
	getResolvedApiKey: () => string | undefined;
	isClineInstalled: () => boolean;
	confirmExtensionRestart: () => Promise<boolean>;
	resolveApiKey: () => Promise<string | undefined>;
	isProxyAvailable: () => boolean;
	postStateUpdate: () => void;
};

export default class ClineWorkflow {
	private _appliedInSession = false;

	constructor(private readonly _dependencies: ClineWorkflowDependencies) {}

	get appliedInSession(): boolean {
		return this._appliedInSession;
	}

	resetSessionState(): void {
		this._appliedInSession = false;
	}

	async refreshCompatibility(): Promise<void> {
		const state = this._dependencies.getState();
		const compatibilityState =
			await this._dependencies.compatibilityService.evaluate({
				isExtensionInstalled: this._dependencies.isClineInstalled(),
				scope: state.clineScope,
				workspacePath: this._dependencies.getWorkspacePath(),
				apiKey: this._dependencies.getResolvedApiKey(),
				baseUrl: state.baseUrl,
				modelId: SUITECLOUD_PANEL_RUNTIME_STRINGS.modelId,
			});

		if (this._dependencies.configService.hasPendingConfig()) {
			compatibilityState.isClineConfigInSync = false;
			if (compatibilityState.isClineInstalled && compatibilityState.isClineCompatible) {
				compatibilityState.clineConfigSyncMessage =
					SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.clineRestartRequired;
			}
		}

		Object.assign(state, compatibilityState);
	}

	async applyPendingConfig(): Promise<void> {
		try {
			const applied = await this._dependencies.configService.applyPendingConfig(
				this._dependencies.getWorkspacePath(),
				() => this._dependencies.resolveApiKey()
			);
			if (applied) {
				await this.refreshCompatibility();
				this._appliedInSession = this._dependencies.getState().isClineConfigInSync;
				this._dependencies.postStateUpdate();
				this._dependencies.presenter.info(
					SUITECLOUD_PANEL_RUNTIME_STRINGS.messages.clinePendingConfigApplied
				);
			}
		} catch (error) {
			this._dependencies.presenter.error(
				SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.clinePendingApplyFailed(
					String(error)
				)
			);
		}
	}

	async applySettings(): Promise<void> {
		const state = this._dependencies.getState();
		const outcome = await this._dependencies.configService.applyPanelConfig({
			isProxyAvailable: this._dependencies.isProxyAvailable(),
			isConfigInSync: state.isClineConfigInSync,
			scope: state.clineScope,
			workspacePath: this._dependencies.getWorkspacePath(),
			baseUrl: state.baseUrl,
			modelId: SUITECLOUD_PANEL_RUNTIME_STRINGS.modelId,
			resolveApiKey: () => this._dependencies.resolveApiKey(),
		});

		if (await this._handleNonAppliedOutcome(outcome)) {
			return;
		}

		await this.refreshCompatibility();
		this._appliedInSession = false;
		this._dependencies.postStateUpdate();
		if (await this._dependencies.confirmExtensionRestart()) {
			await this._restartExtensions();
			return;
		}
		this._dependencies.presenter.showSuccess(
			SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.clineConfigSaved
		);
	}

	async openChat(): Promise<void> {
		if (!this._dependencies.isProxyAvailable()) {
			this._dependencies.presenter.showError(
				SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.startProxyBeforeClineChat
			);
			return;
		}

		if (await this._dependencies.chatOpener.open()) {
			this._dependencies.presenter.logSuccess(
				SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.openedClineChat
			);
			return;
		}
		this._dependencies.presenter.showError(
			SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.openClineChatFailed
		);
	}

	private async _handleNonAppliedOutcome(
		outcome: ApplyPanelClineConfigOutcome
	): Promise<boolean> {
		const presenter = this._dependencies.presenter;
		switch (outcome.kind) {
			case 'proxyUnavailable':
				presenter.showError(
					SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.startProxyBeforeClineApply
				);
				return true;
			case 'workspaceManual':
				presenter.logSuccess(
					SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.workspaceClineSetupIsManual
				);
				return true;
			case 'alreadyInSync':
				presenter.logSuccess(
					SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.noClineConfigChangesDetected
				);
				return true;
			case 'missingApiKey':
				presenter.showError(
					SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.noApiKeyForClineApply
				);
				return true;
			case 'applyFailed':
				await this.refreshCompatibility();
				this._appliedInSession = false;
				this._dependencies.postStateUpdate();
				presenter.showError(outcome.message);
				return true;
			case 'applied':
				return false;
			default:
				return assertUnreachable(outcome);
		}
	}

	private async _restartExtensions(): Promise<void> {
		const shouldRecoverOwnedProxy = this._dependencies.proxyWorkflow.isRunning;
		await this._dependencies.globalState.update(
			CLINE_PENDING_PROXY_RESTART_STORAGE_KEY,
			true
		);

		try {
			if (shouldRecoverOwnedProxy) {
				await this._dependencies.proxyWorkflow.stop(
					false,
					{ preserveStartIntent: true }
				);
			}
			await this._dependencies.extensionHostRestartService.restart();
		} catch (error) {
			await this._dependencies.globalState.update(
				CLINE_PENDING_PROXY_RESTART_STORAGE_KEY,
				undefined
			);
			const restartError = error instanceof Error ? error.message : String(error);
			let recoveryError: string | undefined;

			if (shouldRecoverOwnedProxy && !this._dependencies.proxyWorkflow.isRunning) {
				try {
					await this._dependencies.proxyWorkflow.start(false, true);
				} catch (proxyError) {
					recoveryError =
						proxyError instanceof Error ? proxyError.message : String(proxyError);
					this._dependencies.presenter.error(
						SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.clineProxyRecoveryFailed(
							recoveryError
						)
					);
				}
			}

			throw new Error(
				SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.clineExtensionRestartFailed(
					restartError,
					recoveryError
				)
			);
		}
	}
}
