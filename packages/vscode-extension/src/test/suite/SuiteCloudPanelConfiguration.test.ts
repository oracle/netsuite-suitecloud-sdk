/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import {
	buildProxyBaseUrl,
	createInitialPanelState,
	sanitizeProxyPort,
	validateProxyStartInputs,
} from '../../controlPanel/devAssist/Configuration';

suite('SuiteCloud Panel Configuration', () => {
	test('sanitizes invalid ports and builds the loopback proxy URL', () => {
		assert.strictEqual(sanitizeProxyPort(8181, 9000), 8181);
		assert.strictEqual(sanitizeProxyPort(80, 9000), 9000);
		assert.strictEqual(sanitizeProxyPort(70000, 9000), 9000);
		assert.strictEqual(buildProxyBaseUrl(8181), 'http://127.0.0.1:8181/api/internal/devassist');
	});

	test('creates a complete initial state from defaults and preferences', () => {
		const state = createInitialPanelState(
			{ authId: 'default-auth', localPort: 8181 },
			{
				authId: 'saved-auth',
				port: 9000,
				clineScope: 'user',
				autoStartProxyOnStartup: true,
				disableWelcomeNotification: true,
			}
		);

		assert.strictEqual(state.authId, 'saved-auth');
		assert.strictEqual(state.port, 9000);
		assert.strictEqual(state.baseUrl, 'http://127.0.0.1:9000/api/internal/devassist');
		assert.strictEqual(state.proxyStatus, 'stopped');
		assert.strictEqual(state.autoStartProxyOnStartup, true);
		assert.strictEqual(state.disableWelcomeNotification, true);
		assert.strictEqual(state.apiKeyExists, false);
	});

	test('rejects missing and unconfigured Auth IDs', () => {
		assert.throws(
			() => validateProxyStartInputs({ authId: '', port: 8181 }, 'NO_AUTH'),
			/Select a valid auth ID/
		);
		assert.throws(
			() => validateProxyStartInputs({ authId: 'NO_AUTH', port: 8181 }, 'NO_AUTH'),
			/Select a valid auth ID/
		);
	});

	test('accepts valid inputs and rejects out-of-range ports', () => {
		assert.doesNotThrow(() =>
			validateProxyStartInputs({ authId: 'account', port: 8181 }, 'NO_AUTH')
		);
		assert.throws(
			() => validateProxyStartInputs({ authId: 'account', port: 1023 }, 'NO_AUTH'),
			/Port must be between 1024 and 65535/
		);
	});
});
