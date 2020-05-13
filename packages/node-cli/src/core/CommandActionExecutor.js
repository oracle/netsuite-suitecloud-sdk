/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const assert = require('assert');
const NodeTranslationService = require('./../services/NodeTranslationService');
const { ERRORS } = require('../services/TranslationKeys');
const { throwValidationException } = require('../utils/ExceptionUtils');
const { ActionResult } = require('../services/actionresult/ActionResult');
const { lineBreak } = require('../loggers/LoggerConstants');
const ActionResultUtils = require('../utils/ActionResultUtils');
const { unwrapExceptionMessage, unwrapInformationMessage } = require('../utils/ExceptionUtils');

module.exports = class CommandActionExecutor {
	constructor(dependencies) {
		assert(dependencies);
		assert(dependencies.executionPath);
		assert(dependencies.cliConfigurationService);
		assert(dependencies.commandsMetadataService);
		assert(dependencies.authenticationService);
		assert(dependencies.log);
		assert(dependencies.sdkPath);

		this._executionPath = dependencies.executionPath;
		this._cliConfigurationService = dependencies.cliConfigurationService;
		this._commandsMetadataService = dependencies.commandsMetadataService;
		this._authenticationService = dependencies.authenticationService;
		this._log = dependencies.log;
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

			const projectConfiguration = commandMetadata.isSetupRequired ? this._authenticationService.getProjectDefaultAuthId() : null;
			this._checkCanExecute({ runInInteractiveMode, commandMetadata, projectConfiguration });

			const command = this._getCommand(runInInteractiveMode, projectFolder, commandMetadata);
			const commandArguments = this._extractOptionValuesFromArguments(commandMetadata.options, args);

			const actionResult = await this._executeCommandAction({
				command: command,
				arguments: commandArguments,
				runInInteractiveMode: context.runInInteractiveMode,
				isSetupRequired: commandMetadata.isSetupRequired,
				commandUserExtension: commandUserExtension,
				projectConfiguration: projectConfiguration,
			});

			if (actionResult.status === ActionResult.STATUS.SUCCESS && commandUserExtension.onCompleted) {
				commandUserExtension.onCompleted(actionResult);
			}
			else if (actionResult.status === ActionResult.STATUS.ERROR && commandUserExtension.onError) {
				commandUserExtension.onError(ActionResultUtils.getErrorMessagesString(actionResult));
			}
			return actionResult;

		} catch (error) {
			let errorMessage = this._logGenericError(error);
			if (commandUserExtension && commandUserExtension.onError) {
				commandUserExtension.onError(error);
			}
			return ActionResult.Builder.withErrors(errorMessage);
		}
	}

	_logGenericError(error) {
		let errorMessage = unwrapExceptionMessage(error);
		this._log.error(errorMessage);
		const informativeMessage = unwrapInformationMessage(error);

		if (informativeMessage) {
			this._log.info(`${lineBreak}${informativeMessage}`);
			errorMessage += lineBreak + informativeMessage;
		}
		return errorMessage;
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

	_getCommand(runInInteractiveMode, projectFolder, commandMetadata) {

		const commandPath = runInInteractiveMode ? commandMetadata.interactiveGenerator : commandMetadata.nonInteractiveGenerator;
		const commandGenerator = require(commandPath);
		if (!commandGenerator) {
			throw `Path ${commandPath} doesn't contain any command`;
		}
		return commandGenerator.create({
			commandMetadata: commandMetadata,
			projectFolder: projectFolder,
			executionPath: this._executionPath,
			runInInteractiveMode: runInInteractiveMode,
			log: this._log,
			sdkPath: this._sdkPath,
		});
	}

	async _executeCommandAction(options) {
		const command = options.command;
		const projectConfiguration = options.projectConfiguration;
		const isSetupRequired = options.isSetupRequired;
		//const runInInteractiveMode = options.runInInteractiveMode;
		const commandUserExtension = options.commandUserExtension;
		let commandArguments = options.arguments;

		try {
			const beforeExecutingOutput = await commandUserExtension.beforeExecuting({
				command: this,
				arguments: isSetupRequired ? this._applyDefaultContextParams(commandArguments, projectConfiguration) : commandArguments,
			});
			const overriddenArguments = beforeExecutingOutput.arguments;

			//const argumentsFromQuestions =
			//	runInInteractiveMode || command._commandMetadata.forceInteractiveMode
			//		? await command.getCommandQuestions(inquirer.prompt, commandArguments)
			//		: {};

			//const commandArgumentsWithQuestionArguments = {
			//	...overriddenArguments,
			//	...argumentsFromQuestions,
			//};
			//let commandArgumentsAfterPreActionFunc = command.preActionFunc
			//	? command.preActionFunc(commandArgumentsWithQuestionArguments)
			//	: commandArgumentsWithQuestionArguments;

			//this._checkCommandValidationErrors(commandArgumentsAfterPreActionFunc, command.commandMetadata, runInInteractiveMode);

			return command.run(overriddenArguments);
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
		args.authId = projectConfiguration.defaultAuthId;
		return args;
	}
};
