'use strict';

const mockCheckIfReauthorizationIsNeeded = jest.fn();
const mockGetAuthInfo = jest.fn();
const mockRefreshAuthorization = jest.fn();
const mockExecuteWithSpinner = jest.fn(({ action }) => action);

jest.mock('../../src/utils/AuthenticationUtils', () => ({
	...jest.requireActual('../../src/utils/AuthenticationUtils'),
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
