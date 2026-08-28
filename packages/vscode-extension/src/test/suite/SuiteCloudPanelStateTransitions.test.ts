/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import {
	applyFormChangesToState,
	calculatePendingRuntimeConfig,
	clearRuntimeConfig,
	markRuntimeConfigAsActive,
} from '../../panel/SuiteCloudPanelStateTransitions';
import { SuiteCloudPanelState } from '../../panel/SuiteCloudPanelTypes';

const createState = (overrides: Partial<SuiteCloudPanelState> = {}): SuiteCloudPanelState => ({
	isSdkReady: true,
	authId: 'prod-123',
	port: 8181,
	runtimeAuthId: null,
	runtimePort: null,
	hasPendingRuntimeConfig: false,
	apiKeySource: 'unknown',
	maskedApiKey: 'No API key found',
	apiKeyVisible: false,
	apiKeyVisibleUntilMs: null,
	apiKeyExists: false,
	apiKeyActionLabel: 'Generate API Key',
	apiKeyVisibilityInfo: null,
	proxyStatus: 'stopped',
	proxyOwnership: 'none',
	proxyPid: null,
	baseUrl: 'http://127.0.0.1:8181/api/internal/devassist',
	lastError: null,
	autoStartProxyOnStartup: false,
	clineScope: 'workspace',
	authIds: [],
	isClineCompatible: false,
	clineCompatibilityMessage: null,
	isClineConfigInSync: false,
	clineConfigSyncMessage: null,
	disableWelcomeNotification: false,
	expandedViewOpen: false,
	...overrides,
});

suite('SuiteCloud Control Panel State Transitions', () => {
	test('applyFormChangesToState updates editable fields while proxy is stopped', () => {
		const initialState = createState({ proxyStatus: 'stopped' });

		const updatedState = applyFormChangesToState(initialState, {
			authId: 'prod-999',
			port: 9191,
			clineScope: 'user',
			disableWelcomeNotification: true,
		});

		assert.strictEqual(updatedState.authId, 'prod-999');
		assert.strictEqual(updatedState.port, 9191);
		assert.strictEqual(updatedState.clineScope, 'user');
		assert.strictEqual(updatedState.disableWelcomeNotification, true);
		assert.strictEqual(updatedState.hasPendingRuntimeConfig, false);
	});

	test('applyFormChangesToState blocks Auth ID changes while proxy is running', () => {
		const initialState = createState({
			authId: 'prod-123',
			proxyStatus: 'running',
			proxyOwnership: 'owned',
			runtimeAuthId: 'prod-123',
			runtimePort: 8181,
		});

		const updatedState = applyFormChangesToState(initialState, { authId: 'prod-999' });

		assert.strictEqual(updatedState.authId, 'prod-123');
		assert.strictEqual(updatedState.hasPendingRuntimeConfig, false);
	});

	test('applyFormChangesToState blocks local port changes while proxy is running', () => {
		const initialState = createState({
			port: 8181,
			proxyStatus: 'running',
			proxyOwnership: 'owned',
			runtimeAuthId: 'prod-123',
			runtimePort: 8181,
		});

		const updatedState = applyFormChangesToState(initialState, { port: 9191 });

		assert.strictEqual(updatedState.port, 8181);
		assert.strictEqual(updatedState.hasPendingRuntimeConfig, false);
	});

	test('applyFormChangesToState keeps pending false when proxy is stopped', () => {
		const initialState = createState({ proxyStatus: 'stopped' });
		const updatedState = applyFormChangesToState(initialState, { port: 9292 });
		assert.strictEqual(updatedState.hasPendingRuntimeConfig, false);
	});

	test('changing proxy configuration clears a failed startup state', () => {
		const initialState = createState({
			proxyStatus: 'error',
			lastError: 'Port 8181 is already in use.',
		});

		const updatedState = applyFormChangesToState(initialState, { port: 8282 });

		assert.strictEqual(updatedState.port, 8282);
		assert.strictEqual(updatedState.proxyStatus, 'stopped');
		assert.strictEqual(updatedState.lastError, null);
	});

	test('changing an unrelated preference preserves a startup error', () => {
		const initialState = createState({
			proxyStatus: 'error',
			lastError: 'Authentication failed.',
		});

		const updatedState = applyFormChangesToState(initialState, {
			disableWelcomeNotification: true,
		});

		assert.strictEqual(updatedState.proxyStatus, 'error');
		assert.strictEqual(updatedState.lastError, 'Authentication failed.');
	});

	test('markRuntimeConfigAsActive snapshots runtime config and remembers successful starts', () => {
		const initialState = createState({
			authId: 'prod-777',
			port: 9393,
			proxyStatus: 'running',
			proxyOwnership: 'owned',
			hasPendingRuntimeConfig: true,
		});

		const updatedState = markRuntimeConfigAsActive(initialState);
		assert.strictEqual(updatedState.runtimeAuthId, 'prod-777');
		assert.strictEqual(updatedState.runtimePort, 9393);
		assert.strictEqual(updatedState.autoStartProxyOnStartup, true);
		assert.strictEqual(updatedState.hasPendingRuntimeConfig, false);
	});

	test('clearRuntimeConfig clears start intent only after an explicit stop', () => {
		const initialState = createState({
			autoStartProxyOnStartup: true,
			runtimeAuthId: 'prod-123',
			runtimePort: 8181,
		});

		assert.strictEqual(clearRuntimeConfig(initialState).autoStartProxyOnStartup, true);
		assert.strictEqual(
			clearRuntimeConfig(initialState, { clearStartIntent: true }).autoStartProxyOnStartup,
			false
		);
	});

	test('clearRuntimeConfig clears runtime snapshot values', () => {
		const initialState = createState({
			runtimeAuthId: 'prod-123',
			runtimePort: 8181,
			hasPendingRuntimeConfig: true,
		});

		const updatedState = clearRuntimeConfig(initialState);
		assert.strictEqual(updatedState.runtimeAuthId, null);
		assert.strictEqual(updatedState.runtimePort, null);
		assert.strictEqual(updatedState.hasPendingRuntimeConfig, false);
	});

	test('calculatePendingRuntimeConfig returns false when runtime matches current values', () => {
		const state = createState({
			proxyStatus: 'running',
			proxyOwnership: 'owned',
			runtimeAuthId: 'prod-123',
			runtimePort: 8181,
		});
		assert.strictEqual(calculatePendingRuntimeConfig(state), false);
	});

});
