const assert = require('assert');
const Context = require('../Context');
const inquirer = require('inquirer');
const CommandOptionsValidator = require('./CommandOptionsValidator');
const TranslationService = require('./TranslationService');
const { ERRORS } = require('./TranslationKeys');

module.exports = class CommandActionExecutor {
	constructor(runInInteractiveMode) {
		this._runInInteractiveMode = runInInteractiveMode;
		this._commandOptionsValidator = new CommandOptionsValidator();
	}

	async executeAction(context) {
		assert(context);
		assert(context.command);
		assert(context.arguments);

		const command = context.command;
		const args = context.arguments;

		if (command.isSetupRequired && !Context.CurrentAccountDetails.isAccountSetup()) {
			throw TranslationService.getMessage(ERRORS.SETUP_REQUIRED);
		}
		if (this._runInInteractiveMode && !command.supportsInteractiveMode) {
			throw TranslationService.getMessage(
				ERRORS.COMMAND_DOES_NOT_SUPPORT_INTERACTIVE_MODE,
				command.name
			);
		}

		try {
			const commandArguments = this._extractOptionValuesFromArguments(command.options, args);
			const beforeExecutingOutput = await command.commandUserExtension.beforeExecuting({
				command: this,
				arguments: commandArguments,
			});
			const overridedCommandArguments = beforeExecutingOutput.arguments;

			const completedResult = await this._executeCommandAction({
				command: command,
				arguments: overridedCommandArguments,
			});
			if (command.commandUserExtension.onCompleted) {
				command.commandUserExtension.onCompleted(completedResult);
			}
			return completedResult;
		} catch (error) {
			if (command.commandUserExtension.onError) {
				command.commandUserExtension.onError(error);
			}
			throw error;
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
		const args = options.arguments;

		const commandArguments = (this._runInInteractiveMode || command.forceInteractiveMode)
			? await command.getCommandQuestions(inquirer.prompt)
			: args;

		const argsProcessingFunctions = [];
		if (command.isSetupRequired) {
			argsProcessingFunctions.push(this._applyDefaultContextParams);
		}
		if (command.preActionFunc) {
			argsProcessingFunctions.push(command.preActionFunc.bind(command));
		}
		const processedCommandArguments = argsProcessingFunctions.reduce((previousArgs, func) => {
			return func(previousArgs);
		}, commandArguments);

		const validationErrors = this._commandOptionsValidator.validate({
			commandOptions: command.options,
			arguments: processedCommandArguments,
		});
		if (validationErrors.length > 0) {
			throw this._commandOptionsValidator.formatErrors(validationErrors);
		}

		return await command.actionFunc(processedCommandArguments);
	}

	_applyDefaultContextParams(args) {
		args.account = Context.CurrentAccountDetails.getCompId();
		args.role = Context.CurrentAccountDetails.getRoleId();
		args.email = Context.CurrentAccountDetails.getEmail();
		args.url = Context.CurrentAccountDetails.getNetSuiteUrl();
		return args;
	}
};
