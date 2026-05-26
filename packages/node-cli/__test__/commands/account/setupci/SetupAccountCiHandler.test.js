/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { normalizeSetupCiParams, getSetupCiAuthId, cleanPrivateKey } = require('@oracle/suitecloud-sdk-core/commands/account/setupci/SetupAccountCiHandler');

describe('SetupAccountCiHandler', () => {
	describe('normalizeSetupCiParams', () => {
		it('should uppercase account and omit production domain', () => {
			const inputParams = {
				account: 'abc_123',
				authid: 'auth-id',
				domain: 'system.netsuite.com',
			};

			const normalizedParams = normalizeSetupCiParams(inputParams);

			expect(normalizedParams.account).toBe('ABC_123');
			expect(normalizedParams).not.toHaveProperty('domain');
		});

		it('should keep non-production domain', () => {
			const inputParams = {
				account: 'abc_123',
				domain: '123456-sb1.suitetalk.api.netsuite.com',
			};

			const normalizedParams = normalizeSetupCiParams(inputParams);

			expect(normalizedParams.account).toBe('ABC_123');
			expect(normalizedParams.domain).toBe('123456-sb1.suitetalk.api.netsuite.com');
		});
	});

	describe('getSetupCiAuthId', () => {
		it('should return authid in setup mode', () => {
			const authId = getSetupCiAuthId({ authid: 'setup-auth-id', select: 'selected-auth-id' }, true);
			expect(authId).toBe('setup-auth-id');
		});

		it('should return select in select mode', () => {
			const authId = getSetupCiAuthId({ authid: 'setup-auth-id', select: 'selected-auth-id' }, false);
			expect(authId).toBe('selected-auth-id');
		});
	});

	describe('cleanPrivateKey', () => {
		it('should remove private key wrappers and line breaks', () => {
			const privateKey = '-----BEGIN PRIVATE KEY-----\nABC123\r\nXYZ789\n-----END PRIVATE KEY-----';
			const cleanedPrivateKey = cleanPrivateKey(privateKey);
			expect(cleanedPrivateKey).toBe('ABC123XYZ789');
		});
	});
});
