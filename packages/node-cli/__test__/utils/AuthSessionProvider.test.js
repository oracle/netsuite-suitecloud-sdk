/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const mockGetAuthCredentialsById = jest.fn();

jest.mock('../../src/utils/AuthenticationUtils', () => ({
	getAuthCredentialsById: (...args) => mockGetAuthCredentialsById(...args),
}));

const { createCredentialSessionProvider } = require('../../src/utils/AuthSessionProvider');

describe('AuthSessionProvider', () => {
	beforeEach(() => {
		mockGetAuthCredentialsById.mockReset();
	});

	it('shares the initial session between concurrent callers', async () => {
		const session = { hostName: 'system.netsuite.com', accessToken: 'initial-token' };
		mockGetAuthCredentialsById.mockResolvedValue(session);
		const provider = createCredentialSessionProvider('/tmp/sdk.jar', { environment: 'test' });

		const [first, second] = await Promise.all([
			provider.resolveAuthSession('myAuth'),
			provider.resolveAuthSession('myAuth'),
		]);

		expect(first).toBe(session);
		expect(second).toBe(session);
		expect(mockGetAuthCredentialsById).toHaveBeenCalledTimes(1);
		expect(mockGetAuthCredentialsById).toHaveBeenCalledWith('myAuth', '/tmp/sdk.jar');
	});

	it('performs one refresh for concurrent callers rejected with the same session', async () => {
		const initialSession = { hostName: 'system.netsuite.com', accessToken: 'initial-token' };
		const refreshedSession = { hostName: 'system.netsuite.com', accessToken: 'refreshed-token' };
		mockGetAuthCredentialsById
			.mockResolvedValueOnce(initialSession)
			.mockResolvedValueOnce(refreshedSession);
		const executionEnvironmentContext = { environment: 'test' };
		const provider = createCredentialSessionProvider('/tmp/sdk.jar', executionEnvironmentContext);
		await provider.resolveAuthSession('myAuth');

		const [first, second] = await Promise.all([
			provider.refreshAuthSession('myAuth', initialSession),
			provider.refreshAuthSession('myAuth', initialSession),
		]);

		expect(first).toBe(refreshedSession);
		expect(second).toBe(refreshedSession);
		expect(mockGetAuthCredentialsById).toHaveBeenCalledTimes(2);
		expect(mockGetAuthCredentialsById).toHaveBeenLastCalledWith(
			'myAuth',
			'/tmp/sdk.jar',
			executionEnvironmentContext
		);
	});

	it('reuses a newer session when a late request reports the previous token', async () => {
		const initialSession = { hostName: 'system.netsuite.com', accessToken: 'initial-token' };
		const refreshedSession = { hostName: 'system.netsuite.com', accessToken: 'refreshed-token' };
		mockGetAuthCredentialsById
			.mockResolvedValueOnce(initialSession)
			.mockResolvedValueOnce(refreshedSession);
		const provider = createCredentialSessionProvider('/tmp/sdk.jar', { environment: 'test' });
		await provider.resolveAuthSession('myAuth');
		await provider.refreshAuthSession('myAuth', initialSession);

		const session = await provider.refreshAuthSession('myAuth', initialSession);

		expect(session).toBe(refreshedSession);
		expect(mockGetAuthCredentialsById).toHaveBeenCalledTimes(2);
	});

	it('supports existing refresh callers that do not pass the rejected session', async () => {
		const initialSession = { hostName: 'system.netsuite.com', accessToken: 'initial-token' };
		const refreshedSession = { hostName: 'system.netsuite.com', accessToken: 'refreshed-token' };
		mockGetAuthCredentialsById
			.mockResolvedValueOnce(initialSession)
			.mockResolvedValueOnce(refreshedSession);
		const provider = createCredentialSessionProvider('/tmp/sdk.jar', { environment: 'test' });
		await provider.resolveAuthSession('myAuth');

		await expect(provider.refreshAuthSession('myAuth')).resolves.toBe(refreshedSession);
		expect(mockGetAuthCredentialsById).toHaveBeenCalledTimes(2);
	});

	it('shares a failed refresh and allows a later refresh attempt', async () => {
		const initialSession = { hostName: 'system.netsuite.com', accessToken: 'initial-token' };
		const refreshedSession = { hostName: 'system.netsuite.com', accessToken: 'refreshed-token' };
		mockGetAuthCredentialsById
			.mockResolvedValueOnce(initialSession)
			.mockRejectedValueOnce(new Error('refresh failed'))
			.mockResolvedValueOnce(refreshedSession);
		const provider = createCredentialSessionProvider('/tmp/sdk.jar', { environment: 'test' });
		await provider.resolveAuthSession('myAuth');

		const refreshes = await Promise.allSettled([
			provider.refreshAuthSession('myAuth', initialSession),
			provider.refreshAuthSession('myAuth', initialSession),
		]);

		expect(refreshes.map((result) => result.status)).toEqual(['rejected', 'rejected']);
		expect(mockGetAuthCredentialsById).toHaveBeenCalledTimes(2);
		await expect(provider.refreshAuthSession('myAuth', initialSession)).resolves.toBe(refreshedSession);
		expect(mockGetAuthCredentialsById).toHaveBeenCalledTimes(3);
	});

	it('does not cache a failed initial session resolution', async () => {
		const session = { hostName: 'system.netsuite.com', accessToken: 'initial-token' };
		mockGetAuthCredentialsById
			.mockRejectedValueOnce(new Error('temporary failure'))
			.mockResolvedValueOnce(session);
		const provider = createCredentialSessionProvider('/tmp/sdk.jar', { environment: 'test' });

		await expect(provider.resolveAuthSession('myAuth')).rejects.toThrow('temporary failure');
		await expect(provider.resolveAuthSession('myAuth')).resolves.toBe(session);
		expect(mockGetAuthCredentialsById).toHaveBeenCalledTimes(2);
	});
});
