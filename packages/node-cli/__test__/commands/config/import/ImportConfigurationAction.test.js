/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const mockGetAuthCredentialsById = jest.fn();
const mockExecuteImportConfiguration = jest.fn();
let mockProjectType = 'ACCOUNTCUSTOMIZATION';

jest.mock('../../../../src/utils/AuthenticationUtils', () => ({
	getAuthCredentialsById: (...args) => mockGetAuthCredentialsById(...args),
}));
jest.mock('../../../../src/services/ProjectInfoService', () =>
	jest.fn().mockImplementation(() => ({ getProjectType: () => mockProjectType }))
);
jest.mock('../../../../src/SdkExecutor', () => jest.fn().mockImplementation(() => ({})));
jest.mock('@oracle/suitecloud-sdk-core', () => {
	const actual = jest.requireActual('@oracle/suitecloud-sdk-core');
	return {
		...actual,
		commands: {
			...actual.commands,
			executeImportConfiguration: (...args) => mockExecuteImportConfiguration(...args),
		},
	};
});

const ImportConfigurationCommand = require('../../../../src/commands/config/import/ImportConfigurationCommand');

describe('ImportConfigurationAction', () => {
	beforeEach(() => {
		mockProjectType = 'ACCOUNTCUSTOMIZATION';
		mockGetAuthCredentialsById.mockReset();
		mockExecuteImportConfiguration.mockReset();
	});

	it('gets credentials by auth ID and imports into the current project', async () => {
		mockGetAuthCredentialsById.mockResolvedValue({ hostName: 'system.netsuite.com', accessToken: 'token' });
		mockExecuteImportConfiguration.mockResolvedValue({
			status: 'SUCCESS', data: { successfulImports: [], failedImports: [] },
		});

		const result = await createCommand()._action.execute({ authid: 'myAuth' });

		expect(result.isSuccess()).toBe(true);
		expect(mockGetAuthCredentialsById).toHaveBeenCalledWith('myAuth', '/tmp/sdk.jar');
		expect(mockExecuteImportConfiguration).toHaveBeenCalledWith({
			hostName: 'system.netsuite.com', accessToken: 'token',
			projectFolder: '/tmp/project/src', userAgent: 'test-agent',
		});
		expect(result.commandParameters).toEqual({ authid: 'myAuth' });
	});

	it('rejects SuiteApp projects with the Java command message', async () => {
		mockProjectType = 'SUITEAPP';
		const result = await createCommand()._action.execute({ authid: 'myAuth' });
		expect(result.errorMessages).toEqual([
			'The "config:import" command is only applicable for Account Customization project.',
		]);
		expect(mockGetAuthCredentialsById).not.toHaveBeenCalled();
	});
});

function createCommand() {
	return ImportConfigurationCommand.create({
		commandMetadata: { name: 'config:import', options: {} },
		projectFolder: '/tmp/project/src', executionPath: '/tmp/project',
		runInInteractiveMode: false,
		log: { info: jest.fn(), error: jest.fn(), result: jest.fn() },
		sdkPath: '/tmp/sdk.jar',
		executionEnvironmentContext: { toUserAgentString: () => 'test-agent' },
	});
}
