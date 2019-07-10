'use strict';
const CommandActionExecutor = require('../../src/core/CommandActionExecutor');
const CLIException = require('../../src/CLIException');

describe('CommandActionExecutor ExecuteAction():', function() {
	// STARTING MOCKS.
	const mockShowErrorResult = jest.fn();
	const mockShowSuccessResult = jest.fn();

	const CommandOutputHandler = jest.fn(() => ({
		showErrorResult: mockShowErrorResult,
		showSuccessResult: mockShowSuccessResult,
	}));

	const mockCommandOutputHandler = new CommandOutputHandler();

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
				actionFunc: jest.fn(),
				formatOutputFunc: jest.fn(),
			};
		}),
	}));

	const AccountDetailsService = jest.fn(() => ({
		get: jest.fn()
	}));

	const CommandsMetadataService = jest.fn(() => ({
		getCommandMetadataByName: jest.fn(() => {
			return { isSetupRequired: false, supportsInteractiveMode: true };
		})
	}));

	const commandExecutor = new CommandActionExecutor({
		commandOutputHandler: mockCommandOutputHandler,
		commandOptionsValidator: new CommandOptionsValidatorWithoutErrors(),
		cliConfigurationService: new CliConfigurationService(),
		commandInstanceFactory: new CommandInstanceFactory(),
		accountDetailsService: new AccountDetailsService(),
		commandsMetadataService: new CommandsMetadataService(),
	});

	beforeEach(() => {
		// Clear all instances and calls to constructor and all methods:
		mockShowErrorResult.mockClear();
		mockShowSuccessResult.mockClear();
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

	it('should throw ASSERT EXCEPTION when executionPath is undefined.', async () => {
		error = null;
		try {
			await commandExecutor.executeAction({
				executionPath: undefined,
				commandName: 'importobjects',
				runInInteractiveMode: true,
				arguments: {},
			});
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
				commandName: 'importobjects',
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
				commandName: 'importobjects',
				runInInteractiveMode: 'true',
				arguments: {},
			});
		} catch (e) {
			error = e;
		}
		expect(error.code).toBe('ERR_ASSERTION');
	});

	it('Should execute action (Happy Path).', async () => {
		await commandExecutor.executeAction({
			executionPath: 'C:/',
			commandName: 'importobjects',
			runInInteractiveMode: true,
			arguments: {},
		});
		expect(mockCommandOutputHandler.showErrorResult).toBeCalledTimes(0);
		expect(mockCommandOutputHandler.showSuccessResult).toBeCalledTimes(1);
	});

	it('Should throw VALIDATION EXCEPTION when there are validation errors.', async () => {
		const commandExecutorWithValidationErrors = new CommandActionExecutor({
			commandOutputHandler: mockCommandOutputHandler,
			commandOptionsValidator: new CommandOptionsValidatorWithErrors(),
			cliConfigurationService: new CliConfigurationService(),
			commandInstanceFactory: new CommandInstanceFactory(),
			accountDetailsService: new AccountDetailsService(),
			commandsMetadataService: new CommandsMetadataService(),
		});

		await commandExecutorWithValidationErrors.executeAction({
			executionPath: 'C:/',
			commandName: 'importobjects',
			runInInteractiveMode: true,
			arguments: {},
		});
		expect(mockCommandOutputHandler.showErrorResult).toBeCalledTimes(1);
		expect(mockCommandOutputHandler.showSuccessResult).toBeCalledTimes(0);
	});

	it('Should throw EXCEPTION when setup is required and there is not any account configured.', async () => {
		
		const CommandsMetadataServiceSetupRequired = jest.fn(() => ({
			getCommandMetadataByName: jest.fn(() => {
				return { isSetupRequired: true, supportsInteractiveMode: true };
			}),
		}));

		const commandExecutorWithoutAccountConf = new CommandActionExecutor({
			commandOutputHandler: mockCommandOutputHandler,
			commandOptionsValidator: new CommandOptionsValidatorWithErrors(),
			cliConfigurationService: new CliConfigurationService(),
			commandInstanceFactory: new CommandInstanceFactory(),
			accountDetailsService: new AccountDetailsService(),
			commandsMetadataService: new CommandsMetadataServiceSetupRequired(),
		});

		await commandExecutorWithoutAccountConf.executeAction({
			executionPath: 'C:/',
			commandName: 'importobjects',
			runInInteractiveMode: true,
			arguments: {},
		});
		expect(mockCommandOutputHandler.showErrorResult).toBeCalledTimes(1);
		expect(mockCommandOutputHandler.showSuccessResult).toBeCalledTimes(0);
	});

	it('Should throw EXCEPTION when running as interactive and current command does not support it.', async () => {
		
		const CommandsMetadataServiceNotSupportInteractiveMode = jest.fn(() => ({
			getCommandMetadataByName: jest.fn(() => {
				return { isSetupRequired: false, supportsInteractiveMode: false };
			}),
		}));

		const commandExecutorWithoutAccountConf = new CommandActionExecutor({
			commandOutputHandler: mockCommandOutputHandler,
			commandOptionsValidator: new CommandOptionsValidatorWithErrors(),
			cliConfigurationService: new CliConfigurationService(),
			commandInstanceFactory: new CommandInstanceFactory(),
			accountDetailsService: new AccountDetailsService(),
			commandsMetadataService: new CommandsMetadataServiceNotSupportInteractiveMode(),
		});

		await commandExecutorWithoutAccountConf.executeAction({
			executionPath: 'C:/',
			commandName: 'importobjects',
			runInInteractiveMode: true,
			arguments: {},
		});
		expect(mockCommandOutputHandler.showErrorResult).toBeCalledTimes(1);
		expect(mockCommandOutputHandler.showSuccessResult).toBeCalledTimes(0);
	});
});
