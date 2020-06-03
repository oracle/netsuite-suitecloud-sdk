/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const assert = require('assert');
const inquirer = require('inquirer');
const NodeTranslationService = require('./../services/NodeTranslationService');
const { ERRORS } = require('../services/TranslationKeys');
const { throwValidationException } = require('../utils/ExceptionUtils');
const ActionResultUtils = require('../utils/ActionResultUtils');
const { ActionResult } = require('../commands/actionresult/ActionResult');
const OutputFormatter = require('../commands/outputFormatters/OutputFormatter');
const { getProjectDefaultAuthId } = require('../utils/AuthenticationUtils');

module.exports = class CommandActionExecutor {
	constructor(dependencies) {
		assert(dependencies);
		assert(dependencies.commandOptionsValidator);
		assert(dependencies.cliConfigurationService);
		assert(dependencies.commandInstanceFactory);
		assert(dependencies.commandsMetadataService);
		assert(dependencies.consoleLogger);
		assert(dependencies.sdkPath);

		this._executionPath = dependencies.executionPath ? dependencies.executionPath : process.cwd();
		this._commandOptionsValidator = dependencies.commandOptionsValidator;
		this._cliConfigurationService = dependencies.cliConfigurationService;
		this._commandInstanceFactory = dependencies.commandInstanceFactory;
		this._commandsMetadataService = dependencies.commandsMetadataService;
		this._consoleLogger = dependencies.consoleLogger;
		this._sdkPath = dependencies.sdkPath;
	}

	async executeAction(context) {
		assert(context);
		assert(context.arguments);
		assert(context.commandName);
		assert(typeof context.runInInteractiveMode === 'boolean');

		let commandUserExtension;
		try {
			const commandMetadata = this._commandsMetadataService.getCommandMetadataByName(context.commandName);
			const commandName = context.commandName;

			this._cliConfigurationService.initialize(this._executionPath);
			const projectFolder = this._cliConfigurationService.getProjectFolder(commandName);
			commandUserExtension = this._cliConfigurationService.getCommandUserExtension(commandName);

			const runInInteractiveMode = context.runInInteractiveMode;
			const args = context.arguments;

			const projectConfiguration = commandMetadata.isSetupRequired ? getProjectDefaultAuthId(this._executionPath) : null;
			this._checkCanExecute({ runInInteractiveMode, commandMetadata, projectConfiguration });

			const command = this._commandInstanceFactory.create({
				runInInteractiveMode: runInInteractiveMode,
				commandMetadata: commandMetadata,
				projectFolder: projectFolder,
				executionPath: this._executionPath,
				consoleLogger: this._consoleLogger,
				sdkPath: this._sdkPath,
			});

			const commandArguments = this._extractOptionValuesFromArguments(command.commandMetadata.options, args);

			const actionResult = await this._executeCommandAction({
				command: command,
				arguments: commandArguments,
				runInInteractiveMode: context.runInInteractiveMode,
				isSetupRequired: commandMetadata.isSetupRequired,
				commandUserExtension: commandUserExtension,
				projectConfiguration: projectConfiguration,
			});

			if (!(actionResult instanceof ActionResult)) {
				throw 'INTERNAL ERROR: Command must return an ActionResult object.';
			}

			if (actionResult.status === ActionResult.STATUS.ERROR) {
				const error = ActionResultUtils.getErrorMessagesString(actionResult);
				throw error;
			}

			command.outputFormatter.formatActionResult(actionResult);

			if (commandUserExtension.onCompleted) {
				commandUserExtension.onCompleted(actionResult);
			}

			return actionResult;
		} catch (error) {
			let errorMessage = new OutputFormatter(this._consoleLogger).formatError(error);
			if (commandUserExtension && commandUserExtension.onError) {
				commandUserExtension.onError(error);
			}
			return ActionResult.Builder.withErrors(errorMessage);
		}
	}

	_checkCanExecute(context) {
		if (context.commandMetadata.isSetupRequired && !context.projectConfiguration) {
			throw NodeTranslationService.getMessage(ERRORS.SETUP_REQUIRED);
		}
		if (context.runInInteractiveMode && !context.commandMetadata.supportsInteractiveMode) {
			throw NodeTranslationService.getMessage(ERRORS.COMMAND_DOES_NOT_SUPPORT_INTERACTIVE_MODE, context.commandMetadata.name);
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
		const projectConfiguration = options.projectConfiguration;
		const isSetupRequired = options.isSetupRequired;
		const runInInteractiveMode = options.runInInteractiveMode;
		const commandUserExtension = options.commandUserExtension;
		let commandArguments = options.arguments;

		try {
			const beforeExecutingOutput = await commandUserExtension.beforeExecuting({
				commandName: options.command.commandMetadata.name,
				projectFolder: this._executionPath,
				arguments: isSetupRequired ? this._applyDefaultContextParams(commandArguments, projectConfiguration) : commandArguments,
			});
			const overriddenCommandArguments = beforeExecutingOutput.arguments;

			const argumentsFromQuestions =
				runInInteractiveMode || command._commandMetadata.forceInteractiveMode
					? await command.getCommandQuestions(inquirer.prompt, commandArguments)
					: {};

			const commandArgumentsWithQuestionArguments = {
				...overriddenCommandArguments,
				...argumentsFromQuestions,
			};
			let commandArgumentsAfterPreActionFunc = command.preActionFunc
				? command.preActionFunc(commandArgumentsWithQuestionArguments)
				: commandArgumentsWithQuestionArguments;

			this._checkCommandValidationErrors(commandArgumentsAfterPreActionFunc, command.commandMetadata, runInInteractiveMode);

			return await command.actionFunc(commandArgumentsAfterPreActionFunc);
		} catch (error) {
			throw error;
		}
	}

	_checkCommandValidationErrors(commandArgumentsAfterPreActionFunc, commandMetadata, runInInteractiveMode) {
		const validationErrors = this._commandOptionsValidator.validate({
			commandOptions: commandMetadata.options,
			arguments: commandArgumentsAfterPreActionFunc,
		});

		if (validationErrors.length > 0) {
			throwValidationException(validationErrors, runInInteractiveMode, commandMetadata);
		}
	}

	_applyDefaultContextParams(args, projectConfiguration) {
		args.authid = projectConfiguration.defaultAuthId;
		return args;
	}
};
