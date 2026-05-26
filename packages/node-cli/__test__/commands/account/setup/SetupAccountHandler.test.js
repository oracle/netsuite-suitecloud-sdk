/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { normalizeSetupParams } = require('@oracle/suitecloud-sdk-core/commands/account/setup/SetupAccountHandler');

describe('SetupAccountHandler', () => {
	it('should omit production url', () => {
		const params = {
			authid: 'my_auth_id',
			url: 'system.netsuite.com',
		};

		const normalizedParams = normalizeSetupParams(params);

		expect(normalizedParams).toEqual({ authid: 'my_auth_id' });
	});

	it('should keep non-production url', () => {
		const params = {
			authid: 'my_auth_id',
			url: '123456-sb1.suitetalk.api.netsuite.com',
		};

		const normalizedParams = normalizeSetupParams(params);

		expect(normalizedParams.url).toBe('123456-sb1.suitetalk.api.netsuite.com');
	});
});
