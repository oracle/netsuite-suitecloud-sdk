/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const {
	validateProxyStartPort,
	normalizeProxyStartPort,
	buildProxyStartAuthIdChoices,
} = require('@oracle/suitecloud-sdk-core/commands/proxy/start/ProxyStartHandler');

describe('ProxyStartHandler', () => {
	it('should validate supported port range', () => {
		expect(validateProxyStartPort(443, 1024, 65535).isValid).toBe(false);
		expect(validateProxyStartPort(8383, 1024, 65535).isValid).toBe(true);
	});

	it('should normalize port into number', () => {
		expect(normalizeProxyStartPort('8383')).toBe(8383);
	});

	it('should build sorted auth id choices', () => {
		const choices = buildProxyStartAuthIdChoices({
			bAuth: { accountInfo: { companyName: 'B Co', roleName: 'Admin' } },
			aAuth: { accountInfo: { companyName: 'A Co', roleName: 'Developer' } },
		});

		expect(choices[0].authId).toBe('aAuth');
		expect(choices[1].authId).toBe('bAuth');
	});
});
