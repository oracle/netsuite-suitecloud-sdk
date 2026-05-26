/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

jest.mock('../../../../src/SdkExecutor', () => {
	return jest.fn().mockImplementation(() => ({
		execute: jest.fn(),
	}));
});

jest.mock('../../../../src/services/ProjectInfoService', () => {
	return jest.fn().mockImplementation(() => ({
		getProjectType: () => 'SUITEAPP',
		getProjectName: () => 'My Project',
	}));
});

jest.mock('../../../../src/services/NodeTranslationService', () => ({
	getMessage: jest.fn(() => 'Validating'),
}));

jest.mock('../../../../src/ui/CliSpinner', () => ({
	executeWithSpinner: jest.fn(({ action }) => action),
}));

jest.mock('../../../../src/utils/AuthenticationUtils', () => ({
	getProjectDefaultAuthId: jest.fn(() => 'myAuth'),
}));

jest.mock('../../../../src/utils/AuthSessionProvider', () => ({
	createCredentialSessionProvider: jest.fn(() => ({
		resolveAuthSession: jest.fn().mockResolvedValue({
			hostName: 'system.netsuite.com',
			accessToken: 'token',
		}),
		refreshAuthSession: jest.fn().mockResolvedValue({
			hostName: 'system.netsuite.com',
			accessToken: 'refreshed-token',
		}),
	})),
}));

jest.mock('@oracle/suitecloud-sdk-core/auth/AuthSessionManager', () => ({
	executeWithAuthRetry: jest.fn(async ({ authSessionProvider, executeWithAuthSession, authId, shouldRetryAuth }) => {
		const firstSession = await authSessionProvider.resolveAuthSession(authId);
		const firstResult = await executeWithAuthSession(firstSession);
		if (shouldRetryAuth && shouldRetryAuth(firstResult)) {
			const secondSession = await authSessionProvider.refreshAuthSession(authId);
			return executeWithAuthSession(secondSession);
		}
		return firstResult;
	}),
	shouldRetryAuthByResult: jest.fn((operationResult) => operationResult && operationResult.status === 'ERROR' && operationResult.httpStatusCode === 401),
}));

jest.mock('@oracle/suitecloud-sdk-core/commands/project/ProjectCommandExecutor', () => ({
	executeProjectCommand: jest.fn().mockResolvedValue({
		status: 'SUCCESS',
		data: ['Validated'],
		resultMessage: 'Validation completed',
	}),
	PROJECT_COMMAND: {
		VALIDATE: 'validate',
	},
	SDK_OPERATION_STATUS: {
		SUCCESS: 'SUCCESS',
		ERROR: 'ERROR',
	},
}));

const ValidateAction = require('../../../../src/commands/project/validate/ValidateAction');
const {
	executeProjectCommand,
} = require('@oracle/suitecloud-sdk-core/commands/project/ProjectCommandExecutor');
const {
	executeWithAuthRetry,
} = require('@oracle/suitecloud-sdk-core/auth/AuthSessionManager');

describe('ValidateAction', () => {
	beforeEach(() => {
		executeProjectCommand.mockClear();
		executeWithAuthRetry.mockClear();
	});

	it('should force server validation mode and execute through TS core', async () => {
		const commandMetadata = {
			name: 'project:validate',
			sdkCommand: 'validate',
			options: {
				project: {},
				authid: {},
				server: {},
				applyinstallprefs: {},
				accountspecificvalues: {},
				json: {},
			},
		};

		const validateAction = new ValidateAction({
			projectFolder: '/tmp/project',
			commandMetadata,
			executionPath: '/tmp/project',
			sdkPath: '/tmp/sdk.jar',
			log: { warning: jest.fn(), info: jest.fn() },
		});

		const actionResult = await validateAction.execute({
			project: '"/tmp/project"',
			authid: 'myAuth',
			server: false,
			applyinstallprefs: true,
		});

		expect(executeProjectCommand).toHaveBeenCalledTimes(1);
		const executionInput = executeProjectCommand.mock.calls[0][0];
		expect(executionInput.command).toBe('validate');
		expect(executionInput.flags).toEqual(['server', 'applyinstallprefs']);
		expect(actionResult.isServerValidation).toBe(true);
		expect(actionResult.isSuccess()).toBe(true);
	});

	it('should pass raw output mode when --json is requested', async () => {
		const commandMetadata = {
			name: 'project:validate',
			sdkCommand: 'validate',
			options: {
				project: {},
				authid: {},
				server: {},
				applyinstallprefs: {},
				accountspecificvalues: {},
				json: {},
			},
		};

		const validateAction = new ValidateAction({
			projectFolder: '/tmp/project',
			commandMetadata,
			executionPath: '/tmp/project',
			sdkPath: '/tmp/sdk.jar',
			log: { warning: jest.fn(), info: jest.fn() },
		});

		await validateAction.execute({
			project: '"/tmp/project"',
			authid: 'myAuth',
			json: true,
		});

		const executionInput = executeProjectCommand.mock.calls[0][0];
		expect(executionInput.rawOutput).toBe(true);
	});

	it('should refresh credentials and retry once on authentication failure', async () => {
		executeProjectCommand
			.mockResolvedValueOnce({
				status: 'ERROR',
				httpStatusCode: 401,
				errorMessages: ['There has been an error authenticating your request.'],
			})
			.mockResolvedValueOnce({
				status: 'SUCCESS',
				data: ['Validated after refresh'],
				resultMessage: 'Validation completed',
			});
		const commandMetadata = {
			name: 'project:validate',
			sdkCommand: 'validate',
			options: {
				project: {},
				authid: {},
				server: {},
				applyinstallprefs: {},
				accountspecificvalues: {},
				json: {},
			},
		};

		const validateAction = new ValidateAction({
			projectFolder: '/tmp/project',
			commandMetadata,
			executionPath: '/tmp/project',
			sdkPath: '/tmp/sdk.jar',
			log: { warning: jest.fn(), info: jest.fn() },
		});

		const actionResult = await validateAction.execute({
			project: '"/tmp/project"',
			authid: 'myAuth',
		});

		expect(executeProjectCommand).toHaveBeenCalledTimes(2);
		expect(executeProjectCommand.mock.calls[1][0].accessToken).toBe('refreshed-token');
		expect(actionResult.isSuccess()).toBe(true);
	});
});
