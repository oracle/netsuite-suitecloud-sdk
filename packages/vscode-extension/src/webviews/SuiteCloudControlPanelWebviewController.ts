/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as path from 'path';
import * as vscode from 'vscode';
import { DEVASSIST } from '../ApplicationConstants';
import VSConsoleLogger from '../loggers/VSConsoleLogger';
import { DEVASSIST_SERVICE } from '../service/TranslationKeys';
import { VSTranslationService } from '../service/VSTranslationService';
import SuiteCloudControlPanelPreferencesStore, {
	PersistedPanelPreferences,
} from './SuiteCloudControlPanelPreferencesStore';
import ClineIntegrationAdapter from '../panel/ClineIntegrationAdapter';
import ExtensionHostRestartService from '../panel/ExtensionHostRestartService';
import SuiteCloudPanelCliService from '../panel/SuiteCloudPanelCliService';
import SuiteCloudProxyProcessService from '../panel/SuiteCloudProxyProcessService';
import SuiteCloudFeedbackService from '../panel/SuiteCloudFeedbackService';
import { CLINE_EXTENSION_ID } from '../panel/cline/ClineConstants';
import {
	SUITECLOUD_PANEL_RUNTIME_STRINGS,
} from '../panel/SuiteCloudPanelStrings';
import {
	applyFormChangesToState,
	calculatePendingRuntimeConfig,
	clearRuntimeConfig,
	markRuntimeConfigAsActive,
} from '../panel/SuiteCloudPanelStateTransitions';
import {
	parseSuiteCloudPanelIncomingMessage,
	SuiteCloudPanelAction,
	SuiteCloudPanelIncomingMessage,
	SuiteCloudPanelOutgoingMessage,
	SuiteCloudPanelSubmitFeedbackPayload,
	SuiteCloudPanelState,
	SuiteCloudPanelUpdateFormPayload,
	SUITECLOUD_PANEL_EVENTS,
} from '../panel/SuiteCloudPanelTypes';
import SuiteCloudPanelHtmlRenderer, {
	SuiteCloudPanelWebviewMode,
} from './SuiteCloudPanelHtmlRenderer';

const PANEL_VIEW_TYPE = 'suitecloudControlPanel';
const SIDEBAR_CONTAINER_ID = 'suitecloud';
const SIDEBAR_VIEW_ID = 'suitecloud.devAssistControlPanelView';
const SETUP_ACCOUNT_COMMAND_ID = 'suitecloud.setupaccount';
const PANEL_TITLE = SUITECLOUD_PANEL_RUNTIME_STRINGS.panelTitle;
const SUITECLOUD_MODEL_ID = SUITECLOUD_PANEL_RUNTIME_STRINGS.modelId;
const DEVASSIST_BASE_PATH = '/api/internal/devassist';
const CONTROL_PANEL_LOG_PREFIX = SUITECLOUD_PANEL_RUNTIME_STRINGS.logPrefix;
const DEVASSIST_OUTPUT_CHANNEL_NAME = 'SuiteCloud: Developer Assistant';
const API_KEY_HIDDEN_HINT = SUITECLOUD_PANEL_RUNTIME_STRINGS.apiKey.hiddenHint;
const VALID_PORT_MIN = 1024;
const VALID_PORT_MAX = 65535;
const API_KEY_PREVIEW_WINDOW_MS = 5 * 60 * 1000;
const API_KEY_EXISTS_HIDDEN_LABEL = SUITECLOUD_PANEL_RUNTIME_STRINGS.apiKey.hiddenExistingLabel;
const API_KEY_NOT_FOUND_LABEL = SUITECLOUD_PANEL_RUNTIME_STRINGS.apiKey.notFoundLabel;
const SIDEBAR_WEBVIEW_MODE = 'sidebar';
const PANEL_WEBVIEW_MODE = 'panel';
const PANEL_STATE_STORAGE_KEY = 'suitecloud.controlPanel.state.v1';
const CLINE_PENDING_CONFIG_STORAGE_KEY = 'suitecloud.controlPanel.pendingClineConfig.v1';
const CLINE_PENDING_PROXY_RESTART_STORAGE_KEY = 'suitecloud.controlPanel.pendingClineProxyRestart.v1';
const CLINE_POST_WRITE_VERIFICATION_DELAY_MS = 750;
const WALKTHROUGH_CONTEXT_KEYS = {
	proxyRunning: 'suitecloud.controlPanel.proxyRunning',
	clineApplied: 'suitecloud.controlPanel.clineApplied',
	welcomeNotificationDisabled: 'suitecloud.controlPanel.welcomeNotificationDisabled',
} as const;

type PendingClineConfig = {
	baseUrl: string;
	modelId: string;
};

let suiteCloudControlPanelController: SuiteCloudControlPanelController | undefined;
const assertUnreachable = (value: never): never => {
	throw new Error(`Unhandled control panel event: ${String(value)}`);
};

export const initializeSuiteCloudControlPanel = (
	extensionContext: vscode.ExtensionContext,
	statusBarItem: vscode.StatusBarItem,
	sdkDependenciesReady: Promise<void>
) => {
	if (!suiteCloudControlPanelController) {
		suiteCloudControlPanelController = new SuiteCloudControlPanelController(
			extensionContext,
			statusBarItem,
			sdkDependenciesReady
		);
		suiteCloudControlPanelController.registerSidebarViewProvider();
	}
	return suiteCloudControlPanelController;
};

export const openSuiteCloudControlPanel = async (): Promise<void> => {
	if (!suiteCloudControlPanelController) {
		return;
	}
	try {
		await suiteCloudControlPanelController.focusSidebar();
	} catch {
		suiteCloudControlPanelController.openPanel();
	}
};

export const disposeSuiteCloudControlPanel = async (): Promise<void> => {
	await suiteCloudControlPanelController?.dispose();
	suiteCloudControlPanelController = undefined;
};

export const startSuiteCloudControlPanelProxyIfEnabled = async (): Promise<void> => {
	if (!suiteCloudControlPanelController) {
		return;
	}
	await suiteCloudControlPanelController.startProxyOnStartupIfEnabled();
};

export const showSuiteCloudControlPanelWelcomeIfNeeded = async (): Promise<void> => {
	if (!suiteCloudControlPanelController) {
		return;
	}
	await suiteCloudControlPanelController.showWelcomeIfNeeded();
};

export const applyPendingSuiteCloudClineConfig = async (): Promise<void> => {
	await suiteCloudControlPanelController?.applyPendingClineConfig();
};

class SuiteCloudControlPanelController implements vscode.WebviewViewProvider {
	private readonly _extensionContext: vscode.ExtensionContext;
	private readonly _statusBarItem: vscode.StatusBarItem;
	private readonly _cliService: SuiteCloudPanelCliService;
	private readonly _clineAdapter: ClineIntegrationAdapter;
	private readonly _extensionHostRestartService: ExtensionHostRestartService;
	private readonly _proxyProcessService: SuiteCloudProxyProcessService;
	private readonly _outputChannel: vscode.OutputChannel;
	private readonly _vsLogger: VSConsoleLogger;
	private readonly _translationService: VSTranslationService;
	private readonly _preferencesStore: SuiteCloudControlPanelPreferencesStore;
	private readonly _feedbackService: SuiteCloudFeedbackService;
	private readonly _htmlRenderer: SuiteCloudPanelHtmlRenderer;
	private readonly _sdkDependenciesReady: Promise<void>;
	private _panel: vscode.WebviewPanel | undefined;
	private _sidebarView: vscode.WebviewView | undefined;
	private _state: SuiteCloudPanelState;
	private _resolvedApiKey: string | undefined;
	private _generatedApiKeyPreview: { apiKey: string; visibleUntilMs: number } | undefined;
	private _apiKeyPreviewHideTimeout: ReturnType<typeof setTimeout> | undefined;
	private _clineAppliedInSession = false;
	private _messageQueue: Promise<void> = Promise.resolve();

	constructor(
		extensionContext: vscode.ExtensionContext,
		statusBarItem: vscode.StatusBarItem,
		sdkDependenciesReady: Promise<void>
	) {
		this._extensionContext = extensionContext;
		this._statusBarItem = statusBarItem;
		this._sdkDependenciesReady = sdkDependenciesReady;
		this._cliService = new SuiteCloudPanelCliService();
		this._clineAdapter = new ClineIntegrationAdapter();
		this._extensionHostRestartService = new ExtensionHostRestartService(
			(commandId) => vscode.commands.executeCommand(commandId)
		);
		this._outputChannel = vscode.window.createOutputChannel(DEVASSIST_OUTPUT_CHANNEL_NAME);
		this._vsLogger = new VSConsoleLogger(true, this._workspacePath, this._outputChannel);
		this._translationService = new VSTranslationService();
		this._feedbackService = new SuiteCloudFeedbackService();
		this._htmlRenderer = new SuiteCloudPanelHtmlRenderer(this._extensionContext.extensionPath);
		this._preferencesStore = new SuiteCloudControlPanelPreferencesStore(
			this._extensionContext.workspaceState,
			PANEL_STATE_STORAGE_KEY
		);

		const defaults = this._cliService.getDefaultPanelSettings();
		const persistedPreferences = this._preferencesStore.load(defaults);
		const initialPort = this._sanitizePort(persistedPreferences.port, defaults.localPort);
		const baseUrl = this._buildBaseUrl(initialPort);

		this._state = {
			isSdkReady: false,
			authId: persistedPreferences.authId || defaults.authId,
			port: initialPort,
			runtimeAuthId: null,
			runtimePort: null,
			hasPendingRuntimeConfig: false,
			apiKeySource: 'unknown',
			maskedApiKey: API_KEY_NOT_FOUND_LABEL,
			apiKeyVisible: false,
			apiKeyVisibleUntilMs: null,
			apiKeyExists: false,
			apiKeyActionLabel: SUITECLOUD_PANEL_RUNTIME_STRINGS.apiKey.generateLabel,
			apiKeyVisibilityInfo: SUITECLOUD_PANEL_RUNTIME_STRINGS.apiKey.notFoundInfo,
			proxyStatus: 'stopped',
			proxyPid: null,
			baseUrl,
			lastError: null,
			proxyOwnership: 'none',
			autoStartProxyOnStartup: persistedPreferences.autoStartProxyOnStartup,
			disableWelcomeNotification: persistedPreferences.disableWelcomeNotification,
			clineScope: persistedPreferences.clineScope,
			authIds: [],
			isClineCompatible: false,
			clineCompatibilityMessage: null,
			isClineConfigInSync: false,
			clineConfigSyncMessage: null,
			expandedViewOpen: false,
		};

		this._proxyProcessService = new SuiteCloudProxyProcessService({
			onLog: (line, isError) => {
				if (isError) {
					this._vsLogger.error(line);
				} else {
					this._vsLogger.info(line);
				}
			},
			onProcessClosed: (exitCode, signal) => {
				this._state = clearRuntimeConfig({
					...this._state,
					proxyStatus: 'stopped',
					proxyPid: null,
				});
				this._setStoppedStatusBarMessage();
				this._postStateUpdate();
				if (exitCode !== 0 && exitCode !== null) {
					this._sendActionError(`Proxy exited unexpectedly with code ${exitCode}${signal ? ` (${signal})` : ''}.`);
				}
			},
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
		const controlPanelDisposable = vscode.window.registerWebviewViewProvider(SIDEBAR_VIEW_ID, this, {
			webviewOptions: {
				retainContextWhenHidden: true,
			},
		});
		const extensionChangeDisposable = vscode.extensions.onDidChange(() => {
			this._enqueueCompatibilityRefresh();
		});
		this._extensionContext.subscriptions.push(controlPanelDisposable, extensionChangeDisposable);
	}

	async focusSidebar(): Promise<void> {
		if (this._panel) {
			this._panel.dispose();
		}
		await vscode.commands.executeCommand(`workbench.view.extension.${SIDEBAR_CONTAINER_ID}`);
		await vscode.commands.executeCommand(`${SIDEBAR_VIEW_ID}.focus`);
	}

	resolveWebviewView(
		webviewView: vscode.WebviewView,
		_context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken
	): void {
		this._sidebarView = webviewView;
		this._configureWebview(webviewView.webview, SIDEBAR_WEBVIEW_MODE);
		this._postStateUpdate();
		webviewView.onDidChangeVisibility(() => {
			if (webviewView.visible) {
				this._enqueueCompatibilityRefresh();
			}
		});

		webviewView.onDidDispose(() => {
			if (this._sidebarView === webviewView) {
				this._sidebarView = undefined;
			}
		});
	}

	openPanel(): void {
		if (this._panel) {
			this._panel.reveal(vscode.ViewColumn.One);
			return;
		}

		this._state.expandedViewOpen = true;
		this._panel = vscode.window.createWebviewPanel(PANEL_VIEW_TYPE, PANEL_TITLE, vscode.ViewColumn.One, {});
		this._configureWebview(this._panel.webview, PANEL_WEBVIEW_MODE);
		this._panel.onDidChangeViewState(({ webviewPanel }) => {
			if (webviewPanel.visible) {
				this._enqueueCompatibilityRefresh();
			}
		});
		this._panel.onDidDispose(() => {
			this._panel = undefined;
			this._state.expandedViewOpen = false;
			this._postStateUpdate();
		});
		this._postStateUpdate();
	}

	async dispose(): Promise<void> {
		this._clearApiKeyPreviewHideTimeout();
		this._panel?.dispose();
		try {
			await this._proxyProcessService.dispose();
			this._clineAppliedInSession = false;
			this._updateWalkthroughContexts();
			this._setStoppedStatusBarMessage();
		} finally {
			this._outputChannel.dispose();
		}
	}

	async startProxyOnStartupIfEnabled(): Promise<void> {
		const shouldRestartForClineConfig =
			this._extensionContext.globalState.get<boolean>(CLINE_PENDING_PROXY_RESTART_STORAGE_KEY) === true;
		if (
			(!this._state.autoStartProxyOnStartup && !shouldRestartForClineConfig) ||
			this._proxyProcessService.isRunning
		) {
			return;
		}
		try {
			await this._refreshAuthIds();
			await this._refreshApiKeyAndCompatibility(false);
			await this._startProxy(false, true);
			if (shouldRestartForClineConfig) {
				await this._extensionContext.globalState.update(CLINE_PENDING_PROXY_RESTART_STORAGE_KEY, undefined);
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			const friendlyErrorMessage = this._toFriendlyProxyStartError(errorMessage);
			this._state.proxyStatus = 'error';
			this._state.lastError = this._toInlineErrorSummary(friendlyErrorMessage);
			this._setStoppedStatusBarMessage();
			this._postStateUpdate();
			this._sendActionError(`Auto-start failed: ${friendlyErrorMessage}`);
			this._vsLogger.endSection();
		}
	}

	async showWelcomeIfNeeded(): Promise<void> {
		if (this._state.disableWelcomeNotification) {
			return;
		}

		const selection = await vscode.window.showInformationMessage(
			this._formatNotificationMessage(SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.welcomeMessage),
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
			this._sendActionSuccess(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.welcomeNotificationDisabled);
		}
	}

	async applyPendingClineConfig(): Promise<void> {
		const pendingConfig = this._extensionContext.globalState.get<PendingClineConfig>(
			CLINE_PENDING_CONFIG_STORAGE_KEY
		);
		if (!pendingConfig?.baseUrl || !pendingConfig.modelId) {
			return;
		}

		try {
			await this._ensureSdkDependenciesReady();
			const apiKey = await this._resolveApiKey(false);
			if (!apiKey) {
				throw new Error('SuiteCloud CLI API key is not available.');
			}
			const result = await this._clineAdapter.applyConfig({
				scope: 'user',
				workspacePath: this._workspacePath,
				apiKey,
				baseUrl: pendingConfig.baseUrl,
				modelId: pendingConfig.modelId,
			});
			if (!result.applied) {
				throw new Error(result.message);
			}
			await this._sleep(CLINE_POST_WRITE_VERIFICATION_DELAY_MS);
			const syncResult = await this._clineAdapter.checkConfigSync({
				scope: 'user',
				workspacePath: this._workspacePath,
				apiKey,
				baseUrl: pendingConfig.baseUrl,
				modelId: pendingConfig.modelId,
			});
			if (!syncResult.comparable || !syncResult.inSync) {
				throw new Error(syncResult.message);
			}
			await this._extensionContext.globalState.update(CLINE_PENDING_CONFIG_STORAGE_KEY, undefined);
			this._logControlPanelInfo('Applied pending Cline configuration during SuiteCloud activation.');
		} catch (error) {
			this._logControlPanelError(`Unable to apply pending Cline configuration: ${String(error)}`);
		}
	}

	private async _handleWebviewMessage(message: SuiteCloudPanelIncomingMessage): Promise<void> {
		try {
			switch (message.eventType) {
				case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.LOAD:
					await this._handleLoad();
					break;
				case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.OPEN_EXPANDED_VIEW:
					this.openPanel();
					break;
				case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.COPY_API_KEY:
					await this._copyApiKeyToClipboard();
					break;
				case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.UPDATE_FORM:
					await this._applyFormChanges(message.eventData || {});
					await this._refreshCompatibility();
					this._postStateUpdate();
					break;
				case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.START_PROXY:
					await this._applyFormChanges(message.eventData || {});
					await this._refreshCompatibility();
					await this._startProxy();
					break;
				case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.STOP_PROXY:
					await this._stopProxy();
					break;
				case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.AUTH_ID_DROPDOWN_OPEN:
					await this._refreshAuthIds();
					this._postStateUpdate();
					break;
				case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.SETUP_ACCOUNT:
					await vscode.commands.executeCommand(SETUP_ACCOUNT_COMMAND_ID);
					await this._refreshAuthIds();
					this._postStateUpdate();
					break;
				case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.ROTATE_KEY:
					await this._rotateApiKey();
					break;
				case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.APPLY_CLINE_SETTINGS:
					await this._applyClineSettings(true);
					break;
				case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.OPEN_CLINE_MARKETPLACE:
					await vscode.commands.executeCommand(
						'workbench.extensions.search',
						`@id:${CLINE_EXTENSION_ID}`
					);
					break;
				case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.OPEN_OUTPUT:
					this._openOutputChannel();
					break;
				case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.OPEN_CLINE_CHAT:
					await this._openClineChat();
					break;
				case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.SUBMIT_FEEDBACK:
					await this._submitFeedback(message.eventData || {});
					break;
				default:
					assertUnreachable(message);
			}
		} catch (error) {
			const isProxyStartAction = message.eventType === SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.START_PROXY;
			const isProxyStopAction = message.eventType === SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.STOP_PROXY;
			const errorMessage = error instanceof Error ? error.message : String(error);
			const friendlyErrorMessage = isProxyStartAction ? this._toFriendlyProxyStartError(errorMessage) : errorMessage;
			if (isProxyStartAction) {
				this._state.proxyStatus = 'error';
				this._state.lastError = this._toInlineErrorSummary(friendlyErrorMessage);
				this._setStoppedStatusBarMessage();
			} else if (message.eventType === SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.STOP_PROXY) {
				this._state.proxyStatus = this._isProxyAvailable() ? 'running' : 'stopped';
			}
			this._postStateUpdate();
			if (isProxyStartAction) {
				this._logControlPanelError(friendlyErrorMessage);
				this._vsLogger.endSection();
				this._showProxyStartErrorNotification(friendlyErrorMessage);
			} else {
				this._sendActionError(friendlyErrorMessage);
				if (isProxyStopAction) {
					this._vsLogger.endSection();
				}
			}
		}
	}

	private _showProxyStartErrorNotification(errorMessage: string): void {
		const openOutputAction = 'Open Output';
		void vscode.window.showErrorMessage(this._formatNotificationMessage(errorMessage), openOutputAction).then(
			(selection) => {
				if (selection === openOutputAction) {
					this._openOutputChannel();
				}
			},
			(error) => {
				this._logControlPanelError(`Unable to show proxy startup error notification: ${String(error)}`);
			}
		);
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
			await this._refreshApiKeyAndCompatibility(false);
		} catch (error) {
			loadErrors.push(error instanceof Error ? error.message : String(error));
		}

		this._postStateUpdate();
		if (loadErrors.length > 0) {
			this._sendActionError(loadErrors.join('\n'));
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

	private async _refreshApiKeyAndCompatibility(allowGenerate: boolean): Promise<void> {
		await this._resolveApiKey(allowGenerate);
		await this._refreshCompatibility();
	}

	private async _refreshCompatibility(): Promise<void> {
		if (!vscode.extensions.getExtension(CLINE_EXTENSION_ID)) {
			this._state.isClineCompatible = false;
			this._state.clineCompatibilityMessage = 'Cline is not installed.';
			this._state.isClineConfigInSync = false;
			this._state.clineConfigSyncMessage = null;
			return;
		}

		if (this._state.clineScope === 'workspace') {
			this._state.isClineCompatible = true;
			this._state.clineCompatibilityMessage =
				'Workspace Manual Setup is copy-only. Cline provider config is global in supported Cline versions.';
			this._state.isClineConfigInSync = false;
			this._state.clineConfigSyncMessage =
				'Copy Base URL and Model ID from Proxy Status, then copy the visible API key after rotating it if needed.';
			return;
		}

		const compatibility = await this._clineAdapter.checkCompatibility(this._state.clineScope, this._workspacePath);
		this._state.isClineCompatible = compatibility.compatible;
		this._state.clineCompatibilityMessage = compatibility.compatible
			? 'Automatic Cline update is supported on this machine.'
			: compatibility.message;
		this._state.isClineConfigInSync = false;
		this._state.clineConfigSyncMessage = null;

		if (!compatibility.compatible) {
			this._state.clineConfigSyncMessage =
				'Automatic Cline update is not supported on this machine. Copy Base URL and API key manually into Cline settings.';
			return;
		}

		if (!this._resolvedApiKey) {
			this._state.clineConfigSyncMessage =
				'Generate or rotate API key to enable automatic Cline sync checks.';
			return;
		}

		const syncResult = await this._clineAdapter.checkConfigSync({
			scope: this._state.clineScope,
			workspacePath: this._workspacePath,
			apiKey: this._resolvedApiKey,
			baseUrl: this._state.baseUrl,
			modelId: SUITECLOUD_MODEL_ID,
		});

		this._state.isClineConfigInSync = syncResult.comparable && syncResult.inSync;
		this._state.clineConfigSyncMessage = syncResult.message;
	}

	private async _resolveApiKey(allowGenerate: boolean): Promise<string | undefined> {
		await this._ensureSdkDependenciesReady();
		this._clearApiKeyPreviewIfExpired();

		let sdkStorageKey: string | undefined;
		try {
			sdkStorageKey = await this._cliService.getProxyApiKeyFromSdkStorage();
		} catch (error) {
			// If proxy start flow needs a key and SDK lookup failed, bubble the error.
			if (allowGenerate) {
				throw error;
			}
		}

		if (sdkStorageKey) {
			this._setApiKeyState('sdk', sdkStorageKey, false);
			return sdkStorageKey;
		}

		if (allowGenerate) {
			const generatedKey = await this._cliService.generateProxyApiKey();
			this._setApiKeyState('generated', generatedKey, true);
			return generatedKey;
		}

		this._state.apiKeySource = 'unknown';
		this._state.maskedApiKey = API_KEY_NOT_FOUND_LABEL;
		this._state.apiKeyVisible = false;
		this._state.apiKeyVisibleUntilMs = null;
		this._state.apiKeyExists = false;
		this._state.apiKeyActionLabel = SUITECLOUD_PANEL_RUNTIME_STRINGS.apiKey.generateLabel;
		this._state.apiKeyVisibilityInfo = SUITECLOUD_PANEL_RUNTIME_STRINGS.apiKey.notFoundInfo;
		this._resolvedApiKey = undefined;
		return undefined;
	}

	private async _applyFormChanges(formData: SuiteCloudPanelUpdateFormPayload): Promise<void> {
		const previousPort = this._state.port;
		const proxyConfigLocked =
			this._proxyProcessService.isRunning ||
			this._state.proxyStatus === 'starting' ||
			this._state.proxyStatus === 'running' ||
			this._state.proxyStatus === 'stopping';
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
			this._state.baseUrl = this._buildBaseUrl(this._state.port);
		}
		await this._persistPreferences();

		if (authIdChangeBlocked) {
			this._sendActionError(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.authIdChangeRequiresStoppedProxy);
			return;
		}
		if (portChangeBlocked) {
			this._sendActionError(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.portChangeRequiresStoppedProxy);
		}
	}

	private async _startProxy(
		showDisclaimerPrompt = true,
		emitSuccessMessage = true
	): Promise<void> {
		await this._ensureSdkDependenciesReady();
		if (showDisclaimerPrompt) {
			const approved = await this._confirmStartProxyDisclaimer();
			if (!approved) {
				return;
			}
		}
		this._vsLogger.clear();
		this._vsLogger.startSection();
		this._validateStartInputs();

		if (!this._cliService.isProxyStartCommandSupported()) {
			const version = this._cliService.getBundledCliVersion();
			throw new Error(
				`The bundled @oracle/suitecloud-cli version (${version}) does not support "proxy:start". Upgrade the extension CLI dependency and reinstall.`
			);
		}
		this._logControlPanelInfo(`Starting proxy on port ${this._state.port} with auth ID "${this._state.authId}".`);

		this._state.proxyStatus = 'starting';
		this._state.lastError = null;
		this._postStateUpdate();
		this._setStartingStatusBarMessage();

		const resolvedApiKey = await this._resolveApiKey(true);
		if (!resolvedApiKey) {
			throw new Error(SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.unableResolveApiKeyForStart);
		}

		const pid = await this._proxyProcessService.start({
			authId: this._state.authId,
			port: this._state.port,
			cwd: this._workspacePath,
			sdkPath: this._cliService.getSdkPath(),
		});

		this._state = markRuntimeConfigAsActive({
			...this._state,
			proxyStatus: 'running',
			proxyPid: pid,
			baseUrl: this._buildBaseUrl(this._state.port),
		});
		await this._persistPreferencesNoThrow();
		await this._refreshCompatibility();
		this._setRunningStatusBarMessage();
		this._postStateUpdate();
		this._logApiProviderSettings(this._state.baseUrl);

		if (emitSuccessMessage) {
			this._sendActionSuccess(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.proxyRunning);
		}
		this._vsLogger.endSection();
	}

	private async _stopProxy(
		emitSuccessMessage = true,
		options: { preserveStartIntent?: boolean } = {}
	): Promise<void> {
		const clearStartIntent = options.preserveStartIntent !== true;
		this._vsLogger.startSection();
		if (!this._proxyProcessService.isRunning) {
			this._state = clearRuntimeConfig(
				{
					...this._state,
					proxyStatus: 'stopped',
					proxyPid: null,
				},
				{ clearStartIntent }
			);
			await this._persistPreferencesNoThrow();
			this._setStoppedStatusBarMessage();
			this._postStateUpdate();
			if (emitSuccessMessage) {
				this._sendActionSuccess(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.proxyAlreadyStopped);
			}
			this._vsLogger.endSection();
			return;
		}
		this._logControlPanelInfo('Stopping proxy process.');

		this._state = {
			...this._state,
			autoStartProxyOnStartup: clearStartIntent
				? false
				: this._state.autoStartProxyOnStartup,
			proxyStatus: 'stopping',
		};
		await this._persistPreferencesNoThrow();
		this._postStateUpdate();
		await this._proxyProcessService.stop();
		this._state = clearRuntimeConfig(
			{
				...this._state,
				proxyStatus: 'stopped',
				proxyPid: null,
			},
			{ clearStartIntent }
		);
		this._setStoppedStatusBarMessage();
		this._postStateUpdate();
		if (emitSuccessMessage) {
			this._sendActionSuccess(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.proxyStopped);
		}
		this._vsLogger.endSection();
	}

	private async _confirmStartProxyDisclaimer(): Promise<boolean> {
		const selection = await vscode.window.showWarningMessage(
			this._formatNotificationMessage(SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.startProxyDisclaimer),
			{ modal: true },
			SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.startProxyDisclaimerAction
		);
		return selection === SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.startProxyDisclaimerAction;
	}

	private async _rotateApiKey(): Promise<void> {
		await this._ensureSdkDependenciesReady();
		if (
			this._proxyProcessService.isRunning ||
			['running', 'starting', 'stopping'].includes(this._state.proxyStatus)
		) {
			throw new Error(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.apiKeyChangeRequiresStoppedProxy);
		}
		const hasExistingKey = this._state.apiKeyExists;
		const continueLabel = hasExistingKey
			? SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.rotateExistingAction
			: SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.rotateMissingAction;
		const answer = await vscode.window.showWarningMessage(
			this._formatNotificationMessage(
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

		const generatedKey = await this._cliService.generateProxyApiKey();
		this._setApiKeyState('generated', generatedKey, true);
		await this._refreshCompatibility();
		this._postStateUpdate();
		this._sendActionSuccess(hasExistingKey ? SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.apiKeyRotated : SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.apiKeyGenerated);
	}

	private async _applyClineSettings(explicitApply: boolean): Promise<void> {
		if (!this._isClineProxyAvailable()) {
			this._sendActionError(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.startProxyBeforeClineApply);
			return;
		}

		if (this._state.clineScope === 'workspace') {
			if (explicitApply) {
				this._sendActionSuccess(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.workspaceClineSetupIsManual);
			}
			return;
		}

		if (this._state.isClineConfigInSync) {
			this._sendActionSuccess(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.noClineConfigChangesDetected);
			return;
		}

		const resolvedKey = await this._resolveApiKey(false);
		if (!resolvedKey) {
			this._sendActionError(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.noApiKeyForClineApply);
			return;
		}

		const result = await this._clineAdapter.applyConfig({
			scope: this._state.clineScope,
			workspacePath: this._workspacePath,
			apiKey: resolvedKey,
			baseUrl: this._state.baseUrl,
			modelId: SUITECLOUD_MODEL_ID,
		});

		if (result.applied) {
			await this._extensionContext.globalState.update(CLINE_PENDING_CONFIG_STORAGE_KEY, {
				baseUrl: this._state.baseUrl,
				modelId: SUITECLOUD_MODEL_ID,
			} satisfies PendingClineConfig);
			await this._sleep(CLINE_POST_WRITE_VERIFICATION_DELAY_MS);
		}
		await this._refreshCompatibility();

		if (result.applied) {
			const configVerified = this._state.isClineConfigInSync;
			this._clineAppliedInSession = configVerified;
			this._postStateUpdate();
			const restartExtensionsAction = SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.restartExtensionsAction;
			const selection = await vscode.window.showWarningMessage(
				this._formatNotificationMessage(
					SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.clineExtensionRestartRequiredPrompt
				),
				{ modal: true },
				restartExtensionsAction,
				SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.cancelAction
			);
			if (selection === restartExtensionsAction) {
				await this._restartExtensionsForClineConfig();
				return;
			}
			this._sendActionSuccess(
				configVerified
					? 'Cline settings were updated and verified. Changes will take effect after VS Code extensions restart.'
					: 'Cline rewrote its active settings. SuiteCloud will reapply the requested configuration after VS Code extensions restart.'
			);
			return;
		}

		this._clineAppliedInSession = false;
		this._postStateUpdate();
		this._sendActionError(result.message);
	}

	private async _restartExtensionsForClineConfig(): Promise<void> {
		const shouldRecoverOwnedProxy = this._proxyProcessService.isRunning;
		await this._extensionContext.globalState.update(CLINE_PENDING_PROXY_RESTART_STORAGE_KEY, true);

		try {
			if (shouldRecoverOwnedProxy) {
				await this._stopProxy(false, { preserveStartIntent: true });
			}
			await this._extensionHostRestartService.restart();
		} catch (error) {
			await this._extensionContext.globalState.update(CLINE_PENDING_PROXY_RESTART_STORAGE_KEY, undefined);
			const restartError = error instanceof Error ? error.message : String(error);
			let recoveryError: string | undefined;

			if (shouldRecoverOwnedProxy && !this._proxyProcessService.isRunning) {
				try {
					await this._startProxy(false, true);
				} catch (proxyError) {
					recoveryError = proxyError instanceof Error ? proxyError.message : String(proxyError);
					this._logControlPanelError(`Unable to recover proxy after extension restart failed: ${recoveryError}`);
				}
			}

			throw new Error(
				`Unable to restart VS Code extensions automatically: ${restartError}. ` +
				`Run "Developer: Restart Extension Host" from the Command Palette.${
					recoveryError ? ` Proxy recovery also failed: ${recoveryError}` : ''
				}`
			);
		}
	}

	private async _openClineChat(): Promise<void> {
		if (!this._isClineProxyAvailable()) {
			this._sendActionError(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.startProxyBeforeClineChat);
			return;
		}

		const availableCommands = await vscode.commands.getCommands(true);
		const invokeIfAvailable = async (commandId: string): Promise<boolean> => {
			if (!availableCommands.includes(commandId)) {
				return false;
			}
			try {
				await vscode.commands.executeCommand(commandId);
				return true;
			} catch {
				return false;
			}
		};

		const activityBarCommands = [
			'workbench.view.extension.claude-dev-ActivityBar',
			'workbench.view.extension.cline-ActivityBar',
		];
		for (const commandId of activityBarCommands) {
			// Best-effort open/focus Cline container before focusing chat.
			// These workbench commands are built-in and may not appear in getCommands().
			try {
				await vscode.commands.executeCommand(commandId);
				break;
			} catch {
				// ignore and continue
			}
		}

		const focusCommands = [
			'cline.focusChatInput',
			'claude-dev.SidebarProvider.focus',
			'cline.SidebarProvider.focus',
		];
		for (const commandId of focusCommands) {
			if (await invokeIfAvailable(commandId)) {
				this._sendActionSuccess(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.openedClineChat);
				return;
			}
		}

		// Last fallback: open Cline extension page so user can open chat manually.
		try {
			await vscode.commands.executeCommand('workbench.extensions.search', `@id:${CLINE_EXTENSION_ID}`);
		} catch {
			// ignore, we'll still emit a user-facing error below
		}
		this._sendActionError(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.openClineChatFailed);
	}

	private async _submitFeedback(payload: SuiteCloudPanelSubmitFeedbackPayload): Promise<void> {
		if (!this._isProxyAvailable()) {
			throw new Error('Start proxy before submitting feedback.');
		}

		const apiKey = await this._resolveApiKey(false);
		if (!apiKey || !apiKey.trim()) {
			throw new Error('No API key is available. Generate or rotate API key first.');
		}

		await this._feedbackService.submit({
			payload,
			apiKey,
			port: this._state.runtimePort || this._state.port,
		});
		this._sendActionSuccess('Feedback submitted successfully. Thank you!', 'SUBMIT_FEEDBACK');
	}

	private _validateStartInputs(): void {
		if (!this._state.authId || this._state.authId === DEVASSIST.DEFAULT_VALUES.authID) {
			throw new Error(SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.invalidAuthId);
		}
		if (!Number.isInteger(this._state.port) || this._state.port < VALID_PORT_MIN || this._state.port > VALID_PORT_MAX) {
			throw new Error(SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.invalidPortRange(VALID_PORT_MIN, VALID_PORT_MAX));
		}
	}

	private _buildBaseUrl(port: number): string {
		return `http://127.0.0.1:${port}${DEVASSIST_BASE_PATH}`;
	}

	private _sanitizePort(candidatePort: number, fallbackPort: number): number {
		if (!Number.isInteger(candidatePort) || candidatePort < VALID_PORT_MIN || candidatePort > VALID_PORT_MAX) {
			return fallbackPort;
		}
		return candidatePort;
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
			this._vsLogger.error(`Unable to persist SuiteCloud Control Panel preferences: ${String(error)}`);
		}
	}

	private _maskApiKey(apiKey: string): string {
		if (!apiKey || apiKey.length <= 4) {
			return '****';
		}
		return `****${apiKey.slice(-4)}`;
	}

	private async _copyApiKeyToClipboard(): Promise<void> {
		this._clearApiKeyPreviewIfExpired();
		if (!this._generatedApiKeyPreview) {
			this._state.apiKeyVisible = false;
			this._postStateUpdate();
			this._sendActionError('The API key copy window has expired. Rotate the key to copy a new value.');
			return;
		}

		await vscode.env.clipboard.writeText(this._generatedApiKeyPreview.apiKey);
		this._sendActionSuccess(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.copyValue('API key'));
	}

	private _toFriendlyProxyStartError(errorMessage: string): string {
		const normalizedMessage = (errorMessage || '').toLowerCase();

		if (normalizedMessage.startsWith('unable to start suitecloud proxy process:')) {
			return `${errorMessage}${SUITECLOUD_PANEL_RUNTIME_STRINGS.friendlyErrors.outputHint}`;
		}

		if (normalizedMessage.includes('invalid or corrupt jarfile')) {
			return SUITECLOUD_PANEL_RUNTIME_STRINGS.friendlyErrors.sdkJarInvalid;
		}

		if (normalizedMessage.includes('proxy:start') && normalizedMessage.includes('does not exist')) {
			const version = this._cliService.getBundledCliVersion();
			return SUITECLOUD_PANEL_RUNTIME_STRINGS.friendlyErrors.proxyStartMissing(version);
		}

		if (
			normalizedMessage.includes('client api key file') ||
			normalizedMessage.includes('client_api_key.p12') ||
			normalizedMessage.includes('secure storage') ||
			normalizedMessage.includes('passkey')
		) {
			return SUITECLOUD_PANEL_RUNTIME_STRINGS.friendlyErrors.apiKeyStorage(errorMessage);
		}

		if (
			normalizedMessage.includes('already in use') ||
			normalizedMessage.includes('eaddrinuse') ||
			normalizedMessage.includes('eacces')
		) {
			return SUITECLOUD_PANEL_RUNTIME_STRINGS.friendlyErrors.portConflict(errorMessage);
		}

		if (
			normalizedMessage.includes('auth id') ||
			normalizedMessage.includes('authid') ||
			normalizedMessage.includes('no account has been set up')
		) {
			return SUITECLOUD_PANEL_RUNTIME_STRINGS.friendlyErrors.authIssue(errorMessage);
		}

		if (normalizedMessage.includes('timed out')) {
			return SUITECLOUD_PANEL_RUNTIME_STRINGS.friendlyErrors.timeout(errorMessage);
		}

		return `${errorMessage}${SUITECLOUD_PANEL_RUNTIME_STRINGS.friendlyErrors.outputHint}`;
	}

	private _toInlineErrorSummary(errorMessage: string): string {
		const firstLine = (errorMessage || '')
			.split('\n')
			.map((line) => line.trim())
			.find((line) => line.length > 0) || 'Operation failed.';
		if (firstLine.length <= 180) {
			return firstLine;
		}
		return `${firstLine.substring(0, 177)}...`;
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
		return this._state.proxyStatus === 'running' && this._proxyProcessService.isRunning;
	}

	private _isClineProxyAvailable(): boolean {
		return this._isProxyAvailable();
	}

	private _setApiKeyState(source: 'sdk' | 'generated', apiKey: string, generatedNow: boolean): void {
		this._state.apiKeySource = source;
		this._resolvedApiKey = apiKey;
		this._state.apiKeyExists = true;
		this._state.apiKeyActionLabel = SUITECLOUD_PANEL_RUNTIME_STRINGS.apiKey.rotateLabel;

		if (generatedNow) {
			const visibleUntilMs = Date.now() + API_KEY_PREVIEW_WINDOW_MS;
			this._generatedApiKeyPreview = { apiKey, visibleUntilMs };
			this._state.maskedApiKey = this._maskApiKey(apiKey);
			this._state.apiKeyVisible = true;
			this._state.apiKeyVisibleUntilMs = visibleUntilMs;
			this._state.apiKeyVisibilityInfo = `Available to copy for 5 minutes (until ${new Date(visibleUntilMs).toLocaleTimeString()}).`;
			this._scheduleApiKeyPreviewHide();
			return;
		}

		if (this._generatedApiKeyPreview && this._generatedApiKeyPreview.apiKey === apiKey && Date.now() < this._generatedApiKeyPreview.visibleUntilMs) {
			this._state.maskedApiKey = this._maskApiKey(apiKey);
			this._state.apiKeyVisible = true;
			this._state.apiKeyVisibleUntilMs = this._generatedApiKeyPreview.visibleUntilMs;
			this._state.apiKeyVisibilityInfo = `Available to copy for 5 minutes (until ${new Date(this._generatedApiKeyPreview.visibleUntilMs).toLocaleTimeString()}).`;
			this._scheduleApiKeyPreviewHide();
			return;
		}

		this._state.maskedApiKey = this._maskApiKey(apiKey);
		this._state.apiKeyVisible = false;
		this._state.apiKeyVisibleUntilMs = null;
		this._state.apiKeyVisibilityInfo = API_KEY_HIDDEN_HINT;
	}

	private _clearApiKeyPreviewIfExpired(): void {
		if (!this._generatedApiKeyPreview) {
			return;
		}
		if (Date.now() >= this._generatedApiKeyPreview.visibleUntilMs) {
			this._generatedApiKeyPreview = undefined;
			this._clearApiKeyPreviewHideTimeout();
		}
	}

	private _clearApiKeyPreviewHideTimeout(): void {
		if (this._apiKeyPreviewHideTimeout) {
			clearTimeout(this._apiKeyPreviewHideTimeout);
			this._apiKeyPreviewHideTimeout = undefined;
		}
	}

	private _scheduleApiKeyPreviewHide(): void {
		this._clearApiKeyPreviewHideTimeout();
		if (!this._generatedApiKeyPreview) {
			return;
		}

		const delayMs = this._generatedApiKeyPreview.visibleUntilMs - Date.now();
		if (delayMs <= 0) {
			this._generatedApiKeyPreview = undefined;
			this._state.maskedApiKey = this._resolvedApiKey ? this._maskApiKey(this._resolvedApiKey) : API_KEY_EXISTS_HIDDEN_LABEL;
			this._state.apiKeyVisible = false;
			this._state.apiKeyVisibleUntilMs = null;
			this._state.apiKeyVisibilityInfo = API_KEY_HIDDEN_HINT;
			this._postStateUpdate();
			return;
		}

		this._apiKeyPreviewHideTimeout = setTimeout(() => {
			this._generatedApiKeyPreview = undefined;
			if (this._state.apiKeyExists) {
				this._state.maskedApiKey = this._resolvedApiKey ? this._maskApiKey(this._resolvedApiKey) : API_KEY_EXISTS_HIDDEN_LABEL;
				this._state.apiKeyVisible = false;
				this._state.apiKeyVisibleUntilMs = null;
				this._state.apiKeyVisibilityInfo = API_KEY_HIDDEN_HINT;
			}
			this._postStateUpdate();
		}, delayMs);
	}

	private _setRunningStatusBarMessage(): void {
		this._statusBarItem.text = `$(netsuite-mobius-colorless-icon)  ${this._translationService.getMessage(DEVASSIST_SERVICE.IS_RUNNING.STATUSBAR)}`;
		this._statusBarItem.backgroundColor = undefined;
		this._statusBarItem.show();
	}

	private _setStoppedStatusBarMessage(): void {
		this._statusBarItem.text = `$(netsuite-mobius-colorless-icon)  ${this._translationService.getMessage(DEVASSIST_SERVICE.IS_STOPPED.STATUSBAR)}`;
		this._statusBarItem.backgroundColor = undefined;
		this._statusBarItem.show();
	}

	private _setStartingStatusBarMessage(): void {
		this._statusBarItem.text = `$(sync~spin) SuiteCloud: starting proxy`;
		this._statusBarItem.backgroundColor = undefined;
		this._statusBarItem.show();
	}

	private _configureWebview(webview: vscode.Webview, mode: SuiteCloudPanelWebviewMode): void {
		webview.options = {
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.file(path.join(this._extensionContext.extensionPath, 'resources')),
				vscode.Uri.file(
					path.join(this._extensionContext.extensionPath, 'node_modules', '@vscode', 'codicons', 'dist')
				),
			],
		};
		webview.html = this._htmlRenderer.render(webview, mode);
		webview.onDidReceiveMessage((rawMessage: unknown) => {
			const message = parseSuiteCloudPanelIncomingMessage(rawMessage);
			if (!message) {
				this._logControlPanelError(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.invalidWebviewPayload);
				return;
			}
			this._messageQueue = this._messageQueue
				.then(() => this._handleWebviewMessage(message))
				.catch((error) => {
					this._logControlPanelError(`Unexpected command queue failure: ${String(error)}`);
				});
		});
	}

	private _enqueueCompatibilityRefresh(): void {
		this._messageQueue = this._messageQueue
			.then(async () => {
				await this._refreshApiKeyAndCompatibility(false);
				this._postStateUpdate();
			})
			.catch((error) => {
				this._logControlPanelError(`Unable to refresh panel state: ${String(error)}`);
			});
	}

	private _sleep(milliseconds: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, milliseconds));
	}

	private _postMessageToAllWebviews(message: SuiteCloudPanelOutgoingMessage): void {
		if (this._panel) {
			void this._panel.webview.postMessage(message);
		}
		if (this._sidebarView) {
			void this._sidebarView.webview.postMessage(message);
		}
	}

	private _postStateUpdate(): void {
		this._updateWalkthroughContexts();
		this._postMessageToAllWebviews({
			eventType: SUITECLOUD_PANEL_EVENTS.TO_WEBVIEW.STATE_UPDATE,
			eventData: this._state,
		});
	}

	private _updateWalkthroughContexts(): void {
		void vscode.commands.executeCommand('setContext', WALKTHROUGH_CONTEXT_KEYS.proxyRunning, this._isProxyAvailable());
		void vscode.commands.executeCommand('setContext', WALKTHROUGH_CONTEXT_KEYS.clineApplied, this._clineAppliedInSession);
		void vscode.commands.executeCommand(
			'setContext',
			WALKTHROUGH_CONTEXT_KEYS.welcomeNotificationDisabled,
			this._state.disableWelcomeNotification === true
		);
	}

	private _sendActionSuccess(message: string, action?: SuiteCloudPanelAction): void {
		this._logControlPanelInfo(message);
		void vscode.window.showInformationMessage(this._formatNotificationMessage(message));
		if (action) {
			this._postMessageToAllWebviews({
				eventType: SUITECLOUD_PANEL_EVENTS.TO_WEBVIEW.ACTION_SUCCESS,
				eventData: { message, action },
			});
		}
	}

	private _sendActionError(message: string): void {
		this._logControlPanelError(message);
		void vscode.window.showErrorMessage(this._formatNotificationMessage(message));
	}

	private _formatNotificationMessage(message: string): string {
		const title = SUITECLOUD_PANEL_RUNTIME_STRINGS.notificationTitle;
		return message.startsWith(`${title}:`) ? message : `${title}: ${message}`;
	}

	private _openOutputChannel(): void {
		this._outputChannel.show();
	}

	private _logControlPanelInfo(message: string): void {
		this._vsLogger.info(`${CONTROL_PANEL_LOG_PREFIX} ${message}`);
	}

	private _logControlPanelError(message: string): void {
		this._vsLogger.error(`${CONTROL_PANEL_LOG_PREFIX} ${message}`);
	}

	private _logApiProviderSettings(baseUrl: string): void {
		const settings = [
			'Use these settings in an OpenAI-compatible tool:',
			'',
			'API Provider: OpenAI Compatible',
			`Base URL: ${baseUrl}`,
			'API Key: Generate or rotate the key in the Dev Assist Control Panel, then copy it.',
			`Model ID: ${SUITECLOUD_MODEL_ID}`,
		];
		const contentWidth = Math.max(...settings.map((line) => line.length));
		const border = '*'.repeat(contentWidth + 4);

		this._vsLogger.info('');
		this._vsLogger.info(border);
		settings.forEach((line) => this._vsLogger.info(`* ${line.padEnd(contentWidth)} *`));
		this._vsLogger.info(border);
	}

}
