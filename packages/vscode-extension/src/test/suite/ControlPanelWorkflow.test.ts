/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import { createInitialPanelState } from '../../controlPanel/devAssist/Configuration';
import { SuiteCloudPanelState } from '../../controlPanel/devAssist/State';
import ClineWorkflow from '../../controlPanel/devAssist/workflows/ClineWorkflow';
import ProxyWorkflow from '../../controlPanel/devAssist/workflows/ProxyWorkflow';

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

suite('Control Panel Workflows', () => {
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
			cliService: {
				isProxyStartCommandSupported: () => true,
				getBundledCliVersion: () => '4.0.0',
				getSdkPath: () => '/sdk',
			} as any,
			lifecycleService: {
				start: async (input: any) => {
					calls.push('lifecycleStart');
					input.onStarting({ ...input.state, proxyStatus: 'starting' });
					return { pid: 1234, authId: input.state.authId, port: input.state.port };
				},
			} as any,
			processService: { isRunning: false } as any,
			presenter: presenter as any,
			getState: () => state,
			setState: (nextState) => { state = nextState; },
			getWorkspacePath: () => '/workspace',
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
		assert.strictEqual(state.proxyPid, 1234);
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
			cliService: {} as any,
			lifecycleService: {
				start: async () => {
					lifecycleStarted = true;
					return { pid: 1, authId: 'account', port: 8181 };
				},
			} as any,
			processService: { isRunning: false } as any,
			presenter: {} as any,
			getState: () => state,
			setState: () => undefined,
			getWorkspacePath: () => '/workspace',
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

	test('applies and verifies Cline settings before reporting success', async () => {
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
						isClineCompatible: true,
						clineCompatibilityMessage: 'compatible',
						isClineConfigInSync: true,
						clineConfigSyncMessage: 'in sync',
					};
				},
			} as any,
			configService: {
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
		assert.strictEqual(workflow.appliedInSession, true);
		assert.deepStrictEqual(calls, [
			'applyPanelConfig',
			'evaluateCompatibility',
			'postStateUpdate',
			'confirmExtensionRestart',
			'showSuccess',
		]);
		assert.match(successMessages[0], /updated and verified/);
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
