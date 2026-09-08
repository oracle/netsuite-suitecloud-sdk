/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { DEVELOPER_ASSISTANT } from '../../../ApplicationConstants';
import type SdkService from '../sdk/SdkService';
import type ProxyLifecycleService from './ProxyLifecycleService';
import type ProxyService from './ProxyService';
import { buildProxyBaseUrl } from '../Configuration';
import { formatProxyStartError, summarizeInlineError } from './ErrorFormatter';
import { SuiteCloudPanelState } from '../State';
import {
	clearRuntimeConfig,
	markRuntimeConfigAsActive,
} from '../StateTransitions';
import { SUITECLOUD_PANEL_RUNTIME_STRINGS } from '../Strings';

export type ProxyWorkflowPresenter = {
	clearLog(): void;
	startLogSection(): void;
	endLogSection(): void;
	info(message: string): void;
	logSuccess(message: string): void;
	showError(message: string): void;
	setStartingStatus(): void;
	setRunningStatus(): void;
	setStoppedStatus(): void;
	logApiProviderSettings(baseUrl: string, modelId: string): void;
};

export type ProxyWorkflowDependencies = {
	sdkService: SdkService;
	lifecycleService: ProxyLifecycleService;
	proxyService: ProxyService;
	presenter: ProxyWorkflowPresenter;
	getState: () => SuiteCloudPanelState;
	setState: (state: SuiteCloudPanelState) => void;
	confirmStartDisclaimer: () => Promise<boolean>;
	ensureSdkDependenciesReady: () => Promise<void>;
	resolveApiKey: () => Promise<string | undefined>;
	refreshAuthIds: () => Promise<void>;
	refreshApiKeyAndCompatibility: () => Promise<void>;
	refreshCompatibility: () => Promise<void>;
	persistPreferencesNoThrow: () => Promise<void>;
	postStateUpdate: () => void;
};

export default class ProxyWorkflow {
	constructor(private readonly _dependencies: ProxyWorkflowDependencies) {}

	get isRunning(): boolean {
		return this._dependencies.proxyService.isRunning;
	}

	async startOnStartupIfEnabled(
		shouldRestartForClineConfig: boolean,
		clearPendingRestart: () => PromiseLike<void>
	): Promise<void> {
		const state = this._dependencies.getState();
		if (
			(!state.autoStartProxyOnStartup && !shouldRestartForClineConfig) ||
			this.isRunning
		) {
			return;
		}

		try {
			await this._dependencies.refreshAuthIds();
			await this._dependencies.refreshApiKeyAndCompatibility();
			await this.start(false, true);
			if (shouldRestartForClineConfig) {
				await clearPendingRestart();
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			const friendlyErrorMessage = this.formatStartError(errorMessage);
			const failedState = this._dependencies.getState();
			failedState.proxyStatus = 'error';
			failedState.lastError = this.summarizeInlineError(friendlyErrorMessage);
			this._dependencies.presenter.setStoppedStatus();
			this._dependencies.postStateUpdate();
			this._dependencies.presenter.showError(`Auto-start failed: ${friendlyErrorMessage}`);
			this._dependencies.presenter.endLogSection();
		}
	}

	async start(
		showDisclaimerPrompt = true,
		emitSuccessMessage = true
	): Promise<void> {
		await this._dependencies.ensureSdkDependenciesReady();
		if (showDisclaimerPrompt && !(await this._dependencies.confirmStartDisclaimer())) {
			return;
		}

		const presenter = this._dependencies.presenter;
		presenter.clearLog();
		presenter.startLogSection();
		const startResult = await this._dependencies.lifecycleService.start({
			state: this._dependencies.getState(),
			unconfiguredAuthId: DEVELOPER_ASSISTANT.DEFAULT_VALUES.authID,
			isProxySupported: () => this._dependencies.sdkService.isProxyServiceSupported(),
			getCliVersion: () => this._dependencies.sdkService.getBundledCliVersion(),
			getSdkPath: () => this._dependencies.sdkService.getSdkPath(),
			ensureAuthorizationReady: (authId) =>
				this._dependencies.sdkService.ensureAuthorizationReady(authId, () => {
					presenter.info(
						SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.reauthorizationRequired(authId)
					);
				}),
			resolveApiKey: () => this._dependencies.resolveApiKey(),
			onStarting: (state) => {
				presenter.info(
					`Starting the SuiteCloud Proxy on port ${state.port} with auth ID "${state.authId}".`
				);
				this._dependencies.setState(state);
				this._dependencies.postStateUpdate();
				presenter.setStartingStatus();
			},
		});
		this._dependencies.setState(markRuntimeConfigAsActive({
			...this._dependencies.getState(),
			proxyStatus: 'running',
			baseUrl: buildProxyBaseUrl(startResult.port),
			authId: startResult.authId,
			port: startResult.port,
		}));
		await this._dependencies.persistPreferencesNoThrow();
		await this._dependencies.refreshCompatibility();
		presenter.setRunningStatus();
		this._dependencies.postStateUpdate();
		presenter.logApiProviderSettings(
			this._dependencies.getState().baseUrl,
			SUITECLOUD_PANEL_RUNTIME_STRINGS.modelId
		);

		if (emitSuccessMessage) {
			presenter.logSuccess(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.proxyRunning);
		}
		presenter.endLogSection();
	}

	async stop(
		emitSuccessMessage = true,
		options: { preserveStartIntent?: boolean } = {}
	): Promise<void> {
		const presenter = this._dependencies.presenter;
		presenter.startLogSection();
		const result = await this._dependencies.lifecycleService.stop({
			state: this._dependencies.getState(),
			preserveStartIntent: options.preserveStartIntent === true,
			onStopping: async (state) => {
			presenter.info('Stopping the SuiteCloud Proxy.');
				this._dependencies.setState(state);
				await this._dependencies.persistPreferencesNoThrow();
				this._dependencies.postStateUpdate();
			},
		});
		this._dependencies.setState(clearRuntimeConfig(
			{
				...this._dependencies.getState(),
				proxyStatus: 'stopped',
			},
			{ clearStartIntent: result.clearStartIntent }
		));

		if (!result.proxyWasRunning) {
			await this._dependencies.persistPreferencesNoThrow();
			presenter.setStoppedStatus();
			this._dependencies.postStateUpdate();
			if (emitSuccessMessage) {
				presenter.logSuccess(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.proxyAlreadyStopped);
			}
			presenter.endLogSection();
			return;
		}
		presenter.setStoppedStatus();
		this._dependencies.postStateUpdate();
		if (emitSuccessMessage) {
			presenter.logSuccess(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.proxyStopped);
		}
		presenter.endLogSection();
	}

	formatStartError(errorMessage: string): string {
		return formatProxyStartError(
			errorMessage,
			() => this._dependencies.sdkService.getBundledCliVersion()
		);
	}

	summarizeInlineError(errorMessage: string): string {
		return summarizeInlineError(errorMessage);
	}

}
