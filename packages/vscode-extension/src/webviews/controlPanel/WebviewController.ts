/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import { DEVASSIST } from '../../ApplicationConstants';
import PreferencesStore, {
	PersistedPanelPreferences,
} from './PreferencesStore';
import ClineChatOpener from '../../service/controlPanel/cline/ChatOpener';
import ClineIntegrationAdapter from '../../service/controlPanel/cline/IntegrationAdapter';
import {
	formatProxyStartError,
	summarizeInlineError,
} from '../../controlPanel/ErrorFormatter';
import { buildProxyBaseUrl, createInitialPanelState } from '../../controlPanel/Configuration';
import { CLINE_EXTENSION_ID } from '../../service/controlPanel/cline/Constants';
import { SUITECLOUD_PANEL_RUNTIME_STRINGS } from '../../controlPanel/Strings';
import {
	applyFormChangesToState,
	calculatePendingRuntimeConfig,
	clearRuntimeConfig,
	isProxyLifecycleActive,
	markRuntimeConfigAsActive,
} from '../../controlPanel/StateTransitions';
import {
	SuiteCloudPanelIncomingMessage,
	SuiteCloudPanelSubmitFeedbackPayload,
	SuiteCloudPanelState,
	SuiteCloudPanelUpdateFormPayload,
	SUITECLOUD_PANEL_EVENTS,
} from '../../controlPanel/Types';
import ExtensionHostRestartService from '../../service/controlPanel/ExtensionHostRestartService';
import FeedbackService from '../../service/controlPanel/FeedbackService';
import ApiKeyService, {
	ApiKeyResolution,
} from '../../service/controlPanel/ApiKeyService';
import ClineCompatibilityService from '../../service/controlPanel/ClineCompatibilityService';
import ClineConfigService from '../../service/controlPanel/ClineConfigService';
import CliService from '../../service/controlPanel/CliService';
import ProxyLifecycleService from '../../service/controlPanel/ProxyLifecycleService';
import ProxyProcessService from '../../service/controlPanel/ProxyProcessService';
import Presenter from './Presenter';
import ViewHost from './ViewHost';

const SETUP_ACCOUNT_COMMAND_ID = 'suitecloud.setupaccount';
const SUITECLOUD_MODEL_ID = SUITECLOUD_PANEL_RUNTIME_STRINGS.modelId;
const PANEL_STATE_STORAGE_KEY = 'suitecloud.controlPanel.state.v1';
const CLINE_PENDING_PROXY_RESTART_STORAGE_KEY = 'suitecloud.controlPanel.pendingClineProxyRestart.v1';
const WALKTHROUGH_CONTEXT_KEYS = {
	proxyRunning: 'suitecloud.controlPanel.proxyRunning',
	clineApplied: 'suitecloud.controlPanel.clineApplied',
	welcomeNotificationDisabled: 'suitecloud.controlPanel.welcomeNotificationDisabled',
} as const;

let controlPanelController: ControlPanelController | undefined;
const assertUnreachable = (value: never): never => {
	throw new Error(`Unhandled control panel event: ${String(value)}`);
};

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
	private readonly _clineAdapter: ClineIntegrationAdapter;
	private readonly _clineChatOpener: ClineChatOpener;
	private readonly _clineCompatibilityService: ClineCompatibilityService;
	private readonly _clineConfigService: ClineConfigService;
	private readonly _extensionHostRestartService: ExtensionHostRestartService;
	private readonly _proxyProcessService: ProxyProcessService;
	private readonly _proxyLifecycleService: ProxyLifecycleService;
	private readonly _presenter: Presenter;
	private readonly _preferencesStore: PreferencesStore;
	private readonly _feedbackService: FeedbackService;
	private readonly _apiKeyService: ApiKeyService;
	private readonly _viewHost: ViewHost;
	private readonly _sdkDependenciesReady: Promise<void>;
	private _state: SuiteCloudPanelState;
	private _clineAppliedInSession = false;
	private _messageQueue: Promise<void> = Promise.resolve();

	constructor(
		extensionContext: vscode.ExtensionContext,
		statusBarItem: vscode.StatusBarItem,
		sdkDependenciesReady: Promise<void>
	) {
		this._extensionContext = extensionContext;
		this._sdkDependenciesReady = sdkDependenciesReady;
		this._cliService = new CliService();
		this._clineAdapter = new ClineIntegrationAdapter();
		this._clineChatOpener = new ClineChatOpener(vscode.commands);
		this._clineCompatibilityService = new ClineCompatibilityService(
			this._clineAdapter
		);
		this._clineConfigService = new ClineConfigService(
			this._clineAdapter,
			this._extensionContext.globalState
		);
		this._extensionHostRestartService = new ExtensionHostRestartService(
			(commandId) => vscode.commands.executeCommand(commandId)
		);
		this._feedbackService = new FeedbackService();
		this._apiKeyService = new ApiKeyService(
			this._cliService,
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

		const defaults = this._cliService.getDefaultPanelSettings();
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

		this._proxyProcessService = new ProxyProcessService({
			onLog: (line, isError) => this._presenter.proxyLog(line, isError),
			onProcessClosed: (exitCode, signal) => {
				this._state = clearRuntimeConfig({
					...this._state,
					proxyStatus: 'stopped',
					proxyPid: null,
				});
				this._presenter.setStoppedStatus();
				this._postStateUpdate();
				if (exitCode !== 0 && exitCode !== null) {
					this._presenter.showError(`Proxy exited unexpectedly with code ${exitCode}${signal ? ` (${signal})` : ''}.`);
				}
			},
		});
		this._proxyLifecycleService = new ProxyLifecycleService(
			this._proxyProcessService
		);
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
			await this._proxyProcessService.dispose();
			this._clineAppliedInSession = false;
			this._updateWalkthroughContexts();
			this._presenter.setStoppedStatus();
		} finally {
			this._presenter.dispose();
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
			this._presenter.setStoppedStatus();
			this._postStateUpdate();
			this._presenter.showError(`Auto-start failed: ${friendlyErrorMessage}`);
			this._presenter.endLogSection();
		}
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
			this._presenter.showSuccess(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.welcomeNotificationDisabled);
		}
	}

	async applyPendingClineConfig(): Promise<void> {
		try {
			const applied = await this._clineConfigService.applyPendingConfig(
				this._workspacePath,
				() => this._resolveApiKey(false)
			);
			if (applied) {
				this._presenter.info(
					'Applied pending Cline configuration during SuiteCloud activation.'
				);
			}
		} catch (error) {
			this._presenter.error(`Unable to apply pending Cline configuration: ${String(error)}`);
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
					await this._applyClineSettings();
					break;
				case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.OPEN_CLINE_MARKETPLACE:
					await vscode.commands.executeCommand(
						'workbench.extensions.search',
						`@id:${CLINE_EXTENSION_ID}`
					);
					break;
				case SUITECLOUD_PANEL_EVENTS.FROM_WEBVIEW.OPEN_OUTPUT:
					this._presenter.openOutput();
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
			await this._refreshApiKeyAndCompatibility(false);
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

	private async _refreshApiKeyAndCompatibility(allowGenerate: boolean): Promise<void> {
		await this._resolveApiKey(allowGenerate);
		await this._refreshCompatibility();
	}

	private async _refreshCompatibility(): Promise<void> {
		Object.assign(
			this._state,
			await this._clineCompatibilityService.evaluate({
				isExtensionInstalled: !!vscode.extensions.getExtension(CLINE_EXTENSION_ID),
				scope: this._state.clineScope,
				workspacePath: this._workspacePath,
				apiKey: this._apiKeyService.resolvedApiKey,
				baseUrl: this._state.baseUrl,
				modelId: SUITECLOUD_MODEL_ID,
			})
		);
	}

	private async _resolveApiKey(allowGenerate: boolean): Promise<string | undefined> {
		await this._ensureSdkDependenciesReady();
		const resolution = await this._apiKeyService.resolve(allowGenerate);
		this._applyApiKeyResolution(resolution);
		return resolution.apiKey;
	}

	private async _applyFormChanges(formData: SuiteCloudPanelUpdateFormPayload): Promise<void> {
		const previousPort = this._state.port;
		const proxyConfigLocked =
			this._proxyProcessService.isRunning ||
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
		this._presenter.clearLog();
		this._presenter.startLogSection();
		const startResult = await this._proxyLifecycleService.start({
			state: this._state,
			unconfiguredAuthId: DEVASSIST.DEFAULT_VALUES.authID,
			isCommandSupported: () => this._cliService.isProxyStartCommandSupported(),
			getCliVersion: () => this._cliService.getBundledCliVersion(),
			getWorkspacePath: () => this._workspacePath,
			getSdkPath: () => this._cliService.getSdkPath(),
			resolveApiKey: () => this._resolveApiKey(true),
			onStarting: (state) => {
				this._presenter.info(
					`Starting proxy on port ${state.port} with auth ID "${state.authId}".`
				);
				this._state = state;
				this._postStateUpdate();
				this._presenter.setStartingStatus();
			},
		});
		this._state = markRuntimeConfigAsActive({
			...this._state,
			proxyStatus: 'running',
			proxyPid: startResult.pid,
			baseUrl: buildProxyBaseUrl(startResult.port),
			authId: startResult.authId,
			port: startResult.port,
		});
		await this._persistPreferencesNoThrow();
		await this._refreshCompatibility();
		this._presenter.setRunningStatus();
		this._postStateUpdate();
		this._presenter.logApiProviderSettings(this._state.baseUrl, SUITECLOUD_MODEL_ID);

		if (emitSuccessMessage) {
			this._presenter.showSuccess(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.proxyRunning);
		}
		this._presenter.endLogSection();
	}

	private async _stopProxy(
		emitSuccessMessage = true,
		options: { preserveStartIntent?: boolean } = {}
	): Promise<void> {
		this._presenter.startLogSection();
		const result = await this._proxyLifecycleService.stop({
			state: this._state,
			preserveStartIntent: options.preserveStartIntent === true,
			onStopping: async (state) => {
				this._presenter.info('Stopping proxy process.');
				this._state = state;
				await this._persistPreferencesNoThrow();
				this._postStateUpdate();
			},
		});
		this._state = clearRuntimeConfig(
			{
				...this._state,
				proxyStatus: 'stopped',
				proxyPid: null,
			},
			{ clearStartIntent: result.clearStartIntent }
		);

		if (!result.processWasRunning) {
			await this._persistPreferencesNoThrow();
			this._presenter.setStoppedStatus();
			this._postStateUpdate();
			if (emitSuccessMessage) {
				this._presenter.showSuccess(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.proxyAlreadyStopped);
			}
			this._presenter.endLogSection();
			return;
		}
		this._presenter.setStoppedStatus();
		this._postStateUpdate();
		if (emitSuccessMessage) {
			this._presenter.showSuccess(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.proxyStopped);
		}
		this._presenter.endLogSection();
	}

	private async _confirmStartProxyDisclaimer(): Promise<boolean> {
		const selection = await vscode.window.showWarningMessage(
			this._presenter.formatNotification(SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.startProxyDisclaimer),
			{ modal: true },
			SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.startProxyDisclaimerAction
		);
		return selection === SUITECLOUD_PANEL_RUNTIME_STRINGS.dialogs.startProxyDisclaimerAction;
	}

	private async _rotateApiKey(): Promise<void> {
		await this._ensureSdkDependenciesReady();
		if (this._proxyProcessService.isRunning || isProxyLifecycleActive(this._state.proxyStatus)) {
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
		this._presenter.showSuccess(hasExistingKey ? SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.apiKeyRotated : SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.apiKeyGenerated);
	}

	private async _applyClineSettings(): Promise<void> {
		const outcome = await this._clineConfigService.applyPanelConfig({
			isProxyAvailable: this._isProxyAvailable(),
			isConfigInSync: this._state.isClineConfigInSync,
			scope: this._state.clineScope,
			workspacePath: this._workspacePath,
			baseUrl: this._state.baseUrl,
			modelId: SUITECLOUD_MODEL_ID,
			resolveApiKey: () => this._resolveApiKey(false),
		});

		switch (outcome.kind) {
			case 'proxyUnavailable':
				this._presenter.showError(
					SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.startProxyBeforeClineApply
				);
				return;
			case 'workspaceManual':
				this._presenter.showSuccess(
					SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.workspaceClineSetupIsManual
				);
				return;
			case 'alreadyInSync':
				this._presenter.showSuccess(
					SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.noClineConfigChangesDetected
				);
				return;
			case 'missingApiKey':
				this._presenter.showError(
					SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.noApiKeyForClineApply
				);
				return;
			case 'applyFailed':
				await this._refreshCompatibility();
				this._clineAppliedInSession = false;
				this._postStateUpdate();
				this._presenter.showError(outcome.message);
				return;
			case 'applied':
				break;
			default:
				assertUnreachable(outcome);
		}

		await this._refreshCompatibility();
		const configVerified = this._state.isClineConfigInSync;
		this._clineAppliedInSession = configVerified;
		this._postStateUpdate();
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
		if (selection === restartExtensionsAction) {
			await this._restartExtensionsForClineConfig();
			return;
		}
		this._presenter.showSuccess(
			configVerified
				? 'Cline settings were updated and verified. Changes will take effect after VS Code extensions restart.'
				: 'Cline rewrote its active settings. SuiteCloud will reapply the requested configuration after VS Code extensions restart.'
		);
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
					this._presenter.error(`Unable to recover proxy after extension restart failed: ${recoveryError}`);
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
		if (!this._isProxyAvailable()) {
			this._presenter.showError(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.startProxyBeforeClineChat);
			return;
		}

		if (await this._clineChatOpener.open()) {
			this._presenter.showSuccess(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.openedClineChat);
			return;
		}
		this._presenter.showError(SUITECLOUD_PANEL_RUNTIME_STRINGS.actions.openClineChatFailed);
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
		this._presenter.showSuccess('Feedback submitted successfully. Thank you!', 'SUBMIT_FEEDBACK');
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

	private _toFriendlyProxyStartError(errorMessage: string): string {
		return formatProxyStartError(
			errorMessage,
			() => this._cliService.getBundledCliVersion()
		);
	}

	private _toInlineErrorSummary(errorMessage: string): string {
		return summarizeInlineError(errorMessage);
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
				await this._refreshApiKeyAndCompatibility(false);
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
		void vscode.commands.executeCommand('setContext', WALKTHROUGH_CONTEXT_KEYS.clineApplied, this._clineAppliedInSession);
		void vscode.commands.executeCommand(
			'setContext',
			WALKTHROUGH_CONTEXT_KEYS.welcomeNotificationDisabled,
			this._state.disableWelcomeNotification === true
		);
	}

}
