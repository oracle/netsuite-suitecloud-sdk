/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const mockGetAuthCredentialsById = jest.fn();
const mockExecuteImportObjectsCommand = jest.fn();
const mockExecuteListObjectsCommand = jest.fn();

jest.mock('../../../../src/utils/AuthenticationUtils', () => ({
	getProjectDefaultAuthId: jest.fn(() => 'myAuth'),
	getAuthCredentialsById: (...args) => mockGetAuthCredentialsById(...args),
}));

jest.mock('../../../../src/SdkExecutor', () => {
	return jest.fn().mockImplementation(() => ({ execute: jest.fn() }));
});

jest.mock('../../../../src/services/ProjectInfoService', () => {
	return jest.fn().mockImplementation(() => ({}));
});

jest.mock('@oracle/suitecloud-sdk-core', () => {
	const sdkCore = jest.requireActual('@oracle/suitecloud-sdk-core');
	return {
		...sdkCore,
		commands: {
			...sdkCore.commands,
			executeImportObjectsCommand: (...args) => mockExecuteImportObjectsCommand(...args),
			executeListObjectsCommand: (...args) => mockExecuteListObjectsCommand(...args),
		},
	};
});

const ImportObjectsCommand = require('../../../../src/commands/object/import/ImportObjectsCommand');

describe('ImportObjectsCommand authentication session', () => {
	beforeEach(() => {
		mockGetAuthCredentialsById.mockReset();
		mockExecuteImportObjectsCommand.mockReset();
		mockExecuteListObjectsCommand.mockReset();
	});

	it('shares one command-scoped provider between interactive input and import execution', () => {
		const command = createImportObjectsCommand();

		expect(command._inputHandler._authSessionProvider).toBe(command._action._authSessionProvider);
	});

	it('uses one credential acquisition for parallel import chunks', async () => {
		mockGetAuthCredentialsById.mockResolvedValue({
			hostName: 'system.netsuite.com',
			accessToken: 'shared-token',
		});
		mockExecuteImportObjectsCommand.mockResolvedValue({
			status: 'SUCCESS',
			data: { successfulImports: [], failedImports: [] },
		});
		const action = createImportObjectsCommand()._action;
		const sdkParams = {
			authid: 'myAuth',
			project: '"/tmp/project"',
			destinationfolder: '"/Objects"',
			type: 'customlist',
		};

		await Promise.all([
			action._executeImportObjectsChunkWithAuthRetry(sdkParams, ['customlist_one'], []),
			action._executeImportObjectsChunkWithAuthRetry(sdkParams, ['customlist_two'], []),
		]);

		expect(mockGetAuthCredentialsById).toHaveBeenCalledTimes(1);
		expect(mockGetAuthCredentialsById).toHaveBeenCalledWith('myAuth', '/tmp/sdk.jar');
		expect(mockExecuteImportObjectsCommand).toHaveBeenCalledTimes(2);
		expect(mockExecuteImportObjectsCommand).toHaveBeenNthCalledWith(1, expect.objectContaining({
			accessToken: 'shared-token',
		}));
		expect(mockExecuteImportObjectsCommand).toHaveBeenNthCalledWith(2, expect.objectContaining({
			accessToken: 'shared-token',
		}));
	});

	it('uses one refresh when parallel chunks reject the same token', async () => {
		mockGetAuthCredentialsById
			.mockResolvedValueOnce({ hostName: 'system.netsuite.com', accessToken: 'initial-token' })
			.mockResolvedValueOnce({ hostName: 'system.netsuite.com', accessToken: 'refreshed-token' });
		mockExecuteImportObjectsCommand.mockImplementation(({ accessToken }) => {
			if (accessToken === 'initial-token') {
				return Promise.resolve({ status: 'ERROR', httpStatusCode: 401, errorMessages: ['Unauthorized'] });
			}
			return Promise.resolve({ status: 'SUCCESS', data: { successfulImports: [], failedImports: [] } });
		});
		const action = createImportObjectsCommand()._action;
		const sdkParams = {
			authid: 'myAuth',
			project: '"/tmp/project"',
			destinationfolder: '"/Objects"',
			type: 'customlist',
		};

		const results = await Promise.all([
			action._executeImportObjectsChunkWithAuthRetry(sdkParams, ['customlist_one'], []),
			action._executeImportObjectsChunkWithAuthRetry(sdkParams, ['customlist_two'], []),
		]);

		expect(results.map(({ status }) => status)).toEqual(['SUCCESS', 'SUCCESS']);
		expect(mockGetAuthCredentialsById).toHaveBeenCalledTimes(2);
		expect(mockGetAuthCredentialsById).toHaveBeenNthCalledWith(1, 'myAuth', '/tmp/sdk.jar');
		expect(mockGetAuthCredentialsById).toHaveBeenNthCalledWith(
			2,
			'myAuth',
			'/tmp/sdk.jar',
			expect.any(Object)
		);
		expect(mockExecuteImportObjectsCommand).toHaveBeenCalledTimes(4);
	});

	it('does not refresh again when a delayed chunk rejects an older token', async () => {
		const authError = { status: 'ERROR', httpStatusCode: 401, errorMessages: ['Unauthorized'] };
		const success = { status: 'SUCCESS', data: { successfulImports: [], failedImports: [] } };
		let rejectDelayedChunk;
		const delayedAuthError = new Promise((resolve) => {
			rejectDelayedChunk = () => resolve(authError);
		});
		mockGetAuthCredentialsById
			.mockResolvedValueOnce({ hostName: 'system.netsuite.com', accessToken: 'initial-token' })
			.mockResolvedValueOnce({ hostName: 'system.netsuite.com', accessToken: 'refreshed-token' });
		mockExecuteImportObjectsCommand.mockImplementation(({ accessToken, scriptIds }) => {
			if (accessToken === 'refreshed-token') {
				return Promise.resolve(success);
			}
			return scriptIds[0] === 'customlist_delayed'
				? delayedAuthError
				: Promise.resolve(authError);
		});
		const action = createImportObjectsCommand()._action;
		const sdkParams = {
			authid: 'myAuth',
			project: '"/tmp/project"',
			destinationfolder: '"/Objects"',
			type: 'customlist',
		};

		const firstChunk = action._executeImportObjectsChunkWithAuthRetry(
			sdkParams,
			['customlist_first'],
			[]
		);
		const delayedChunk = action._executeImportObjectsChunkWithAuthRetry(
			sdkParams,
			['customlist_delayed'],
			[]
		);
		await expect(firstChunk).resolves.toEqual(success);
		rejectDelayedChunk();
		await expect(delayedChunk).resolves.toEqual(success);

		expect(mockGetAuthCredentialsById).toHaveBeenCalledTimes(2);
	});

	it('reuses a session refreshed while listing when object import begins', async () => {
		mockGetAuthCredentialsById
			.mockResolvedValueOnce({ hostName: 'system.netsuite.com', accessToken: 'initial-token' })
			.mockResolvedValueOnce({ hostName: 'system.netsuite.com', accessToken: 'refreshed-token' });
		mockExecuteListObjectsCommand.mockImplementation(({ accessToken }) => Promise.resolve(
			accessToken === 'initial-token'
				? { status: 'ERROR', httpStatusCode: 401, errorMessages: ['Unauthorized'] }
				: { status: 'SUCCESS', data: [] }
		));
		mockExecuteImportObjectsCommand.mockResolvedValue({
			status: 'SUCCESS',
			data: { successfulImports: [], failedImports: [] },
		});
		const command = createImportObjectsCommand();

		await command._inputHandler._executeListObjectsWithAuthRetry({ authid: 'myAuth' });
		await command._action._executeImportObjectsChunkWithAuthRetry(
			{
				authid: 'myAuth',
				project: '"/tmp/project"',
				destinationfolder: '"/Objects"',
				type: 'customlist',
			},
			['customlist_one'],
			[]
		);

		expect(mockGetAuthCredentialsById).toHaveBeenCalledTimes(2);
		expect(mockExecuteImportObjectsCommand).toHaveBeenCalledWith(expect.objectContaining({
			accessToken: 'refreshed-token',
		}));
	});
});

function createImportObjectsCommand() {
	return ImportObjectsCommand.create({
		commandMetadata: { name: 'object:import', options: {} },
		projectFolder: '/tmp/project',
		executionPath: '/tmp/project',
		runInInteractiveMode: true,
		log: {},
		sdkPath: '/tmp/sdk.jar',
		executionEnvironmentContext: { environment: 'test' },
	});
}
