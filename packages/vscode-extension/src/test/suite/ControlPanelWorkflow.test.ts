/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';
import { createControlPanel } from '../../controlPanel/createControlPanel';
import PanelHost from '../../controlPanel/view/PanelHost';
import PanelPresenter from '../../controlPanel/view/PanelPresenter';
import ProxyService from '../../controlPanel/developerAssistant/proxy/ProxyService';
import ClineCompatibilityService from '../../controlPanel/developerAssistant/cline/ClineCompatibilityService';
import { DEVELOPER_ASSISTANT } from '../../ApplicationConstants';
import { SUITECLOUD_PANEL_EVENTS, SuiteCloudPanelIncomingMessage, SuiteCloudPanelOutgoingMessage } from '../../controlPanel/protocol/Messages';
import { createInitialPanelState } from '../../controlPanel/developerAssistant/Configuration';
import { SuiteCloudPanelState } from '../../controlPanel/developerAssistant/State';
import ClineWorkflow from '../../controlPanel/developerAssistant/cline/ClineWorkflow';
import ProxyWorkflow from '../../controlPanel/developerAssistant/proxy/ProxyWorkflow';

const createState = (): SuiteCloudPanelState =>
	createInitialPanelState(
		{ authId: 'NO_AUTH', localPort: 8181 },
		{
			authId: 'account',
			port: 8181,
			clineScope: 'user',
			autoStartProxyOnStartup: false,
			disableWelcomeNotification: false,
		}
	);

// Runs the real controller, parser, dispatcher, and queue with an in-memory webview.
const withPanel = async (run: (panel: {
	send: (message: SuiteCloudPanelIncomingMessage) => Promise<SuiteCloudPanelState>;
	runtime: { isRunning: boolean };
	storage: { failWrites: boolean; values: Map<string, unknown>; writes: number };
	statusBar: vscode.StatusBarItem;
	warnings: string[];
}) => Promise<void>): Promise<void> => {
	const runtime = { isRunning: false };
	const storage = { failWrites: false, values: new Map<string, unknown>(), writes: 0 };
	const defaults = createState();
	storage.values.set(DEVELOPER_ASSISTANT.PREFERENCES_STORAGE_KEY, {
		authId: defaults.authId, port: defaults.port,
	});
	const memento: vscode.Memento = {
		get: <T>(key: string, fallback?: T) => (storage.values.get(key) ?? fallback) as T,
		keys: () => [...storage.values.keys()],
		update: async (key, value) => {
			if (storage.failWrites) { throw new Error('Preferences unavailable'); }
			storage.writes++;
			storage.values.set(key, structuredClone(value));
		},
	};
	const context = {
		extensionPath: path.resolve(__dirname, '../../..'),
		workspaceState: memento, globalState: memento, subscriptions: [],
	} as unknown as vscode.ExtensionContext;
	const incoming = new vscode.EventEmitter<unknown>();
	const outgoing = new vscode.EventEmitter<SuiteCloudPanelOutgoingMessage>();
	const statusBar = vscode.window.createStatusBarItem();
	const token = new vscode.CancellationTokenSource();
	const warnings: string[] = [];
	const originalRegister = PanelHost.prototype.register;
	const originalCreateWatcher = vscode.workspace.createFileSystemWatcher;
	const originalCreateOutputChannel = vscode.window.createOutputChannel;
	const originalEvaluate = ClineCompatibilityService.prototype.evaluate;
	const originalShowError = PanelPresenter.prototype.showError;
	const originalShowStartError = PanelPresenter.prototype.showProxyStartError;
	const runningDescriptor = Object.getOwnPropertyDescriptor(ProxyService.prototype, 'isRunning')!;
	const subscriptions: vscode.Disposable[] = [];
	const view = {
		webview: {
			asWebviewUri: (uri: vscode.Uri) => uri,
			cspSource: 'test',
			onDidReceiveMessage: (listener: (message: unknown) => void) => {
				const subscription = incoming.event(listener);
				subscriptions.push(subscription);
				return subscription;
			},
			postMessage: async (message: SuiteCloudPanelOutgoingMessage) => {
				outgoing.fire(structuredClone(message));
				return true;
			},
		},
		onDidChangeVisibility: () => new vscode.Disposable(() => {}),
		onDidDispose: () => new vscode.Disposable(() => {}),
	} as unknown as vscode.WebviewView;
	PanelHost.prototype.register = function () {
		this.resolveWebviewView(view, { state: undefined }, token.token);
	};
	vscode.window.createOutputChannel = ((name: string): vscode.OutputChannel => ({
		name,
		append: () => {},
		appendLine: () => {},
		replace: () => {},
		clear: () => {},
		show: () => {},
		hide: () => {},
		dispose: () => {},
	})) as typeof vscode.window.createOutputChannel;
	vscode.workspace.createFileSystemWatcher = () => ({
		ignoreCreateEvents: false,
		ignoreChangeEvents: false,
		ignoreDeleteEvents: false,
		onDidCreate: () => new vscode.Disposable(() => {}),
		onDidChange: () => new vscode.Disposable(() => {}),
		onDidDelete: () => new vscode.Disposable(() => {}),
		dispose: () => {},
	});
	ClineCompatibilityService.prototype.evaluate = async () => ({
		isClineInstalled: false, isClineCompatible: false, isClineConfigInSync: false,
		clineCompatibilityMessage: null, clineConfigSyncMessage: null,
	});
	PanelPresenter.prototype.showError = message => { warnings.push(message); };
	PanelPresenter.prototype.showProxyStartError = message => { warnings.push(message); };
	Object.defineProperty(ProxyService.prototype, 'isRunning', { configurable: true, get: () => runtime.isRunning });
	let controller: ReturnType<typeof createControlPanel> | undefined;
	try {
		controller = createControlPanel(context, statusBar, Promise.resolve());
		controller.registerSidebarViewProvider();
		await run({ runtime, storage, statusBar, warnings, send: message => new Promise((resolve, reject) => {
			const timeout = setTimeout(() => { subscription.dispose(); reject(new Error('Panel did not publish state')); }, 2000);
			const subscription = outgoing.event(response => {
				if (response.eventType !== SUITECLOUD_PANEL_EVENTS.TO_WEBVIEW.STATE_UPDATE) { return; }
				clearTimeout(timeout);
				subscription.dispose();
				setImmediate(() => resolve(response.eventData));
			});
			incoming.fire(message);
		}) });
	} finally {
		try { await controller?.dispose(); } finally {
			PanelHost.prototype.register = originalRegister;
			vscode.workspace.createFileSystemWatcher = originalCreateWatcher;
			vscode.window.createOutputChannel = originalCreateOutputChannel;
			ClineCompatibilityService.prototype.evaluate = originalEvaluate;
			PanelPresenter.prototype.showError = originalShowError;
			PanelPresenter.prototype.showProxyStartError = originalShowStartError;
			Object.defineProperty(ProxyService.prototype, 'isRunning', runningDescriptor);
			[...subscriptions, ...context.subscriptions, incoming, outgoing, statusBar, token].forEach(item => item.dispose());
		}
	}
};

suite('Control Panel Workflows', () => {
	test('rejects config changes before persistence when a running proxy has error state', async () => {
		for (const changes of [{ port: 8282 }, { authId: 'other-account' }]) {
			await withPanel(async panel => {
				panel.storage.failWrites = true;
				const before = await panel.send({ eventType: 'START_PROXY', eventData: {} });
				assert.strictEqual(before.proxyStatus, 'error');
				panel.storage.failWrites = false;
				panel.runtime.isRunning = true;
				panel.warnings.length = 0;
				const savedBefore = structuredClone([...panel.storage.values]);
				const after = await panel.send({ eventType: 'UPDATE_FORM', eventData: changes });
				assert.strictEqual(after.authId, before.authId);
				assert.strictEqual(after.port, before.port);
				assert.strictEqual(after.baseUrl, before.baseUrl);
				assert.strictEqual(panel.storage.writes, 0);
				assert.deepStrictEqual([...panel.storage.values], savedBefore);
				assert.strictEqual(panel.warnings.length, 1);
			});
		}
	});

	test('allows reminder changes while the proxy is running', async () => {
		await withPanel(async panel => {
			panel.runtime.isRunning = true;
			const state = await panel.send({ eventType: 'UPDATE_FORM', eventData: { disableWelcomeNotification: true } });
			assert.strictEqual(state.disableWelcomeNotification, true);
			const saved = panel.storage.values.get(DEVELOPER_ASSISTANT.PREFERENCES_STORAGE_KEY) as { disableWelcomeNotification: boolean };
			assert.strictEqual(saved.disableWelcomeNotification, true);
			assert.deepStrictEqual(panel.warnings, []);
		});
	});

	test('reconciles failed start messages with the actual proxy status', async () => {
		for (const isRunning of [true, false]) {
			await withPanel(async panel => {
				panel.runtime.isRunning = isRunning;
				panel.storage.failWrites = true;
				const state = await panel.send({ eventType: 'START_PROXY', eventData: {} });
				assert.strictEqual(state.proxyStatus, isRunning ? 'running' : 'error');
				assert.ok(panel.statusBar.text.includes(isRunning ? 'running' : 'stopped'));
				assert.strictEqual(panel.warnings.length, 1);
			});
		}
	});

	test('ignores duplicate start requests when the proxy is already running', async () => {
		let prompts = 0;
		let starts = 0;
		const workflow = new ProxyWorkflow({
			proxyService: { isRunning: true },
			ensureSdkDependenciesReady: async () => undefined,
			confirmStartDisclaimer: async () => { prompts++; return false; },
			lifecycleService: { start: async () => { starts++; } },
		} as any);
		await workflow.start();
		assert.strictEqual(prompts, 0);
		assert.strictEqual(starts, 0);
	});

	test('preserves a running proxy when startup refresh fails', async () => {
		const state = { ...createState(), autoStartProxyOnStartup: true };
		const runtime = { isRunning: false };
		let runningStatusShown = false;
		const workflow = new ProxyWorkflow({
			proxyService: runtime,
			getState: () => state,
			refreshAuthIds: async () => {
				runtime.isRunning = true;
				throw new Error('startup refresh failed');
			},
			presenter: {
				setRunningStatus: () => { runningStatusShown = true; },
				setStoppedStatus: () => assert.fail('The proxy is still running'),
				showError: () => undefined,
				endLogSection: () => undefined,
			},
			postStateUpdate: () => undefined,
		} as any);
		await workflow.startOnStartupIfEnabled(false, async () => undefined);
		assert.strictEqual(state.proxyStatus, 'running');
		assert.strictEqual(runningStatusShown, true);
	});

	test('preserves the proxy start state and presentation sequence', async () => {
		let state = createState();
		const calls: string[] = [];
		const presenter = {
			clearLog: () => calls.push('clearLog'),
			startLogSection: () => calls.push('startLogSection'),
			info: () => calls.push('info'),
			setStartingStatus: () => calls.push('setStartingStatus'),
			setRunningStatus: () => calls.push('setRunningStatus'),
			logApiProviderSettings: () => calls.push('logApiProviderSettings'),
			logSuccess: () => calls.push('logSuccess'),
			endLogSection: () => calls.push('endLogSection'),
		};
		const workflow = new ProxyWorkflow({
			sdkService: {
				getSdkPath: () => '/sdk',
			} as any,
			lifecycleService: {
				start: async (input: any) => {
					calls.push('lifecycleStart');
					input.onStarting({ ...input.state, proxyStatus: 'starting' });
					return { authId: input.state.authId, port: input.state.port };
				},
			} as any,
			proxyService: { isRunning: false } as any,
			presenter: presenter as any,
			getState: () => state,
			setState: (nextState) => { state = nextState; },
			confirmStartDisclaimer: async () => {
				calls.push('confirmStartDisclaimer');
				return true;
			},
			ensureSdkDependenciesReady: async () => { calls.push('ensureSdkReady'); },
			resolveApiKey: async () => 'secret',
			refreshAuthIds: async () => undefined,
			refreshApiKeyAndCompatibility: async () => undefined,
			refreshCompatibility: async () => { calls.push('refreshCompatibility'); },
			persistPreferencesNoThrow: async () => { calls.push('persistPreferences'); },
			postStateUpdate: () => calls.push('postStateUpdate'),
		});

		await workflow.start();

		assert.strictEqual(state.proxyStatus, 'running');
		assert.strictEqual(state.proxyOwnership, 'owned');
		assert.strictEqual(state.runtimeAuthId, 'account');
		assert.strictEqual(state.runtimePort, 8181);
		assert.deepStrictEqual(calls, [
			'ensureSdkReady',
			'confirmStartDisclaimer',
			'clearLog',
			'startLogSection',
			'lifecycleStart',
			'info',
			'postStateUpdate',
			'setStartingStatus',
			'persistPreferences',
			'refreshCompatibility',
			'setRunningStatus',
			'postStateUpdate',
			'logApiProviderSettings',
			'logSuccess',
			'endLogSection',
		]);
	});

	test('does not start the proxy when the disclaimer is declined', async () => {
		let lifecycleStarted = false;
		const state = createState();
		const workflow = new ProxyWorkflow({
			sdkService: {} as any,
			lifecycleService: {
				start: async () => {
					lifecycleStarted = true;
					return { pid: 1, authId: 'account', port: 8181 };
				},
			} as any,
			proxyService: { isRunning: false } as any,
			presenter: {} as any,
			getState: () => state,
			setState: () => undefined,
			confirmStartDisclaimer: async () => false,
			ensureSdkDependenciesReady: async () => undefined,
			resolveApiKey: async () => 'secret',
			refreshAuthIds: async () => undefined,
			refreshApiKeyAndCompatibility: async () => undefined,
			refreshCompatibility: async () => undefined,
			persistPreferencesNoThrow: async () => undefined,
			postStateUpdate: () => undefined,
		});

		await workflow.start();

		assert.strictEqual(lifecycleStarted, false);
		assert.strictEqual(state.proxyStatus, 'stopped');
	});

	test('keeps Cline unconfigured until extensions restart', async () => {
		const state = createState();
		state.proxyStatus = 'running';
		const calls: string[] = [];
		const successMessages: string[] = [];
		let compatibilityApiKey: string | undefined;
		const workflow = new ClineWorkflow({
			chatOpener: {} as any,
			compatibilityService: {
				evaluate: async (input: any) => {
					calls.push('evaluateCompatibility');
					compatibilityApiKey = input.apiKey;
					return {
						isClineInstalled: true,
						isClineCompatible: true,
						clineCompatibilityMessage: 'compatible',
						isClineConfigInSync: true,
						clineConfigSyncMessage: 'in sync',
					};
				},
			} as any,
			configService: {
				hasPendingConfig: () => true,
				applyPanelConfig: async () => {
					calls.push('applyPanelConfig');
					return { kind: 'applied' };
				},
			} as any,
			extensionHostRestartService: {} as any,
			globalState: { update: async () => undefined },
			presenter: {
				showSuccess: (message: string) => {
					calls.push('showSuccess');
					successMessages.push(message);
				},
			} as any,
			proxyWorkflow: {} as any,
			getState: () => state,
			getWorkspacePath: () => '/workspace',
			getResolvedApiKey: () => 'resolved-secret',
			isClineInstalled: () => true,
			confirmExtensionRestart: async () => {
				calls.push('confirmExtensionRestart');
				return false;
			},
			resolveApiKey: async () => 'resolved-secret',
			isProxyAvailable: () => true,
			postStateUpdate: () => calls.push('postStateUpdate'),
		});

		await workflow.applySettings();

		assert.strictEqual(compatibilityApiKey, 'resolved-secret');
		assert.strictEqual(state.isClineConfigInSync, false);
		assert.strictEqual(
			state.clineConfigSyncMessage,
			'Restart VS Code extensions to finish configuring Cline.'
		);
		assert.strictEqual(workflow.appliedInSession, false);
		assert.deepStrictEqual(calls, [
			'applyPanelConfig',
			'evaluateCompatibility',
			'postStateUpdate',
			'confirmExtensionRestart',
			'showSuccess',
		]);
		assert.match(successMessages[0], /saved.*Restart VS Code extensions/);
	});

	test('marks Cline configured after pending settings are verified on restart', async () => {
		const state = createState();
		const calls: string[] = [];
		const workflow = new ClineWorkflow({
			chatOpener: {} as any,
			compatibilityService: {
				evaluate: async () => {
					calls.push('evaluateCompatibility');
					return {
						isClineInstalled: true,
						isClineCompatible: true,
						clineCompatibilityMessage: 'compatible',
						isClineConfigInSync: true,
						clineConfigSyncMessage: null,
					};
				},
			} as any,
			configService: {
				hasPendingConfig: () => false,
				applyPendingConfig: async () => {
					calls.push('applyPendingConfig');
					return true;
				},
			} as any,
			extensionHostRestartService: {} as any,
			globalState: { update: async () => undefined },
			presenter: { info: () => calls.push('info') } as any,
			proxyWorkflow: {} as any,
			getState: () => state,
			getWorkspacePath: () => '/workspace',
			getResolvedApiKey: () => 'resolved-secret',
			isClineInstalled: () => true,
			confirmExtensionRestart: async () => false,
			resolveApiKey: async () => 'resolved-secret',
			isProxyAvailable: () => false,
			postStateUpdate: () => calls.push('postStateUpdate'),
		});

		await workflow.applyPendingConfig();

		assert.strictEqual(state.isClineConfigInSync, true);
		assert.strictEqual(workflow.appliedInSession, true);
		assert.deepStrictEqual(calls, [
			'applyPendingConfig',
			'evaluateCompatibility',
			'postStateUpdate',
			'info',
		]);
	});

	test('logs Cline navigation success without showing a global notification', async () => {
		const state = createState();
		state.proxyStatus = 'running';
		const loggedMessages: string[] = [];
		const workflow = new ClineWorkflow({
			chatOpener: { open: async () => true } as any,
			compatibilityService: {} as any,
			configService: {} as any,
			extensionHostRestartService: {} as any,
			globalState: { update: async () => undefined },
			presenter: {
				logSuccess: (message: string) => loggedMessages.push(message),
				showSuccess: () => assert.fail('Cline navigation should not show a notification'),
			} as any,
			proxyWorkflow: {} as any,
			getState: () => state,
			getWorkspacePath: () => '/workspace',
			getResolvedApiKey: () => 'resolved-secret',
			isClineInstalled: () => true,
			confirmExtensionRestart: async () => false,
			resolveApiKey: async () => 'resolved-secret',
			isProxyAvailable: () => true,
			postStateUpdate: () => undefined,
		});

		await workflow.openChat();

		assert.deepStrictEqual(loggedMessages, ['Opened Cline chat.']);
	});
});
