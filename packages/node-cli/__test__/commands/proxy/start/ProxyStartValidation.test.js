/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const {
	isValidProxyStartPort,
	getInvalidProxyStartPortMessage,
} = require('../../../../src/commands/proxy/start/ProxyStartValidation');

describe('ProxyStartValidation', () => {
	describe('getInvalidProxyStartPortMessage()', () => {
		it('should return translated invalid-port message', () => {
			expect(getInvalidProxyStartPortMessage()).toBe('The port must be a valid number between 1024 and 65535.');
		});
	});

	describe('isValidProxyStartPort()', () => {
		it.each([
			['string number in range', '8181', true],
			['number in range', 8383, true],
			['minimum boundary', 1024, true],
			['maximum boundary', 65535, true],
			['not a number', 'abc', false],
			['below minimum', 1023, false],
			['above maximum', 65536, false],
		])('should return %s', (_, value, expected) => {
			expect(isValidProxyStartPort(value)).toBe(expected);
		});
	});
});