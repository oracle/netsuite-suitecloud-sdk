/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const mockExecuteImportFilesCommand = jest.fn();
const mockAuthSessionProvider = {
	resolveAuthSession: jest.fn(),
	refreshAuthSession: jest.fn(),
};

jest.mock('../../../src/utils/AuthSessionProvider', () => ({
	createCredentialSessionProvider: jest.fn(() => mockAuthSessionProvider),
}));

jest.mock('../../../src/SdkExecutor', () => {
	return jest.fn().mockImplementation(() => ({ execute: jest.fn() }));
});

jest.mock('../../../src/services/ProjectInfoService', () => {
	return jest.fn().mockImplementation(() => ({ getProjectType: jest.fn() }));
});

jest.mock('@oracle/suitecloud-sdk-core', () => {
	const sdkCore = jest.requireActual('@oracle/suitecloud-sdk-core');
	return {
		...sdkCore,
		commands: {
			...sdkCore.commands,
			executeImportFilesCommand: (...args) => mockExecuteImportFilesCommand(...args),
		},
	};
});

const ImportFilesAction = require('../../../src/commands/file/import/ImportFilesAction');

function createImportFilesAction() {
	return new ImportFilesAction({
		projectFolder: '/tmp/project',
		commandMetadata: { options: {} },
		executionPath: '/tmp/project',
		runInInteractiveMode: false,
		log: {},
		sdkPath: '/tmp/sdk.jar',
		executionEnvironmentContext: { environment: 'test' },
	});
}

describe('ImportFilesAction authentication session', () => {
	beforeEach(() => {
		mockExecuteImportFilesCommand.mockReset();
		mockAuthSessionProvider.resolveAuthSession.mockReset();
		mockAuthSessionProvider.refreshAuthSession.mockReset();
	});

	it('refreshes once with the rejected session and retries with the new token', async () => {
		const initialSession = { hostName: 'system.netsuite.com', accessToken: 'initial-token' };
		const refreshedSession = { hostName: 'system.netsuite.com', accessToken: 'refreshed-token' };
		mockAuthSessionProvider.resolveAuthSession.mockResolvedValue(initialSession);
		mockAuthSessionProvider.refreshAuthSession.mockResolvedValue(refreshedSession);
		mockExecuteImportFilesCommand
			.mockResolvedValueOnce({ status: 'ERROR', httpStatusCode: 401, errorMessages: ['Unauthorized'] })
			.mockResolvedValueOnce({ status: 'SUCCESS', data: { results: [] } });
		const action = createImportFilesAction();

		const result = await action._executeImportWithAuthRetry({
			authid: 'myAuth',
			project: '"/tmp/project"',
			paths: '"/SuiteScripts/example.js"',
		});

		expect(result.status).toBe('SUCCESS');
		expect(mockAuthSessionProvider.refreshAuthSession).toHaveBeenCalledWith('myAuth', initialSession);
		expect(mockExecuteImportFilesCommand).toHaveBeenNthCalledWith(1, expect.objectContaining({
			accessToken: 'initial-token',
		}));
		expect(mockExecuteImportFilesCommand).toHaveBeenNthCalledWith(2, expect.objectContaining({
			accessToken: 'refreshed-token',
		}));
	});

	it('forwards the SuiteApp path permission used by compare-file imports', async () => {
		mockAuthSessionProvider.resolveAuthSession.mockResolvedValue({
			hostName: 'system.netsuite.com',
			accessToken: 'access-token',
		});
		mockExecuteImportFilesCommand.mockResolvedValue({ status: 'SUCCESS', data: { results: [] } });
		const action = createImportFilesAction();
		action._calledFromCompareFiles = true;

		await action.execute({
			authid: 'myAuth',
			project: '"/tmp/project"',
			paths: '"/SuiteApps/com.example.app/example.js"',
		});

		expect(mockExecuteImportFilesCommand).toHaveBeenCalledWith(expect.objectContaining({
			allowSuiteAppPaths: true,
		}));
	});
});
