/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import { createInitialPanelState } from '../../controlPanel/devAssist/Configuration';
import ProxyLifecycleService, {
	ProxyProcess,
	StartPanelProxyInput,
} from '../../service/controlPanel/devAssist/proxy/ProxyLifecycleService';
import { SuiteCloudPanelState } from '../../controlPanel/devAssist/State';

const createState = () =>
	createInitialPanelState(
		{ authId: 'NO_AUTH', localPort: 8181 },
		{
			authId: 'account',
			port: 8181,
			clineScope: 'user',
			autoStartProxyOnStartup: true,
			disableWelcomeNotification: false,
		}
	);

const createProcess = (running = false) => {
	const starts: unknown[] = [];
	let stopCount = 0;
	const process: ProxyProcess = {
		get isRunning() {
			return running;
		},
		start: async (input) => {
			starts.push(input);
			running = true;
			return 1234;
		},
		stop: async () => {
			stopCount += 1;
			running = false;
		},
	};
	return { process, starts, getStopCount: () => stopCount };
};

const createStartInput = (): StartPanelProxyInput => {
	const state = createState();
	return {
		state,
		unconfiguredAuthId: 'NO_AUTH',
		isCommandSupported: () => true,
		getCliVersion: () => '3.2.0',
		getWorkspacePath: () => '/workspace',
		getSdkPath: () => '/sdk',
		resolveApiKey: async () => 'secret',
		onStarting: () => undefined,
	};
};

suite('Control Panel Proxy Lifecycle Service', () => {
	test('validates inputs before consulting CLI capabilities', async () => {
		const { process } = createProcess();
		let capabilityChecked = false;
		const input = createStartInput();
		input.state.authId = 'NO_AUTH';
		input.isCommandSupported = () => {
			capabilityChecked = true;
			return true;
		};

		await assert.rejects(
			new ProxyLifecycleService(process).start(input),
			/Select a valid auth ID/
		);
		assert.strictEqual(capabilityChecked, false);
	});

	test('reports an unsupported bundled CLI before changing state', async () => {
		const { process } = createProcess();
		let startingEmitted = false;
		const input = createStartInput();
		input.isCommandSupported = () => false;
		input.getCliVersion = () => '3.1.0';
		input.onStarting = () => {
			startingEmitted = true;
		};

		await assert.rejects(
			new ProxyLifecycleService(process).start(input),
			/bundled @oracle\/suitecloud-cli version \(3\.1\.0\)/
		);
		assert.strictEqual(startingEmitted, false);
	});

	test('emits starting state and returns the started process details', async () => {
		const { process, starts } = createProcess();
		let startingState = createState();
		const input = createStartInput();
		input.onStarting = (state) => {
			startingState = state;
		};

		const result = await new ProxyLifecycleService(process).start(input);

		assert.strictEqual(startingState.proxyStatus, 'starting');
		assert.strictEqual(startingState.lastError, null);
		assert.deepStrictEqual(starts, [{
			authId: 'account',
			port: 8181,
			cwd: '/workspace',
			sdkPath: '/sdk',
		}]);
		assert.deepStrictEqual(result, { pid: 1234, authId: 'account', port: 8181 });
	});

	test('does not spawn when API key resolution fails', async () => {
		const { process, starts } = createProcess();
		const input = createStartInput();
		input.resolveApiKey = async () => undefined;

		await assert.rejects(
			new ProxyLifecycleService(process).start(input),
			/Unable to resolve an API key/
		);
		assert.strictEqual(starts.length, 0);
	});

	test('reports an absent process without attempting to stop it', async () => {
		const { process, getStopCount } = createProcess(false);
		const state = { ...createState(), proxyStatus: 'error' as const, proxyPid: 1234 };

		const result = await new ProxyLifecycleService(process).stop({
			state,
			preserveStartIntent: false,
			onStopping: async () => assert.fail('stopping transition should not be emitted'),
		});

		assert.strictEqual(result.processWasRunning, false);
		assert.strictEqual(result.clearStartIntent, true);
		assert.strictEqual(getStopCount(), 0);
	});

	test('emits and completes an owned-process stop while preserving start intent', async () => {
		const { process, getStopCount } = createProcess(true);
		const state = {
			...createState(),
			proxyStatus: 'running' as const,
			proxyPid: 1234,
			proxyOwnership: 'owned' as const,
			runtimeAuthId: 'account',
			runtimePort: 8181,
		};
		let stoppingState: SuiteCloudPanelState = state;

		const result = await new ProxyLifecycleService(process).stop({
			state,
			preserveStartIntent: true,
			onStopping: async (nextState) => {
				stoppingState = nextState;
			},
		});

		assert.strictEqual(stoppingState.proxyStatus, 'stopping');
		assert.strictEqual(stoppingState.autoStartProxyOnStartup, true);
		assert.strictEqual(result.processWasRunning, true);
		assert.strictEqual(result.clearStartIntent, false);
		assert.strictEqual(getStopCount(), 1);
	});
});
