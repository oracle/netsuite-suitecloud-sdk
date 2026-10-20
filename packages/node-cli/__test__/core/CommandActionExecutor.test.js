'use strict';

const mockCheckIfReauthorizationIsNeeded = jest.fn();
const mockGetAuthInfo = jest.fn();
const mockRefreshAuthorization = jest.fn();
const mockExecuteWithSpinner = jest.fn(({ action }) => action);
const mockGetProjectDefaultAuthId = jest.fn();
jest.mock('../../src/utils/AuthenticationUtils', () => ({
	...jest.requireActual('../../src/utils/AuthenticationUtils'),
	getProjectDefaultAuthId: (...args) => mockGetProjectDefaultAuthId(...args),
	checkIfReauthorizationIsNeeded: (...args) => mockCheckIfReauthorizationIsNeeded(...args),
	getAuthInfo: (...args) => mockGetAuthInfo(...args),
	refreshAuthorization: (...args) => mockRefreshAuthorization(...args),
}));

jest.mock('../../src/ui/CliSpinner', () => ({
	executeWithSpinner: (context) => mockExecuteWithSpinner(context),
}));

const CommandActionExecutor = require('../../src/core/CommandActionExecutor');
const sdkPath = require('../../src/core/sdksetup/SdkProperties').getSdkPath();
const { ActionResult } = require('../../src/services/actionresult/ActionResult');
const { mkdtemp, rm, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const CLIConfigurationService = require('../../src/core/extensibility/CLIConfigurationService');

describe('CommandActionExecutor ExecuteAction():', function() {
	// STARTING MOCKS.
	const mockCommandUserExtensionOnCompleted = jest.fn();
	const mockCommandUserExtensionOnError = jest.fn();
	const mockResult = jest.fn();

	const ConsoleLogger = jest.fn(() => ({
		result: mockResult,
		error: jest.fn(),
		info: jest.fn(),
		warning: jest.fn(),
	}));

	const mockConsoleLogger = new ConsoleLogger();

	const CommandOptionsValidatorWithoutErrors = jest.fn(() => ({
		validate: jest.fn(() => {
			return [];
		}),
	}));

	const CommandOptionsValidatorWithErrors = jest.fn(() => ({
		validate: jest.fn(() => {
			return [{}];
		}),
		formatErrors: jest.fn(),
	}));

	const CommandUserExtension = jest.fn(() => ({
		beforeExecuting: jest.fn(() => {
			return { arguments: {} };
		}),
		onCompleted: mockCommandUserExtensionOnCompleted,
		onError: mockCommandUserExtensionOnError,
	}));

	const CliConfigurationService = jest.fn(() => ({
		initialize: jest.fn(() => {}),
		validateProjectContext: jest.fn(() => {}),
		getProjectFolder: jest.fn(() => {}),
		getCommandUserExtension: jest.fn(() => {
			return new CommandUserExtension();
		}),
	}));

	const CommandsMetadataService = jest.fn(() => ({
		getCommandMetadataByName: jest.fn(() => {
			return { isSetupRequired: false, supportsInteractiveMode: true };
		}),
	}));

	class CommandActionExecutorMock extends CommandActionExecutor {
		constructor(opts) {
			super(opts)
		}
		_getCommand() {
			return {
				run: jest.fn(() => ActionResult.Builder.withData([]).withResultMessage('').build()),
			}
		}
	}

	class CommandActionExecutorErrorMock extends CommandActionExecutor {
		constructor(opts) {
			super(opts)
		}
		_getCommand() {
			return {
				run: jest.fn(() => ActionResult.Builder.withErrors([]).build()),
			}
		}
	}

	let commandExecutor;
	beforeEach(() => {
		// Clear all instances and calls to constructor and all methods:
		commandExecutor = new CommandActionExecutorMock({
			executionPath: 'myFakePath',
			commandOptionsValidator: new CommandOptionsValidatorWithoutErrors(),
			cliConfigurationService: new CliConfigurationService(),
			commandsMetadataService: new CommandsMetadataService(),
			log: mockConsoleLogger,
			sdkPath: sdkPath,
		});

		mockCommandUserExtensionOnCompleted.mockClear();
		mockCommandUserExtensionOnError.mockClear();
		mockCheckIfReauthorizationIsNeeded.mockReset();
		mockGetAuthInfo.mockReset();
		mockRefreshAuthorization.mockReset();
		mockExecuteWithSpinner.mockClear();
		mockGetProjectDefaultAuthId.mockReset();
		mockConsoleLogger.error.mockClear();
	});

	let error = null;

	it('should throw ASSERT EXCEPTION when context is undefined.', async () => {
		try {
			await commandExecutor.executeAction(null);
		} catch (e) {
			error = e;
		}
		expect(error.code).toBe('ERR_ASSERTION');
	});

	it('should throw ASSERT EXCEPTION when commandName is undefined.', async () => {
		error = null;
		try {
			await commandExecutor.executeAction({
				commandName: undefined,
				runInInteractiveMode: true,
				arguments: {},
			});
		} catch (e) {
			error = e;
		}
		expect(error.code).toBe('ERR_ASSERTION');
	});

	it('should throw ASSERT EXCEPTION when arguments is undefined.', async () => {
		error = null;
		try {
			await commandExecutor.executeAction({
				commandName: 'object:import',
				runInInteractiveMode: true,
				arguments: undefined,
			});
		} catch (e) {
			error = e;
		}
		expect(error.code).toBe('ERR_ASSERTION');
	});

	it('should throw ASSERT EXCEPTION when runInInteractiveMode is not boolean type.', async () => {
		error = null;
		try {
			await commandExecutor.executeAction({
				commandName: 'object:import',
				runInInteractiveMode: 'true',
				arguments: {},
			});
		} catch (e) {
			error = e;
		}
		expect(error.code).toBe('ERR_ASSERTION');
	});

	it('Should execute action (Happy Path).', async () => {
		let actionResult = await commandExecutor.executeAction({
			commandName: 'object:import',
			runInInteractiveMode: true,
			arguments: {},
		});
		expect(mockConsoleLogger.error).toHaveBeenCalledTimes(0);
		expect(actionResult._status).toBe('SUCCESS');
	});

	it.each([
		['project:validate', 'json', 'manifest'], ['project:validate', 'json', 'deploy'],
		['project:validate', 'yaml', 'manifest'], ['project:validate', 'yaml', 'deploy'],
		['project:deploy', 'json', 'manifest'], ['project:deploy', 'json', 'deploy'],
		['project:deploy', 'yaml', 'manifest'], ['project:deploy', 'yaml', 'deploy'],
	])('%s rejects missing %s %s before authorization or command execution', async (commandName, format, invalidKind) => {
		const projectFolder = await mkdtemp(join(tmpdir(), 'suitecloud-preflight-'));
		try {
			await writeFile(join(projectFolder, 'suitecloud.config.js'), 'module.exports = { defaultProjectFolder: "." };');
			const existingKind = invalidKind === 'manifest' ? 'deploy' : 'manifest';
			// Setup validation must reject the missing file without parsing the other one's contents.
			await writeFile(join(projectFolder, `${existingKind}.${format}`), '{');
			commandExecutor._executionPath = projectFolder;
			commandExecutor._cliConfigurationService = new CLIConfigurationService();
			commandExecutor._commandsMetadataService.getCommandMetadataByName.mockReturnValue({ isSetupRequired: true, supportsInteractiveMode: true, options: {} });
			const getCommand = jest.spyOn(commandExecutor, '_getCommand');
			const getCommandUserExtension = jest.spyOn(commandExecutor._cliConfigurationService, 'getCommandUserExtension');

			const result = await commandExecutor.executeAction({ commandName, runInInteractiveMode: false, arguments: {} });

			expect(result.isSuccess()).toBe(false);
			expect(result.errorMessages).toEqual([expect.stringContaining(`Missing ${invalidKind} control file`)]);
			expect(mockGetProjectDefaultAuthId).not.toHaveBeenCalled();
			expect(mockCheckIfReauthorizationIsNeeded).not.toHaveBeenCalled();
			expect(mockRefreshAuthorization).not.toHaveBeenCalled();
			expect(getCommand).not.toHaveBeenCalled();
			expect(getCommandUserExtension).not.toHaveBeenCalled();
		} finally {
			await rm(projectFolder, { recursive: true, force: true });
		}
	});

	it.each(['project:validate', 'project:deploy'])('%s validates setup before the user hook, then authorizes and executes', async (commandName) => {
		const projectFolder = await mkdtemp(join(tmpdir(), 'suitecloud-preflight-hook-'));
		try {
			await writeFile(join(projectFolder, 'suitecloud.config.js'), 'module.exports = { defaultProjectFolder: "." };');
			await writeFile(join(projectFolder, 'manifest.json'), '{');
			await writeFile(join(projectFolder, 'deploy.json'), '{"deploy": []}');
			const beforeExecuting = jest.fn(async () => {
				await writeFile(join(projectFolder, 'manifest.json'), '{"manifest": {"projecttype": "ACCOUNTCUSTOMIZATION", "frameworkversion": "2.0"}}');
				return { arguments: {} };
			});
			commandExecutor._executionPath = projectFolder;
			commandExecutor._cliConfigurationService = new CLIConfigurationService();
			const validateProjectContext = jest.spyOn(commandExecutor._cliConfigurationService, 'validateProjectContext');
			jest.spyOn(commandExecutor._cliConfigurationService, 'getCommandUserExtension').mockReturnValue({ beforeExecuting });
			commandExecutor._commandsMetadataService.getCommandMetadataByName.mockReturnValue({ isSetupRequired: true, supportsInteractiveMode: true, options: {} });
			mockGetProjectDefaultAuthId.mockReturnValue('myAuth');
			mockCheckIfReauthorizationIsNeeded.mockResolvedValue({ isSuccess: () => true, data: { needsReauthorization: false } });
			const run = jest.fn(async () => ActionResult.Builder.withData([]).build());
			const getCommand = jest.spyOn(commandExecutor, '_getCommand').mockReturnValue({ run });

			const result = await commandExecutor.executeAction({ commandName, runInInteractiveMode: false, arguments: {} });

			expect(result.isSuccess()).toBe(true);
			expect(validateProjectContext).toHaveBeenCalledWith(commandName);
			expect(validateProjectContext.mock.invocationCallOrder[0]).toBeLessThan(beforeExecuting.mock.invocationCallOrder[0]);
			expect(beforeExecuting.mock.invocationCallOrder[0]).toBeLessThan(mockCheckIfReauthorizationIsNeeded.mock.invocationCallOrder[0]);
			expect(mockCheckIfReauthorizationIsNeeded.mock.invocationCallOrder[0]).toBeLessThan(getCommand.mock.invocationCallOrder[0]);
			expect(run).toHaveBeenCalledTimes(1);
		} finally {
			await rm(projectFolder, { recursive: true, force: true });
		}
	});

	it('should show progress while checking whether authorization must be refreshed', async () => {
		const inspection = Promise.resolve({
			isSuccess: () => true,
			data: { needsReauthorization: false },
		});
		mockCheckIfReauthorizationIsNeeded.mockReturnValue(inspection);

		await commandExecutor._refreshAuthorizationIfNeeded('myAuth');

		expect(mockExecuteWithSpinner).toHaveBeenCalledWith({
			action: inspection,
			message: 'Checking authorization...',
		});
		expect(mockRefreshAuthorization).not.toHaveBeenCalled();
	});

	it('adds the configured host when authorization inspection fails', async () => {
		mockCheckIfReauthorizationIsNeeded.mockResolvedValue({
			isSuccess: () => false,
			errorMessages: ['Received fatal alert: internal_error'],
		});
		mockGetAuthInfo.mockResolvedValue({
			isSuccess: () => true,
			data: { hostInfo: { hostName: 'test.vm.eng.netsuite.com' } },
		});

		await expect(commandExecutor._refreshAuthorizationIfNeeded('myAuth')).rejects.toEqual([
			'Received fatal alert: internal_error\n' +
				'Authentication ID: myAuth\n' +
				'Host: test.vm.eng.netsuite.com\n' +
				'Verify the network configuration and that the Host is reachable.',
		]);
	});

	it('preserves the original authorization error when the configured host cannot be read', async () => {
		mockCheckIfReauthorizationIsNeeded.mockResolvedValue({
			isSuccess: () => false,
			errorMessages: ['Authorization inspection failed'],
		});
		mockGetAuthInfo.mockRejectedValue(new Error('Credentials unavailable'));

		await expect(commandExecutor._refreshAuthorizationIfNeeded('myAuth')).rejects.toEqual([
			'Authorization inspection failed',
		]);
	});

	it('Should throw EXCEPTION when setup is required and there is not any account configured.', async () => {
		const CommandsMetadataServiceSetupRequired = jest.fn(() => ({
			getCommandMetadataByName: jest.fn(() => {
				return { isSetupRequired: true, supportsInteractiveMode: true };
			}),
		}));

		const commandExecutorWithoutAccountConf = new CommandActionExecutorMock({
			executionPath: 'myFakePath',
			commandOptionsValidator: new CommandOptionsValidatorWithErrors(),
			cliConfigurationService: new CliConfigurationService(),
			commandsMetadataService: new CommandsMetadataServiceSetupRequired(),
			log: mockConsoleLogger,
			sdkPath: sdkPath,
		});

		try {
			await commandExecutorWithoutAccountConf.executeAction({
				commandName: 'object:import',
				runInInteractiveMode: true,
				arguments: {},
			});
		} catch (error) {
			expect(error).toBe('No account has been set up for this project. Run "suitecloud account:setup" to link your project with your account.');
		}
		expect(mockConsoleLogger.error).toHaveBeenCalled();
	});

	it('Should throw EXCEPTION when running as interactive and current command does not support it.', async () => {
		const CommandsMetadataServiceNotSupportInteractiveMode = jest.fn(() => ({
			getCommandMetadataByName: jest.fn(() => {
				return { isSetupRequired: false, supportsInteractiveMode: false };
			}),
		}));

		const commandExecutorWithoutAccountConf = new CommandActionExecutorMock({
			executionPath: 'myFakePath',
			commandOptionsValidator: new CommandOptionsValidatorWithErrors(),
			cliConfigurationService: new CliConfigurationService(),
			commandsMetadataService: new CommandsMetadataServiceNotSupportInteractiveMode(),
			log: mockConsoleLogger,
			sdkPath: sdkPath,
		});

		await commandExecutorWithoutAccountConf.executeAction({
			commandName: 'object:import',
			runInInteractiveMode: true,
			arguments: {},
		});
		expect(mockConsoleLogger.error).toHaveBeenCalled();
	});

	it('Should trigger CommandUserExtension.onError.', async () => {

		const commandExecutorWithError = new CommandActionExecutorErrorMock({
			executionPath: 'myFakePath',
			commandOptionsValidator: new CommandOptionsValidatorWithoutErrors(),
			cliConfigurationService: new CliConfigurationService(),
			commandsMetadataService: new CommandsMetadataService(),
			log: mockConsoleLogger,
			sdkPath: sdkPath,
		});

		await commandExecutorWithError.executeAction({
			commandName: 'project:deploy',
			runInInteractiveMode: false,
			arguments: {},
		});
		expect(mockCommandUserExtensionOnError).toHaveBeenCalledTimes(1);
	});

	it('Should trigger CommandUserExtension.onCompleted.', async () => {
		await commandExecutor.executeAction({
			commandName: 'project:deploy',
			runInInteractiveMode: false,
			arguments: {},
		});
		expect(mockCommandUserExtensionOnCompleted).toHaveBeenCalledTimes(1);
	});
});
