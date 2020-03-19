/*
** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const assert = require('assert');
const inquirer = require('inquirer');
const TranslationService = require('./../services/TranslationService');
const {
	ERRORS,
} = require('../services/TranslationKeys');
const { throwValidationException } = require('../utils/ExceptionUtils');
const ActionResultUtils = require('../utils/ActionResultUtils');
const NodeUtils = require('../utils/NodeUtils');
const ActionResult = require('../commands/actionresult/ActionResult');
const { SUCCESS, ERROR } = require('../commands/actionresult/ActionResult');

module.exports = class CommandActionExecutor {
	constructor(dependencies) {
		assert(dependencies);
		assert(dependencies.executionPath);
		assert(dependencies.commandOptionsValidator);
		assert(dependencies.cliConfigurationService);
		assert(dependencies.commandInstanceFactory);
		assert(dependencies.commandsMetadataService);
		assert(dependencies.commandOutputHandler);
		assert(dependencies.authenticationService);

		this._executionPath = dependencies.executionPath;
		this._commandOptionsValidator = dependencies.commandOptionsValidator;
		this._cliConfigurationService = dependencies.cliConfigurationService;
		this._commandInstanceFactory = dependencies.commandInstanceFactory;
		this._commandsMetadataService = dependencies.commandsMetadataService;
		this._commandOutputHandler = dependencies.commandOutputHandler;
		this._authenticationService = dependencies.authenticationService;
	}

	async executeAction(context) {
		assert(context);
		assert(context.arguments);
		assert(context.commandName);
		assert(typeof context.runInInteractiveMode === 'boolean');

		let commandUserExtension;
		try {
			const commandMetadata = this._commandsMetadataService.getCommandMetadataByName(
				context.commandName
			);
			const commandName = context.commandName;

			this._cliConfigurationService.initialize(this._executionPath);
			const projectFolder = this._cliConfigurationService.getProjectFolder(commandName);
			commandUserExtension = this._cliConfigurationService.getCommandUserExtension(
				commandName
			);

			const runInInteractiveMode = context.runInInteractiveMode;
			const args = context.arguments;

			const projectConfiguration = commandMetadata.isSetupRequired
				? this._authenticationService.getProjectDefaultAuthId()
				: null;
			this._checkCanExecute({ runInInteractiveMode, commandMetadata, projectConfiguration });

			const command = this._commandInstanceFactory.create({
				runInInteractiveMode: runInInteractiveMode,
				commandMetadata: commandMetadata,
				projectFolder: projectFolder,
				executionPath: this._executionPath,
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
				projectConfiguration: projectConfiguration,
			});

			if (!(actionResult instanceof ActionResult)) {
				throw 'INTERNAL ERROR: Command must return an ActionResult object.';
			}

			if (actionResult.status === ERROR) {
				throw actionResult.errorMessages;
			}

			this._commandOutputHandler.showSuccessResult(actionResult, command.formatOutputFunc);

				if (actionResult.status === SUCCESS && commandUserExtension.onCompleted) {
					commandUserExtension.onCompleted(actionResult);
				} else if (actionResult.status === ERROR && commandUserExtension.onError) {
					const error = ActionResultUtils.getResultMessage(actionResult)
						+ NodeUtils.lineBreak
						+ ActionResultUtils.getErrorMessagesString(actionResult);
					commandUserExtension.onError(error);
				}
			return actionResult;
		} catch (error) {
			this._commandOutputHandler.showErrorResult(error);
			if (commandUserExtension && commandUserExtension.onError) {
				commandUserExtension.onError(error);
			}
			if (context.throwExceptionOnError) {
				throw error;
			}
		}
	}

	_checkCanExecute(context) {
		if (context.commandMetadata.isSetupRequired && !context.projectConfiguration) {
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
		const projectConfiguration = options.projectConfiguration;
		const isSetupRequired = options.isSetupRequired;
		const runInInteractiveMode = options.runInInteractiveMode;
		const commandUserExtension = options.commandUserExtension;
		let commandArguments = options.arguments;

		try {
			const beforeExecutingOutput = await commandUserExtension.beforeExecuting({
				command: this,
				arguments: isSetupRequired
					? this._applyDefaultContextParams(commandArguments, projectConfiguration)
					: commandArguments,
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

			this._checkCommandValidationErrors(
				commandArgumentsAfterPreActionFunc,
				command.commandMetadata,
				runInInteractiveMode
			);

			return await command.actionFunc(commandArgumentsAfterPreActionFunc);
		} catch (error) {
			throw error;
		}
	}

	_checkCommandValidationErrors(
		commandArgumentsAfterPreActionFunc,
		commandMetadata,
		runInInteractiveMode
	) {
		const validationErrors = this._commandOptionsValidator.validate({
			commandOptions: commandMetadata.options,
			arguments: commandArgumentsAfterPreActionFunc,
		});

		if (validationErrors.length > 0) {
			throwValidationException(validationErrors, runInInteractiveMode, commandMetadata);
		}
	}

	_applyDefaultContextParams(args, projectConfiguration) {
		args.authId = projectConfiguration.defaultAuthId;
		return args;
	}
};
