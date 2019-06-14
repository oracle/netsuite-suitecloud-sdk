const assert = require('assert');
const Context = require('../Context');
const inquirer = require('inquirer');
const TranslationService = require('./../services/TranslationService');
const { ERRORS } = require('./../services/TranslationKeys');

module.exports = class CommandActionExecutor {
	constructor(dependencies) {
		assert(dependencies);
		assert(dependencies.commandOptionsValidator);
		assert(dependencies.cliConfigurationService);
		assert(dependencies.commandInstanceFactory);
		assert(dependencies.commandsMetadataService);
		assert(dependencies.commandOutputHandler);

		this._commandOptionsValidator = dependencies.commandOptionsValidator;
		this._cliConfigurationService = dependencies.cliConfigurationService;
		this._commandInstanceFactory = dependencies.commandInstanceFactory;
		this._commandsMetadataService = dependencies.commandsMetadataService;
		this._commandOutputHandler = dependencies.commandOutputHandler;
	}

	async executeAction(context) {
		assert(context);
		assert(context.arguments);
		assert(context.commandName);
		assert(context.executionPath);
		assert(typeof context.runInInteractiveMode === 'boolean');
		try {
			const commandMetadata = this._commandsMetadataService.getCommandMetadataByName(
				context.commandName
			);
			const commandName = context.commandName;
			const runInInteractiveMode = context.runInInteractiveMode;
			const args = context.arguments;

			this._checkCanExecute({ runInInteractiveMode, commandMetadata });
			this._cliConfigurationService.initialize(context.executionPath);
			const projectFolder = this._cliConfigurationService.getProjectFolder(commandName);
			const commandUserExtension = this._cliConfigurationService.getCommandUserExtension(
				commandName
			);

			const command = this._commandInstanceFactory.create({
				runInInteractiveMode: runInInteractiveMode,
				commandMetadata: commandMetadata,
				projectFolder: projectFolder,
				executionPath: context.executionPath,
			});

			const commandArguments = this._extractOptionValuesFromArguments(
				command.commandMetadata.options,
				args
			);

			const actionResult = await this._executeCommandAction({
				command: command,
				arguments: commandArguments,
				runInInteractiveMode: context.runInInteractiveMode,
				isSetupRequired: commandMetadata.isSetupRequired,
				commandUserExtension: commandUserExtension,
			});

			this._commandOutputHandler.showSuccessResult(actionResult, command.formatOutputFunc);
			return actionResult;
		} catch (error) {
			this._commandOutputHandler.showErrorResult(error);
		}
	}

	_checkCanExecute(context) {
		if (
			context.commandMetadata.isSetupRequired &&
			!Context.CurrentAccountDetails.isAccountSetup()
		) {
			throw TranslationService.getMessage(ERRORS.SETUP_REQUIRED);
		}
		if (context.runInInteractiveMode && !context.commandMetadata.supportsInteractiveMode) {
			throw TranslationService.getMessage(
				ERRORS.COMMAND_DOES_NOT_SUPPORT_INTERACTIVE_MODE,
				context.commandMetadata.name
			);
		}
	}

	_extractOptionValuesFromArguments(options, args) {
		const optionValues = {};
		for (const optionId in options) {
			if (options.hasOwnProperty(optionId) && args.hasOwnProperty(optionId)) {
				optionValues[optionId] = args[optionId];
			}
		}

		return optionValues;
	}

	async _executeCommandAction(options) {
		const command = options.command;
		const isSetupRequired = options.isSetupRequired;
		const runInInteractiveMode = options.runInInteractiveMode;
		const commandUserExtension = options.commandUserExtension;
		const commandArguments = options.arguments;

		try {
			const beforeExecutingOutput = await commandUserExtension.beforeExecuting({
				command: this,
				arguments: commandArguments,
			});
			const overridedCommandArguments = beforeExecutingOutput.arguments;

			const commandArgumentsAfterQuestions =
				runInInteractiveMode || command._commandMetadata.forceInteractiveMode
					? await command.getCommandQuestions(inquirer.prompt)
					: overridedCommandArguments;

			const argsProcessingFunctions = [];
			if (isSetupRequired) {
				argsProcessingFunctions.push(this._applyDefaultContextParams);
			}
			if (command.preActionFunc) {
				argsProcessingFunctions.push(command.preActionFunc.bind(command));
			}
			const processedCommandArguments = argsProcessingFunctions.reduce(
				(previousArgs, func) => {
					return func(previousArgs);
				},
				commandArgumentsAfterQuestions
			);

			const validationErrors = this._commandOptionsValidator.validate({
				commandOptions: command.commandMetadata.options,
				arguments: processedCommandArguments,
			});
			if (validationErrors.length > 0) {
				throw this._commandOptionsValidator.formatErrors(validationErrors);
			}

			const actionResult = await command.actionFunc(processedCommandArguments);

			if (commandUserExtension.onCompleted) {
				commandUserExtension.onCompleted(actionResult);
			}

			return actionResult;
		} catch (error) {
			if (commandUserExtension.onError) {
				commandUserExtension.onError(error);
			}
			throw error;
		}
	}

	_applyDefaultContextParams(args) {
		args.account = Context.CurrentAccountDetails.getAccountId();
		args.role = Context.CurrentAccountDetails.getRoleId();
		args.email = Context.CurrentAccountDetails.getEmail();
		args.url = Context.CurrentAccountDetails.getNetSuiteUrl();
		return args;
	}
};
