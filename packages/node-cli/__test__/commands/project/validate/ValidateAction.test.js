/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { resolve } = require('node:path');

jest.mock('../../../../src/SdkExecutor', () => {
	return jest.fn().mockImplementation(() => ({
		execute: jest.fn(),
	}));
});

jest.mock('../../../../src/services/ProjectInfoService', () => {
	return jest.fn().mockImplementation(() => ({
		getProjectType: () => 'SUITEAPP',
		getProjectName: () => 'My Project',
		getPublisherId: () => 'com.netsuite',
		getProjectId: () => 'ts',
	}));
});

jest.mock('../../../../src/services/NodeTranslationService', () => ({
	getMessage: jest.fn((key) => key),
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
			accountInfo: {
				companyId: '1234567',
				companyName: 'Example Account',
				roleName: 'Administrator',
			},
		}),
		refreshAuthSession: jest.fn().mockResolvedValue({
			hostName: 'system.netsuite.com',
			accessToken: 'refreshed-token',
		}),
	})),
}));

jest.mock('@oracle/suitecloud-sdk-core', () => {
	const sdkCore = jest.requireActual('@oracle/suitecloud-sdk-core');
	return {
		...sdkCore,
		auth: {
			...sdkCore.auth,
			executeWithAuthRetry: jest.fn(async ({ authSessionProvider, executeWithAuthSession, authId, shouldRetryAuth }) => {
				const firstSession = await authSessionProvider.resolveAuthSession(authId);
				const firstResult = await executeWithAuthSession(firstSession);
				if (shouldRetryAuth && shouldRetryAuth(firstResult)) {
					const secondSession = await authSessionProvider.refreshAuthSession(authId, firstSession);
					return executeWithAuthSession(secondSession);
				}
				return firstResult;
			}),
			shouldRetryAuthByResult: jest.fn((operationResult) => operationResult && operationResult.status === 'ERROR' && operationResult.httpStatusCode === 401),
		},
		commands: {
			...sdkCore.commands,
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
		},
	};
});

const ValidateAction = require('../../../../src/commands/project/validate/ValidateAction');
const {
	executeProjectCommand,
} = require('@oracle/suitecloud-sdk-core').commands;
const {
	executeWithAuthRetry,
} = require('@oracle/suitecloud-sdk-core').auth;
const {
	executeWithSpinner,
} = require('../../../../src/ui/CliSpinner');
const NodeTranslationService = require('../../../../src/services/NodeTranslationService');

describe('ValidateAction', () => {
	beforeEach(() => {
		executeProjectCommand.mockClear();
		executeWithAuthRetry.mockClear();
		executeWithSpinner.mockClear();
	});

	it('should use server validation by default and execute through TS core', async () => {
		const warning = jest.fn();
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
			log: { warning, info: jest.fn() },
		});

		const actionResult = await validateAction.execute({
			project: '"/tmp/project"',
			authid: 'myAuth',
			server: true,
			applyinstallprefs: true,
		});

		expect(executeProjectCommand).toHaveBeenCalledTimes(1);
		const executionInput = executeProjectCommand.mock.calls[0][0];
		expect(executionInput.command).toBe('validate');
		expect(executionInput.flags).toEqual(['applyinstallprefs']);
		expect(executionInput.summaryContext).toEqual({
			accountId: '1234567',
			accountName: 'Example Account',
			applyInstallationPreferences: true,
			roleName: 'Administrator',
			suiteAppId: 'com.netsuite.ts',
		});
		expect(executeWithSpinner).toHaveBeenCalledTimes(1);
		expect(executeWithSpinner.mock.calls[0][0].message).toBe('COMMAND_VALIDATE_MESSAGES_VALIDATING');
		expect(NodeTranslationService.getMessage).toHaveBeenCalledWith(
			'COMMAND_VALIDATE_MESSAGES_VALIDATING',
			'com.netsuite.ts',
			'myAuth'
		);
		expect(warning).toHaveBeenCalledWith('COMMAND_VALIDATE_WARNINGS_SERVER_OPTION_IGNORED');
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

	it('should preserve SuiteApp installation preference details when validation fails', async () => {
		executeProjectCommand.mockResolvedValueOnce({
			status: 'ERROR',
			httpStatusCode: 400,
			errorMessages: ['Validation failed'],
		});
		const validateAction = new ValidateAction({
			projectFolder: '/tmp/project/src',
			commandMetadata: {
				name: 'project:validate',
				options: { project: {}, authid: {}, applyinstallprefs: {} },
			},
			executionPath: '/tmp/project',
			sdkPath: '/tmp/sdk.jar',
			log: { warning: jest.fn(), info: jest.fn() },
		});

		const result = await validateAction.execute({
			project: '"/tmp/project/src"',
			authid: 'myAuth',
			applyinstallprefs: true,
		});

		expect(result.appliedInstallationPreferences).toBe(true);
		expect(result.projectFolder).toBeUndefined();
		expect(result.projectType).toBe('SUITEAPP');
	});

	it('should preserve raw-output parameters when validation throws', async () => {
		executeProjectCommand.mockRejectedValueOnce(new Error('Request failed'));
		const validateAction = new ValidateAction({
			projectFolder: '/tmp/project/src',
			commandMetadata: {
				name: 'project:validate',
				options: { project: {}, authid: {}, applyinstallprefs: {}, json: {} },
			},
			executionPath: '/tmp/project',
			sdkPath: '/tmp/sdk.jar',
			log: { warning: jest.fn(), info: jest.fn() },
		});

		const result = await validateAction.execute({
			project: '"/tmp/project/src"',
			authid: 'myAuth',
			applyinstallprefs: true,
			json: true,
		});

		expect(result.commandParameters.json).toBe(true);
	});

	it('should write the validation result when --log is requested', async () => {
		executeProjectCommand.mockResolvedValueOnce({
			status: 'SUCCESS',
			data: ['Validated'],
			logFilePath: resolve('/tmp/project', 'validation.log'),
		});
		const info = jest.fn();
		const validateAction = new ValidateAction({
			projectFolder: '/tmp/project',
			commandMetadata: {
				name: 'project:validate',
				options: { project: {}, authid: {}, log: {} },
			},
			executionPath: '/tmp/project',
			sdkPath: '/tmp/sdk.jar',
			log: { warning: jest.fn(), info },
		});

		await validateAction.execute({
			project: '"/tmp/project"',
			authid: 'myAuth',
			log: './validation.log',
		});

		expect(executeProjectCommand.mock.calls[0][0].logFileLocation).toBe(resolve('/tmp/project', 'validation.log'));
		expect(info).toHaveBeenCalledWith('PROJECT_COMMAND_LOG_MESSAGES_WRITING');
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
		expect(executeWithSpinner).toHaveBeenCalledTimes(1);
		expect(executeProjectCommand.mock.calls[1][0].accessToken).toBe('refreshed-token');
		expect(actionResult.isSuccess()).toBe(true);
	});
});
