/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { commandsInfoMap } from '../commandsMap';
import type PreferencesStore from './developerAssistant/PreferencesStore';
import type { PersistedPanelPreferences } from './developerAssistant/PreferencesStore';
import type ClineChatOpener from './developerAssistant/cline/ChatOpener';
import {
	CLINE_EXTENSION_ID,
	CLINE_MARKETPLACE_COMMAND_ID,
} from './developerAssistant/cline/Constants';
import { SUITECLOUD_PANEL_RUNTIME_STRINGS } from './developerAssistant/Strings';
import {
	applyFormChangesToState,
	calculatePendingRuntimeConfig,
	clearMissingApiKeyErrorIfResolved,
	clearRuntimeConfig,
	isProxyLifecycleActive,
} from './developerAssistant/StateTransitions';
import {
	SuiteCloudPanelIncomingMessage,
	SuiteCloudPanelSubmitFeedbackPayload,
	SuiteCloudPanelUpdateFormPayload,
	SUITECLOUD_PANEL_EVENTS,
} from './protocol/Messages';
import type { SuiteCloudPanelState } from './developerAssistant/State';
import type ExtensionHostRestartService from './developerAssistant/cline/ExtensionHostRestartService';
import type FeedbackService from './developerAssistant/feedback/FeedbackService';
import ApiKeyService from './developerAssistant/apiKey/ApiKeyService';
import type {
	ApiKeyResolution,
	ApiKeyStorage,
} from './developerAssistant/apiKey/ApiKeyService';
import type ClineCompatibilityService from './developerAssistant/cline/ClineCompatibilityService';
import type ClineConfigService from './developerAssistant/cline/ClineConfigService';
import ClineConfigChangeWatcher from './developerAssistant/cline/ConfigChangeWatcher';
import type ClineFileStore from './developerAssistant/cline/FileStore';
import type SdkService from './developerAssistant/sdk/SdkService';
import ProxyLifecycleService from './developerAssistant/proxy/ProxyLifecycleService';
import ProxyService from './developerAssistant/proxy/ProxyService';
import PanelPresenter from './view/PanelPresenter';
import PanelHost from './view/PanelHost';
import MessageDispatcher from './protocol/MessageDispatcher';
import ClineWorkflow, {
	CLINE_PENDING_PROXY_RESTART_STORAGE_KEY,
} from './developerAssistant/cline/ClineWorkflow';
import ProxyWorkflow from './developerAssistant/proxy/ProxyWorkflow';

const WALKTHROUGH_CONTEXT_KEYS = {
	proxyRunning: 'suitecloud.controlPanel.proxyRunning',
	clineApplied: 'suitecloud.controlPanel.clineApplied',
	welcomeNotificationDisabled: 'suitecloud.controlPanel.welcomeNotificationDisabled',
} as const;

type ControlPanelControllerDependencies = {
	extensionContext: vscode.ExtensionContext;
	statusBarItem: vscode.StatusBarItem;
	sdkDependenciesReady: Promise<void>;
	sdkService: SdkService;
	clineFileStore: ClineFileStore;
	clineChatOpener: ClineChatOpener;
	clineCompatibilityService: ClineCompatibilityService;
	clineConfigService: ClineConfigService;
	extensionHostRestartService: ExtensionHostRestartService;
	feedbackService: FeedbackService;
	preferencesStore: PreferencesStore;
	apiKeyStorage: ApiKeyStorage;
	initialState: SuiteCloudPanelState;
};

export default class ControlPanelController {
	private readonly _extensionContext: vscode.ExtensionContext;
	private readonly _sdkService: SdkService;
	private readonly _proxyService: ProxyService;
	private readonly _proxyWorkflow: ProxyWorkflow;
	private readonly _clineWorkflow: ClineWorkflow;
	private readonly _clineConfigChangeWatcher: ClineConfigChangeWatcher;
	private readonly _messageDispatcher: MessageDispatcher;
	private readonly _presenter: PanelPresenter;
	private readonly _preferencesStore: PreferencesStore;
	private readonly _feedbackService: FeedbackService;
	private readonly _apiKeyService: ApiKeyService;
	private readonly _panelHost: PanelHost;
	private readonly _sdkDependenciesReady: Promise<void>;
	private _state: SuiteCloudPanelState;
	private _messageQueue: Promise<void> = Promise.resolve();

	constructor(dependencies: ControlPanelControllerDependencies) {
		this._extensionContext = dependencies.extensionContext;
		this._sdkDependenciesReady = dependencies.sdkDependenciesReady;
		this._sdkService = dependencies.sdkService;
		this._feedbackService = dependencies.feedbackService;
		this._preferencesStore = dependencies.preferencesStore;
		this._state = dependencies.initialState;
		this._apiKeyService = this._createApiKeyService(dependencies.apiKeyStorage);
		this._panelHost = this._createPanelHost();
		this._presenter = new PanelPresenter(
			dependencies.statusBarItem,
			this._workspacePath,
			(message) => this._panelHost.postMessage(message)
		);
		this._proxyService = this._createProxyService();
		this._proxyWorkflow = this._createProxyWorkflow();
		this._clineWorkflow = this._createClineWorkflow(dependencies);
		this._messageDispatcher = this._createMessageDispatcher();
		this._clineConfigChangeWatcher = this._createClineConfigChangeWatcher(
			dependencies.clineFileStore
		);
	}

	private _createApiKeyService(apiKeyStorage: ApiKeyStorage): ApiKeyService {
		return new ApiKeyService(apiKeyStorage, (displayState) => {
			if (this._state.apiKeyExists) {
				Object.assign(this._state, displayState);
			}
			this._postStateUpdate();
		});
	}

	private _createPanelHost(): PanelHost {
		return new PanelHost(this._extensionContext.extensionPath, {
			onMessage: (message) => this._enqueueWebviewMessage(message),
			onRefreshRequested: () => this._enqueueCompatibilityRefresh(),
			onStateRequested: () => this._postStateUpdate(),
			onInvalidMessage: () =>
				this._presenter.error(
					SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.invalidWebviewPayload
				),
			onExpandedStateChanged: (isExpanded) => {
				this._state.expandedViewOpen = isExpanded;
				this._postStateUpdate();
			},
		});
	}

	private _createProxyService(): ProxyService {
		return new ProxyService({
			onLog: (line, isError) => this._presenter.proxyLog(line, isError),
			onUnexpectedStop: () => {
				this._state = clearRuntimeConfig({
					...this._state,
					proxyStatus: 'stopped',
				});
				this._presenter.setStoppedStatus();
				this._postStateUpdate();
				this._presenter.showError(
					SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.proxyStoppedUnexpectedly
				);
			},
			refreshAuthorization: (authId) => this._sdkService.refreshAuthorization(authId),
		});
	}

	private _createProxyWorkflow(): ProxyWorkflow {
		const proxyLifecycleService = new ProxyLifecycleService(this._proxyService);
		return new ProxyWorkflow({
			sdkService: this._sdkService,
			lifecycleService: proxyLifecycleService,
			proxyService: this._proxyService,
			presenter: this._presenter,
			getState: () => this._state,
			setState: (state) => {
				this._state = state;
			},
			confirmStartDisclaimer: async () => {
				const selection = await vscode.window.showWarningMessage(
					this._presenter.formatNotification(
						SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.startProxyDisclaimer
					),
					{ modal: true },
					SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.startProxyDisclaimerAction
				);
				return selection ===
					SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.startProxyDisclaimerAction;
			},
			ensureSdkDependenciesReady: () => this._ensureSdkDependenciesReady(),
			resolveApiKey: () => this._resolveApiKey(),
			refreshAuthIds: () => this._refreshAuthIds(),
			refreshApiKeyAndCompatibility: () =>
				this._refreshApiKeyAndCompatibility(),
			refreshCompatibility: () => this._clineWorkflow.refreshCompatibility(),
			persistPreferencesNoThrow: () => this._persistPreferencesNoThrow(),
			postStateUpdate: () => this._postStateUpdate(),
		});
	}

	private _createClineWorkflow(
		dependencies: ControlPanelControllerDependencies
	): ClineWorkflow {
		return new ClineWorkflow({
			chatOpener: dependencies.clineChatOpener,
			compatibilityService: dependencies.clineCompatibilityService,
			configService: dependencies.clineConfigService,
			extensionHostRestartService: dependencies.extensionHostRestartService,
			globalState: this._extensionContext.globalState,
			presenter: this._presenter,
			proxyWorkflow: this._proxyWorkflow,
			getState: () => this._state,
			getWorkspacePath: () => this._workspacePath,
			getResolvedApiKey: () => this._apiKeyService.resolvedApiKey,
			isClineInstalled: () => !!vscode.extensions.getExtension(CLINE_EXTENSION_ID),
			confirmExtensionRestart: async () => {
				const restartExtensionsAction =
					SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.restartExtensionsAction;
				const selection = await vscode.window.showWarningMessage(
					this._presenter.formatNotification(
						SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.clineExtensionRestartRequiredPrompt
					),
					{ modal: true },
					restartExtensionsAction
				);
				return selection === restartExtensionsAction;
			},
			resolveApiKey: () => this._resolveApiKeyIgnoringReadErrors(),
			isProxyAvailable: () => this._isProxyAvailable(),
			postStateUpdate: () => this._postStateUpdate(),
		});
	}

	private _createMessageDispatcher(): MessageDispatcher {
		return new MessageDispatcher({
			load: () => this._handleLoad(),
			openExpandedView: () => this._openPanel(),
			copyApiKey: () => this._copyApiKeyToClipboard(),
			updateForm: async (payload) => {
				await this._applyFormChanges(payload);
				await this._clineWorkflow.refreshCompatibility();
				this._postStateUpdate();
			},
			startProxy: async (payload) => {
				await this._applyFormChanges(payload);
				await this._clineWorkflow.refreshCompatibility();
				await this._proxyWorkflow.start();
			},
			stopProxy: () => this._proxyWorkflow.stop(),
			refreshAuthIds: async () => {
				await this._refreshAuthIds();
				this._postStateUpdate();
			},
			setupAccount: async () => {
				await vscode.commands.executeCommand(
					commandsInfoMap.setupaccount.vscodeCommandId
				);
				await this._refreshAuthIds();
				this._postStateUpdate();
			},
			rotateApiKey: () => this._rotateApiKey(),
			applyClineSettings: () => this._clineWorkflow.applySettings(),
			openClineMarketplace: async () => {
				await vscode.commands.executeCommand(
					CLINE_MARKETPLACE_COMMAND_ID,
					`@id:${CLINE_EXTENSION_ID}`
				);
			},
			openOutput: () => this._presenter.openOutput(),
			openClineChat: () => this._clineWorkflow.openChat(),
			submitFeedback: (payload) => this._submitFeedback(payload),
		});
	}

	private _createClineConfigChangeWatcher(
		clineFileStore: ClineFileStore
	): ClineConfigChangeWatcher {
		return new ClineConfigChangeWatcher(
			[
				clineFileStore.providersFile,
				clineFileStore.globalStateFile,
				clineFileStore.secretsFile,
			],
			(filePath) => {
				const homeDirectory = os.homedir();
				const relativePath = path.relative(homeDirectory, filePath).split(path.sep).join('/');
				return vscode.workspace.createFileSystemWatcher(
					new vscode.RelativePattern(homeDirectory, relativePath)
				);
			},
			() => this._enqueueCompatibilityRefresh()
		);
	}

	private get _workspacePath(): string {
		const activeDocumentUri = vscode.window.activeTextEditor?.document.uri;
		const activeWorkspace = activeDocumentUri
			? vscode.workspace.getWorkspaceFolder(activeDocumentUri)
			: undefined;
		return activeWorkspace?.uri.fsPath || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd();
	}

	registerSidebarViewProvider(): void {
		this._panelHost.register(this._extensionContext);
	}

	async open(): Promise<void> {
		try {
			await this._focusSidebar();
		} catch {
			this._openPanel();
		}
	}

	private async _focusSidebar(): Promise<void> {
		await this._panelHost.focusSidebar();
	}

	private _openPanel(): void {
		this._panelHost.openPanel();
	}

	async dispose(): Promise<void> {
		this._clineConfigChangeWatcher.dispose();
		this._apiKeyService.dispose();
		this._panelHost.dispose();
		try {
			await this._proxyService.dispose();
			this._clineWorkflow.resetSessionState();
			this._updateWalkthroughContexts();
			this._presenter.setStoppedStatus();
		} finally {
			this._presenter.dispose();
		}
	}

	async startProxyOnStartupIfEnabled(): Promise<void> {
		const shouldRestartForClineConfig =
			this._extensionContext.globalState.get<boolean>(CLINE_PENDING_PROXY_RESTART_STORAGE_KEY) === true;
		await this._proxyWorkflow.startOnStartupIfEnabled(
			shouldRestartForClineConfig,
			() =>
				this._extensionContext.globalState.update(
					CLINE_PENDING_PROXY_RESTART_STORAGE_KEY,
					undefined
				)
		);
	}

	async showWelcomeIfNeeded(): Promise<void> {
		if (this._state.disableWelcomeNotification) {
			return;
		}

		const selection = await vscode.window.showInformationMessage(
			SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.welcomeMessage,
			SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.welcomeOpenPanelAction,
			SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.welcomeRemindAction,
			SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.welcomeDisableAction
		);
		if (selection === SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.welcomeOpenPanelAction) {
			await this.open();
			return;
		}
		if (selection === SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.welcomeDisableAction) {
			this._state.disableWelcomeNotification = true;
			await this._persistPreferences();
			this._postStateUpdate();
			this._presenter.logSuccess(
				SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.welcomeNotificationDisabled
			);
		}
	}

	async applyPendingClineConfig(): Promise<void> {
		await this._clineWorkflow.applyPendingConfig();
	}

	private async _handleWebviewMessage(message: SuiteCloudPanelIncomingMessage): Promise<void> {
		try {
			await this._messageDispatcher.dispatch(message);
		} catch (error) {
			const isProxyStartAction = message.eventType === SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.START_PROXY;
			const isProxyStopAction = message.eventType === SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.STOP_PROXY;
			const errorMessage = error instanceof Error ? error.message : String(error);
			const friendlyErrorMessage = isProxyStartAction
				? this._proxyWorkflow.formatStartError(errorMessage)
				: errorMessage;
			if (isProxyStartAction) {
				this._state.proxyStatus = 'error';
				this._state.lastError = this._proxyWorkflow.summarizeInlineError(
					friendlyErrorMessage
				);
				this._presenter.setStoppedStatus();
			} else if (message.eventType === SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.STOP_PROXY) {
				this._state.proxyStatus = this._isProxyAvailable() ? 'running' : 'stopped';
			}
			this._postStateUpdate();
			if (isProxyStartAction) {
				this._presenter.error(friendlyErrorMessage);
				this._presenter.endLogSection();
				this._presenter.showProxyStartError(friendlyErrorMessage);
			} else {
				this._presenter.showError(friendlyErrorMessage);
				if (isProxyStopAction) {
					this._presenter.endLogSection();
				}
			}
		}
	}

	private async _handleLoad(): Promise<void> {
		if (this._state.initializationStatus === 'ready') {
			this._postStateUpdate();
		}

		const loadErrors: string[] = [];
		let sdkDependenciesAvailable = true;

		try {
			await this._ensureSdkDependenciesReady();
		} catch (error) {
			sdkDependenciesAvailable = false;
			loadErrors.push(error instanceof Error ? error.message : String(error));
		}

		if (sdkDependenciesAvailable) {
			try {
				await this._refreshAuthIds();
			} catch (error) {
				this._state.authIds = [];
				loadErrors.push(error instanceof Error ? error.message : String(error));
			}

			try {
				await this._refreshApiKeyAndCompatibility();
			} catch (error) {
				loadErrors.push(error instanceof Error ? error.message : String(error));
			}
		}

		this._state.initializationStatus = 'ready';
		this._postStateUpdate();
		if (loadErrors.length > 0) {
			this._presenter.showError(loadErrors.join('\n'));
		}
	}

	private async _refreshAuthIds(): Promise<void> {
		await this._ensureSdkDependenciesReady();
		const authIds = await this._sdkService.getAvailableAuthIds();
		this._state.authIds = authIds;
		const previousAuthId = this._state.authId;

		if (authIds.length > 0 && !authIds.some((item) => item.authId === this._state.authId)) {
			this._state.authId = authIds[0].authId;
		}

		if (previousAuthId !== this._state.authId) {
			this._updatePendingRuntimeConfigFlag();
			void this._persistPreferencesNoThrow();
		}
	}

	private async _refreshApiKeyAndCompatibility(): Promise<void> {
		await this._resolveApiKeyIgnoringReadErrors();
		await this._clineWorkflow.refreshCompatibility();
	}

	private async _resolveApiKey(): Promise<string | undefined> {
		await this._ensureSdkDependenciesReady();
		const resolution = await this._apiKeyService.resolve();
		this._applyApiKeyResolution(resolution);
		return resolution.apiKey;
	}

	private async _resolveApiKeyIgnoringReadErrors(): Promise<string | undefined> {
		await this._ensureSdkDependenciesReady();
		const resolution = await this._apiKeyService.resolveIgnoringReadErrors();
		this._applyApiKeyResolution(resolution);
		return resolution.apiKey;
	}

	private async _applyFormChanges(formData: SuiteCloudPanelUpdateFormPayload): Promise<void> {
		const proxyConfigLocked =
			this._proxyService.isRunning ||
			isProxyLifecycleActive(this._state.proxyStatus);
		const authIdChangeBlocked =
			proxyConfigLocked &&
			typeof formData.authId === 'string' &&
			formData.authId !== this._state.authId;
		const portChangeBlocked =
			proxyConfigLocked &&
			typeof formData.port === 'number' &&
			formData.port !== this._state.port;

		this._state = applyFormChangesToState(this._state, formData);
		await this._persistPreferences();

		if (authIdChangeBlocked) {
			this._presenter.showError(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.authIdChangeRequiresStoppedProxy);
			return;
		}
		if (portChangeBlocked) {
			this._presenter.showError(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.portChangeRequiresStoppedProxy);
		}
	}

	private async _rotateApiKey(): Promise<void> {
		await this._ensureSdkDependenciesReady();
		if (this._proxyService.isRunning || isProxyLifecycleActive(this._state.proxyStatus)) {
			throw new Error(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.apiKeyChangeRequiresStoppedProxy);
		}
		const hasExistingKey = this._state.apiKeyExists;
		const continueLabel = hasExistingKey
			? SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.rotateExistingAction
			: SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.rotateMissingAction;
		const answer = await vscode.window.showWarningMessage(
			this._presenter.formatNotification(
				hasExistingKey
					? SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.rotateExistingPrompt
					: SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.rotateMissingPrompt
			),
			{ modal: true },
			continueLabel
		);
		if (answer !== continueLabel) {
			return;
		}

		this._applyApiKeyResolution(await this._apiKeyService.generate());
		await this._clineWorkflow.refreshCompatibility();
		this._postStateUpdate();
		this._presenter.logSuccess(
			hasExistingKey
				? SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.apiKeyRotated
				: SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.apiKeyGenerated
		);
	}

	private async _submitFeedback(payload: SuiteCloudPanelSubmitFeedbackPayload): Promise<void> {
		if (!this._isProxyAvailable()) {
			throw new Error(SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.feedbackProxyRequired);
		}

		const apiKey = await this._resolveApiKeyIgnoringReadErrors();
		if (!apiKey || !apiKey.trim()) {
			throw new Error(SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.missingApiKey);
		}

		await this._feedbackService.submit({
			payload,
			apiKey,
			port: this._state.runtimePort || this._state.port,
		});
		const successMessage = SUITECLOUD_PANEL_RUNTIME_STRINGS.messages.feedbackSubmitted;
		this._presenter.showSuccess(successMessage);
		this._presenter.postActionSuccess(successMessage, 'SUBMIT_FEEDBACK');
	}

	private async _persistPreferences(): Promise<void> {
		const preferences: PersistedPanelPreferences = {
			authId: this._state.authId,
			port: this._state.port,
			clineScope: this._state.clineScope,
			autoStartProxyOnStartup: this._state.autoStartProxyOnStartup,
			disableWelcomeNotification: this._state.disableWelcomeNotification,
		};

		await this._preferencesStore.save(preferences);
	}

	private async _persistPreferencesNoThrow(): Promise<void> {
		try {
			await this._persistPreferences();
		} catch (error) {
			this._presenter.error(
				SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.preferencesSaveFailed(String(error))
			);
		}
	}

	private async _copyApiKeyToClipboard(): Promise<void> {
		const copyableApiKey = this._apiKeyService.getCopyableApiKey();
		if (!copyableApiKey) {
			this._state.apiKeyVisible = false;
			this._postStateUpdate();
			this._presenter.showError(
				SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.apiKeyCopyExpired
			);
			return;
		}

		await vscode.env.clipboard.writeText(copyableApiKey);
		this._presenter.showSuccess(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.copyValue('API key'));
	}

	private _updatePendingRuntimeConfigFlag(): void {
		this._state.hasPendingRuntimeConfig = calculatePendingRuntimeConfig(this._state);
	}

	private async _ensureSdkDependenciesReady(): Promise<void> {
		await this._sdkDependenciesReady;
		if (!this._state.isSdkReady) {
			this._state.isSdkReady = true;
			this._postStateUpdate();
		}
	}

	private _isProxyAvailable(): boolean {
		return this._state.proxyStatus === 'running' && this._proxyService.isRunning;
	}

	private _applyApiKeyResolution(resolution: ApiKeyResolution): void {
		Object.assign(this._state, resolution.displayState);
		this._state = clearMissingApiKeyErrorIfResolved(this._state);
	}

	private _enqueueWebviewMessage(message: SuiteCloudPanelIncomingMessage): void {
		this._messageQueue = this._messageQueue
			.then(() => this._handleWebviewMessage(message))
			.catch((error) => {
				this._presenter.error(
					SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.commandQueueFailed(String(error))
				);
			});
	}

	private _enqueueCompatibilityRefresh(): void {
		this._messageQueue = this._messageQueue
			.then(async () => {
				await this._refreshApiKeyAndCompatibility();
				this._postStateUpdate();
			})
			.catch((error) => {
				this._presenter.error(
					SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.stateRefreshFailed(String(error))
				);
			});
	}

	private _postStateUpdate(): void {
		this._updateWalkthroughContexts();
		this._panelHost.postMessage({
			eventType: SUITECLOUD_PANEL_EVENTS.TO_WEBVIEW.STATE_UPDATE,
			eventData: this._state,
		});
	}

	private _updateWalkthroughContexts(): void {
		void vscode.commands.executeCommand('setContext', WALKTHROUGH_CONTEXT_KEYS.proxyRunning, this._isProxyAvailable());
		void vscode.commands.executeCommand(
			'setContext',
			WALKTHROUGH_CONTEXT_KEYS.clineApplied,
			this._clineWorkflow.appliedInSession
		);
		void vscode.commands.executeCommand(
			'setContext',
			WALKTHROUGH_CONTEXT_KEYS.welcomeNotificationDisabled,
			this._state.disableWelcomeNotification === true
		);
	}

}
