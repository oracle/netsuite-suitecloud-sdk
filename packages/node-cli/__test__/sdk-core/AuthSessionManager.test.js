/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const { executeWithAuthRetry } = require('@oracle/suitecloud-sdk-core').auth;

describe('sdk-core auth retry', () => {
	it('passes the rejected session to the provider and retries once', async () => {
		const initialSession = { hostName: 'system.netsuite.com', accessToken: 'initial-token' };
		const refreshedSession = { hostName: 'system.netsuite.com', accessToken: 'refreshed-token' };
		const authSessionProvider = {
			resolveAuthSession: jest.fn().mockResolvedValue(initialSession),
			refreshAuthSession: jest.fn().mockResolvedValue(refreshedSession),
		};
		const executeWithAuthSession = jest.fn()
			.mockResolvedValueOnce({ status: 'ERROR', httpStatusCode: 401, errorMessages: ['Unauthorized'] })
			.mockResolvedValueOnce({ status: 'SUCCESS', data: [] });

		const result = await executeWithAuthRetry({
			authId: 'myAuth',
			authSessionProvider,
			executeWithAuthSession,
		});

		expect(result.status).toBe('SUCCESS');
		expect(authSessionProvider.refreshAuthSession).toHaveBeenCalledTimes(1);
		expect(authSessionProvider.refreshAuthSession).toHaveBeenCalledWith('myAuth', initialSession);
		expect(executeWithAuthSession).toHaveBeenNthCalledWith(1, initialSession);
		expect(executeWithAuthSession).toHaveBeenNthCalledWith(2, refreshedSession);
	});

	it('does not refresh a non-authentication error', async () => {
		const initialSession = { hostName: 'system.netsuite.com', accessToken: 'initial-token' };
		const errorResult = { status: 'ERROR', httpStatusCode: 500, errorMessages: ['Server error'] };
		const authSessionProvider = {
			resolveAuthSession: jest.fn().mockResolvedValue(initialSession),
			refreshAuthSession: jest.fn(),
		};

		const result = await executeWithAuthRetry({
			authId: 'myAuth',
			authSessionProvider,
			executeWithAuthSession: jest.fn().mockResolvedValue(errorResult),
		});

		expect(result).toBe(errorResult);
		expect(authSessionProvider.refreshAuthSession).not.toHaveBeenCalled();
	});
});
