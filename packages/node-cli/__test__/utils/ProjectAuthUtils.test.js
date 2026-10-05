/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const mockGetAuthCredentialsById = jest.fn();

jest.mock('../../src/services/NodeTranslationService', () => ({
	getMessage: jest.fn((key) => key),
}));

jest.mock('../../src/utils/AuthenticationUtils', () => ({
	getAuthCredentialsById: (...args) => mockGetAuthCredentialsById(...args),
}));

const {
	getAuthCredentialsForProjectCommand,
	refreshAuthCredentialsForProjectCommand,
	shouldRetryProjectCommandAuth,
} = require('../../src/utils/ProjectAuthUtils');

describe('ProjectAuthUtils', () => {
	beforeEach(() => {
		mockGetAuthCredentialsById.mockReset();
	});

	it('should retrieve credentials from auth id', async () => {
		mockGetAuthCredentialsById.mockResolvedValue({
			accessToken: 'access-token',
			hostName: 'system.netsuite.com',
		});

		const result = await getAuthCredentialsForProjectCommand('/tmp/sdk.jar', 'myAuth');
		expect(result).toEqual({
			accessToken: 'access-token',
			hostName: 'system.netsuite.com',
		});
		expect(mockGetAuthCredentialsById).toHaveBeenCalledWith('myAuth', '/tmp/sdk.jar');
	});

	it('should refresh credentials and fetch latest token', async () => {
		mockGetAuthCredentialsById.mockResolvedValue({
			accessToken: 'refreshed-token',
			hostName: 'system.netsuite.com',
		});

		const result = await refreshAuthCredentialsForProjectCommand('/tmp/sdk.jar', 'myAuth', { env: 'test' });
		expect(mockGetAuthCredentialsById).toHaveBeenCalledWith('myAuth', '/tmp/sdk.jar', { env: 'test' });
		expect(result).toEqual({
			accessToken: 'refreshed-token',
			hostName: 'system.netsuite.com',
		});
	});

	it('should retry when status code indicates auth failure', () => {
		expect(shouldRetryProjectCommandAuth({
			status: 'ERROR',
			httpStatusCode: 401,
			errorMessages: ['Unauthorized'],
		})).toBe(true);
	});

	it('should retry when server error message indicates authentication failure', () => {
		expect(shouldRetryProjectCommandAuth({
			status: 'ERROR',
			errorMessages: ['There has been an error authenticating your request.'],
		})).toBe(true);
	});
});
