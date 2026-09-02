/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import PreferencesStore, {
	PersistedPanelPreferences,
} from '../service/controlPanel/devAssist/PreferencesStore';
import ClineChatOpener from '../service/controlPanel/devAssist/cline/ChatOpener';
import ClineIntegrationAdapter from '../service/controlPanel/devAssist/cline/IntegrationAdapter';
import {
	buildProxyBaseUrl,
	createInitialPanelState,
	getDefaultPanelSettings,
} from './devAssist/Configuration';
import { CLINE_EXTENSION_ID } from '../service/controlPanel/devAssist/cline/Constants';
import { SUITECLOUD_PANEL_RUNTIME_STRINGS } from './devAssist/Strings';
import {
	applyFormChangesToState,
	calculatePendingRuntimeConfig,
	clearRuntimeConfig,
	isProxyLifecycleActive,
} from './devAssist/StateTransitions';
import {
	SuiteCloudPanelIncomingMessage,
	SuiteCloudPanelSubmitFeedbackPayload,
	SuiteCloudPanelUpdateFormPayload,
	SUITECLOUD_PANEL_EVENTS,
} from './devAssist/Messages';
import { SuiteCloudPanelState } from './devAssist/State';
import ExtensionHostRestartService from '../service/controlPanel/devAssist/ExtensionHostRestartService';
import FeedbackService from '../service/controlPanel/devAssist/FeedbackService';
import ApiKeyService, {
	ApiKeyResolution,
} from '../service/controlPanel/devAssist/ApiKeyService';
import SdkApiKeyStorage from '../service/controlPanel/devAssist/SdkApiKeyStorage';
import ClineCompatibilityService from '../service/controlPanel/devAssist/cline/ClineCompatibilityService';
import ClineConfigService from '../service/controlPanel/devAssist/cline/ClineConfigService';
import CliService from '../service/controlPanel/devAssist/CliService';
import ProxyLifecycleService from '../service/controlPanel/devAssist/proxy/ProxyLifecycleService';
import ProxyService from '../service/controlPanel/devAssist/proxy/ProxyService';
import Presenter from '../webviews/controlPanel/Presenter';
import ViewHost from '../webviews/controlPanel/ViewHost';
import MessageDispatcher from './devAssist/MessageDispatcher';
import ClineWorkflow, {
	CLINE_PENDING_PROXY_RESTART_STORAGE_KEY,
} from './devAssist/workflows/ClineWorkflow';
import ProxyWorkflow from './devAssist/workflows/ProxyWorkflow';

const SETUP_ACCOUNT_COMMAND_ID = 'suitecloud.setupaccount';
const PANEL_STATE_STORAGE_KEY = 'suitecloud.controlPanel.state.v1';
const WALKTHROUGH_CONTEXT_KEYS = {
	proxyRunning: 'suitecloud.controlPanel.proxyRunning',
	clineApplied: 'suitecloud.controlPanel.clineApplied',
	welcomeNotificationDisabled: 'suitecloud.controlPanel.welcomeNotificationDisabled',
} as const;

let controlPanelController: ControlPanelController | undefined;

export const initializeSuiteCloudControlPanel = (
	extensionContext: vscode.ExtensionContext,
	statusBarItem: vscode.StatusBarItem,
	sdkDependenciesReady: Promise<void>
) => {
	if (!controlPanelController) {
		controlPanelController = new ControlPanelController(
			extensionContext,
			statusBarItem,
			sdkDependenciesReady
		);
		controlPanelController.registerSidebarViewProvider();
	}
	return controlPanelController;
};

export const openSuiteCloudControlPanel = async (): Promise<void> => {
	if (!controlPanelController) {
		return;
	}
	try {
		await controlPanelController.focusSidebar();
	} catch {
		controlPanelController.openPanel();
	}
};

export const disposeSuiteCloudControlPanel = async (): Promise<void> => {
	await controlPanelController?.dispose();
	controlPanelController = undefined;
};

export const startSuiteCloudControlPanelProxyIfEnabled = async (): Promise<void> => {
	if (!controlPanelController) {
		return;
	}
	await controlPanelController.startProxyOnStartupIfEnabled();
};

export const showSuiteCloudControlPanelWelcomeIfNeeded = async (): Promise<void> => {
	if (!controlPanelController) {
		return;
	}
	await controlPanelController.showWelcomeIfNeeded();
};

export const applyPendingSuiteCloudClineConfig = async (): Promise<void> => {
	await controlPanelController?.applyPendingClineConfig();
};

class ControlPanelController {
	private readonly _extensionContext: vscode.ExtensionContext;
	private readonly _cliService: CliService;
	private readonly _proxyService: ProxyService;
	private readonly _proxyWorkflow: ProxyWorkflow;
	private readonly _clineWorkflow: ClineWorkflow;
	private readonly _messageDispatcher: MessageDispatcher;
	private readonly _presenter: Presenter;
	private readonly _preferencesStore: PreferencesStore;
	private readonly _feedbackService: FeedbackService;
	private readonly _apiKeyService: ApiKeyService;
	private readonly _viewHost: ViewHost;
	private readonly _sdkDependenciesReady: Promise<void>;
	private _state: SuiteCloudPanelState;
	private _messageQueue: Promise<void> = Promise.resolve();

	constructor(
		extensionContext: vscode.ExtensionContext,
		statusBarItem: vscode.StatusBarItem,
		sdkDependenciesReady: Promise<void>
	) {
		this._extensionContext = extensionContext;
		this._sdkDependenciesReady = sdkDependenciesReady;
		this._cliService = new CliService();
		const clineAdapter = new ClineIntegrationAdapter();
		const clineChatOpener = new ClineChatOpener(vscode.commands);
		const clineCompatibilityService = new ClineCompatibilityService(clineAdapter);
		const clineConfigService = new ClineConfigService(
			clineAdapter,
			this._extensionContext.globalState
		);
		const extensionHostRestartService = new ExtensionHostRestartService(
			(commandId) => vscode.commands.executeCommand(commandId)
		);
		this._feedbackService = new FeedbackService();
		this._apiKeyService = new ApiKeyService(
			new SdkApiKeyStorage(),
			(displayState) => {
				if (this._state.apiKeyExists) {
					Object.assign(this._state, displayState);
				}
				this._postStateUpdate();
			}
		);
		this._preferencesStore = new PreferencesStore(
			this._extensionContext.workspaceState,
			PANEL_STATE_STORAGE_KEY
		);

		const defaults = getDefaultPanelSettings();
		const persistedPreferences = this._preferencesStore.load(defaults);
		this._state = createInitialPanelState(defaults, persistedPreferences);
		this._viewHost = new ViewHost(this._extensionContext.extensionPath, {
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
		this._presenter = new Presenter(
			statusBarItem,
			this._workspacePath,
			(message) => this._viewHost.postMessage(message)
		);

		this._proxyService = new ProxyService({
			onLog: (line, isError) => this._presenter.proxyLog(line, isError),
			onUnexpectedStop: () => {
				this._state = clearRuntimeConfig({
					...this._state,
					proxyStatus: 'stopped',
				});
				this._presenter.setStoppedStatus();
				this._postStateUpdate();
				this._presenter.showError('Proxy stopped unexpectedly.');
			},
			refreshAuthorization: (authId) => this._cliService.refreshAuthorization(authId),
		});
		const proxyLifecycleService = new ProxyLifecycleService(this._proxyService);
		this._proxyWorkflow = new ProxyWorkflow({
			cliService: this._cliService,
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
		this._clineWorkflow = new ClineWorkflow({
			chatOpener: clineChatOpener,
			compatibilityService: clineCompatibilityService,
			configService: clineConfigService,
			extensionHostRestartService,
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
					restartExtensionsAction,
					SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.cancelAction
				);
				return selection === restartExtensionsAction;
			},
			resolveApiKey: () => this._resolveApiKeyIgnoringReadErrors(),
			isProxyAvailable: () => this._isProxyAvailable(),
			postStateUpdate: () => this._postStateUpdate(),
		});
		this._messageDispatcher = new MessageDispatcher({
			load: () => this._handleLoad(),
			openExpandedView: () => this.openPanel(),
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
				await vscode.commands.executeCommand(SETUP_ACCOUNT_COMMAND_ID);
				await this._refreshAuthIds();
				this._postStateUpdate();
			},
			rotateApiKey: () => this._rotateApiKey(),
			applyClineSettings: () => this._clineWorkflow.applySettings(),
			openClineMarketplace: async () => {
				await vscode.commands.executeCommand(
					'workbench.extensions.search',
					`@id:${CLINE_EXTENSION_ID}`
				);
			},
			openOutput: () => this._presenter.openOutput(),
			openClineChat: () => this._clineWorkflow.openChat(),
			submitFeedback: (payload) => this._submitFeedback(payload),
		});
	}

	get _workspacePath(): string {
		const activeDocumentUri = vscode.window.activeTextEditor?.document.uri;
		const activeWorkspace = activeDocumentUri
			? vscode.workspace.getWorkspaceFolder(activeDocumentUri)
			: undefined;
		return activeWorkspace?.uri.fsPath || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd();
	}

	registerSidebarViewProvider(): void {
		this._viewHost.register(this._extensionContext);
	}

	async focusSidebar(): Promise<void> {
		await this._viewHost.focusSidebar();
	}

	openPanel(): void {
		this._viewHost.openPanel();
	}

	async dispose(): Promise<void> {
		this._apiKeyService.dispose();
		this._viewHost.dispose();
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
			this._presenter.formatNotification(SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.welcomeMessage),
			SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.welcomeOpenPanelAction,
			SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.welcomeRemindAction,
			SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.welcomeDisableAction
		);
		if (selection === SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.welcomeOpenPanelAction) {
			await openSuiteCloudControlPanel();
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
		await this._ensureSdkDependenciesReady();
		const loadErrors: string[] = [];
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

		this._postStateUpdate();
		if (loadErrors.length > 0) {
			this._presenter.showError(loadErrors.join('\n'));
		}
	}

	private async _refreshAuthIds(): Promise<void> {
		await this._ensureSdkDependenciesReady();
		const authIds = await this._cliService.getAvailableAuthIds();
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
		await this._refreshCompatibility();
	}

	private async _refreshCompatibility(): Promise<void> {
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
		const previousPort = this._state.port;
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
		if (this._state.port !== previousPort) {
			this._state.baseUrl = buildProxyBaseUrl(this._state.port);
		}
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
		await this._refreshCompatibility();
		this._postStateUpdate();
		this._presenter.logSuccess(
			hasExistingKey
				? SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.apiKeyRotated
				: SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.apiKeyGenerated
		);
	}

	private async _submitFeedback(payload: SuiteCloudPanelSubmitFeedbackPayload): Promise<void> {
		if (!this._isProxyAvailable()) {
			throw new Error('Start proxy before submitting feedback.');
		}

		const apiKey = await this._resolveApiKeyIgnoringReadErrors();
		if (!apiKey || !apiKey.trim()) {
			throw new Error('No API key is available. Generate or rotate API key first.');
		}

		await this._feedbackService.submit({
			payload,
			apiKey,
			port: this._state.runtimePort || this._state.port,
		});
		const successMessage = 'Feedback submitted successfully. Thank you!';
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
			this._presenter.error(`Unable to persist SuiteCloud Control Panel preferences: ${String(error)}`);
		}
	}

	private async _copyApiKeyToClipboard(): Promise<void> {
		const copyableApiKey = this._apiKeyService.getCopyableApiKey();
		if (!copyableApiKey) {
			this._state.apiKeyVisible = false;
			this._postStateUpdate();
			this._presenter.showError('The API key copy window has expired. Rotate the key to copy a new value.');
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
	}

	private _enqueueWebviewMessage(message: SuiteCloudPanelIncomingMessage): void {
		this._messageQueue = this._messageQueue
			.then(() => this._handleWebviewMessage(message))
			.catch((error) => {
				this._presenter.error(`Unexpected command queue failure: ${String(error)}`);
			});
	}

	private _enqueueCompatibilityRefresh(): void {
		this._messageQueue = this._messageQueue
			.then(async () => {
				await this._refreshApiKeyAndCompatibility();
				this._postStateUpdate();
			})
			.catch((error) => {
				this._presenter.error(`Unable to refresh panel state: ${String(error)}`);
			});
	}

	private _postStateUpdate(): void {
		this._updateWalkthroughContexts();
		this._viewHost.postMessage({
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
