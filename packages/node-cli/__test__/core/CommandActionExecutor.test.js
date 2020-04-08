'use strict';
const CommandActionExecutor = require('../../src/core/CommandActionExecutor');
const { ActionResult } = require('../../src/commands/actionresult/ActionResult');

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

	const CommandInstanceFactory = jest.fn(() => ({
		create: jest.fn(() => {
			return {
				commandMetadata: { options: {} },
				getCommandQuestions: jest.fn(),
				actionFunc: jest.fn(() =>
					ActionResult.Builder.withData([])
						.withResultMessage('')
						.build()
				),
				outputFormatter: new OutputFormatter(),
				consoleLogger: mockConsoleLogger,
			};
		}),
	}));

	const AuthenticationService = jest.fn(() => ({
		getProjectDefaultAuthId: jest.fn(),
	}));

	const CommandsMetadataService = jest.fn(() => ({
		getCommandMetadataByName: jest.fn(() => {
			return { isSetupRequired: false, supportsInteractiveMode: true };
		}),
	}));

	const OutputFormatter = jest.fn(() => ({
		formatActionResult: jest.fn(),
		formatError: jest.fn(),
	}));

	let commandExecutor;
	beforeEach(() => {
		// Clear all instances and calls to constructor and all methods:
		commandExecutor = new CommandActionExecutor({
			executionPath: 'myFakePath',
			commandOptionsValidator: new CommandOptionsValidatorWithoutErrors(),
			cliConfigurationService: new CliConfigurationService(),
			commandInstanceFactory: new CommandInstanceFactory(),
			authenticationService: new AuthenticationService(),
			commandsMetadataService: new CommandsMetadataService(),
			consoleLogger: mockConsoleLogger,
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
				executionPath: 'C:/',
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
				executionPath: 'C:/',
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
				executionPath: 'C:/',
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
			executionPath: 'C:/',
			commandName: 'object:import',
			runInInteractiveMode: true,
			arguments: {},
		});
		expect(mockConsoleLogger.error).toBeCalledTimes(0);
		expect(actionResult._status).toBe('SUCCESS');
	});

	it('Should throw VALIDATION EXCEPTION when there are validation errors.', async () => {
		const commandExecutorWithValidationErrors = new CommandActionExecutor({
			executionPath: 'myFakePath',
			commandOptionsValidator: new CommandOptionsValidatorWithErrors(),
			cliConfigurationService: new CliConfigurationService(),
			commandInstanceFactory: new CommandInstanceFactory(),
			authenticationService: new AuthenticationService(),
			commandsMetadataService: new CommandsMetadataService(),
			consoleLogger: mockConsoleLogger,
		});

		await commandExecutorWithValidationErrors.executeAction({
			executionPath: 'C:/',
			commandName: 'object:import',
			runInInteractiveMode: true,
			arguments: {},
		});
		expect(mockConsoleLogger.error).toBeCalledTimes(1);
	});

	it('Should throw EXCEPTION when setup is required and there is not any account configured.', async () => {
		const CommandsMetadataServiceSetupRequired = jest.fn(() => ({
			getCommandMetadataByName: jest.fn(() => {
				return { isSetupRequired: true, supportsInteractiveMode: true };
			}),
		}));

		const commandExecutorWithoutAccountConf = new CommandActionExecutor({
			executionPath: 'myFakePath',
			commandOptionsValidator: new CommandOptionsValidatorWithErrors(),
			cliConfigurationService: new CliConfigurationService(),
			commandInstanceFactory: new CommandInstanceFactory(),
			authenticationService: new AuthenticationService(),
			commandsMetadataService: new CommandsMetadataServiceSetupRequired(),
			consoleLogger: mockConsoleLogger,
		});

		try {
			await commandExecutorWithoutAccountConf.executeAction({
				executionPath: 'C:/',
				commandName: 'object:import',
				runInInteractiveMode: true,
				arguments: {},
			});
		} catch (error) {
			expect(error).toBe('No account has been set up for this project. Run "suitecloud account:setup" to link your project with your account.');
		}
		expect(mockConsoleLogger.error).toBeCalledTimes(2);
	});

	it('Should throw EXCEPTION when running as interactive and current command does not support it.', async () => {
		const CommandsMetadataServiceNotSupportInteractiveMode = jest.fn(() => ({
			getCommandMetadataByName: jest.fn(() => {
				return { isSetupRequired: false, supportsInteractiveMode: false };
			}),
		}));

		const commandExecutorWithoutAccountConf = new CommandActionExecutor({
			executionPath: 'myFakePath',
			commandOptionsValidator: new CommandOptionsValidatorWithErrors(),
			cliConfigurationService: new CliConfigurationService(),
			commandInstanceFactory: new CommandInstanceFactory(),
			authenticationService: new AuthenticationService(),
			commandsMetadataService: new CommandsMetadataServiceNotSupportInteractiveMode(),
			consoleLogger: mockConsoleLogger,
		});

		await commandExecutorWithoutAccountConf.executeAction({
			executionPath: 'C:/',
			commandName: 'object:import',
			runInInteractiveMode: true,
			arguments: {},
		});
		expect(mockConsoleLogger.error).toBeCalledTimes(3);
	});

	it('Should trigger CommandUserExtension.onError.', async () => {
		const CommandInstanceFactory = jest.fn(() => ({
			create: jest.fn(() => {
				return {
					commandMetadata: { options: {} },
					_commandMetadata: {},
					getCommandQuestions: jest.fn(),
					actionFunc: jest.fn(() => ActionResult.Builder.withErrors([]).build()),
					outputFormatter: new OutputFormatter(),
					consoleLogger: mockConsoleLogger,
				};
			}),
		}));
		commandExecutor._commandInstanceFactory = new CommandInstanceFactory();

		await commandExecutor.executeAction({
			executionPath: 'C:/',
			commandName: 'project:deploy',
			runInInteractiveMode: false,
			arguments: {},
		});
		expect(mockCommandUserExtensionOnError).toBeCalledTimes(1);
	});

	it('Should trigger CommandUserExtension.onCompleted.', async () => {
		const CommandInstanceFactory = jest.fn(() => ({
			create: jest.fn(() => {
				return {
					commandMetadata: { options: {} },
					_commandMetadata: {},
					getCommandQuestions: jest.fn(),
					actionFunc: jest.fn(() =>
						ActionResult.Builder.withData([])
							.withResultMessage('')
							.build()
					),
					outputFormatter: new OutputFormatter(),
					consoleLogger: mockConsoleLogger,
				};
			}),
		}));
		commandExecutor._commandInstanceFactory = new CommandInstanceFactory();

		await commandExecutor.executeAction({
			executionPath: 'C:/',
			commandName: 'project:deploy',
			runInInteractiveMode: false,
			arguments: {},
		});
		expect(mockCommandUserExtensionOnCompleted).toBeCalledTimes(1);
	});
});
