/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import {
	formatProxyStartError,
	summarizeInlineError,
} from '../../controlPanel/developerAssistant/proxy/ErrorFormatter';
import { SUITECLOUD_PANEL_RUNTIME_STRINGS } from '../../controlPanel/developerAssistant/Strings';

suite('SuiteCloud Panel Error Formatter', () => {
	test('adds actionable guidance for known proxy startup failures', () => {
		assert.match(formatProxyStartError('Error: EADDRINUSE'), /choose another Local Port/);
		assert.match(formatProxyStartError('Authentication timed out'), /network\/auth errors/);
	});

	test('keeps unknown errors and directs users to detailed output', () => {
		const result = formatProxyStartError('Unexpected startup failure');

		assert.match(result, /^Unexpected startup failure/);
		assert.match(result, /Open Output/);
	});

	test('keeps missing API key guidance concise and actionable', () => {
		const message = SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.unableResolveApiKeyForStart;

		assert.strictEqual(formatProxyStartError(message), message);
	});

	test('reduces multiline errors to a bounded first-line summary', () => {
		assert.strictEqual(summarizeInlineError('\n First useful line \nDetails'), 'First useful line');
		assert.strictEqual(summarizeInlineError(''), 'Operation failed.');
		assert.strictEqual(summarizeInlineError('x'.repeat(200)), `${'x'.repeat(177)}...`);
	});

	test('identifies NetSuite account connection timeouts', () => {
		const message =
			'Connect to 5358634.app.netsuite.com:443 [184.25.192.196] failed: Operation timed out';

		const formatted = formatProxyStartError(message);

		assert.match(formatted, /Verify the VPN or network proxy configuration/);
	});
});
