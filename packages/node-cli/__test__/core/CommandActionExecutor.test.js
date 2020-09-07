'use strict';
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
		expect(mockConsoleLogger.error).toBeCalledTimes(0);
		expect(actionResult._status).toBe('SUCCESS');
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
		expect(mockCommandUserExtensionOnError).toBeCalledTimes(1);
	});

	it('Should trigger CommandUserExtension.onCompleted.', async () => {
		await commandExecutor.executeAction({
			commandName: 'project:deploy',
			runInInteractiveMode: false,
			arguments: {},
		});
		expect(mockCommandUserExtensionOnCompleted).toBeCalledTimes(1);
	});
});
