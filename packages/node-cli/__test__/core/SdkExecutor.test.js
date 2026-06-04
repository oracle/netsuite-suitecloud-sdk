/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const SdkExecutor = require('../../src/SdkExecutor');

describe('SdkExecutor', () => {
	describe('_splitParameters()', () => {
		let sdkExecutor;

		beforeEach(() => {
			sdkExecutor = new SdkExecutor('fake-sdk-path.jar');
		});

		it.each([
			['undefined value', undefined, []],
			['null value', null, []],
			['empty string', '', []],
			['whitespace only', '   ', []],
			['whitespace-separated values', 'one two three', ['one', 'two', 'three']],
			['double-quoted group preserved as a single value', 'one "two three" four', ['one', '"two three"', 'four']],
			['single double-quoted group', '"one two"', ['"one two"']],
			['outer whitespace trimmed before splitting', '  one  "two three"   four  ', ['one', '"two three"', 'four']],
			['unterminated quoted group returns original value', 'abc "unterminated', ['abc "unterminated']],
			['quotes inside invalid token return original value', 'abc "bad"quote', ['abc "bad"quote']],
		])('should return expected result for %s', (_, value, expected) => {
			expect(sdkExecutor._splitParameters(value)).toStrictEqual(expected);
		});
	});
});