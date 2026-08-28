/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import {
	formatProxyStartError,
	summarizeInlineError,
} from '../../controlPanel/ErrorFormatter';

suite('SuiteCloud Panel Error Formatter', () => {
	test('adds actionable guidance for known proxy startup failures', () => {
		assert.match(formatProxyStartError('Error: EADDRINUSE', () => '3.2.0'), /choose another Local Port/);
		assert.match(formatProxyStartError('Authentication timed out', () => '3.2.0'), /network\/auth errors/);
		assert.match(
			formatProxyStartError('Command proxy:start does not exist', () => '3.2.0'),
			/@oracle\/suitecloud-cli v3\.2\.0/
		);
	});

	test('keeps unknown errors and directs users to detailed output', () => {
		const result = formatProxyStartError('Unexpected startup failure', () => 'unused');

		assert.match(result, /^Unexpected startup failure/);
		assert.match(result, /Open Output/);
	});

	test('reduces multiline errors to a bounded first-line summary', () => {
		assert.strictEqual(summarizeInlineError('\n First useful line \nDetails'), 'First useful line');
		assert.strictEqual(summarizeInlineError(''), 'Operation failed.');
		assert.strictEqual(summarizeInlineError('x'.repeat(200)), `${'x'.repeat(177)}...`);
	});
});
