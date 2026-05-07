/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const assert = require('assert');
const NodeTranslationService = require('./../services/NodeTranslationService');
const { ERRORS, CLI, COMMAND_REFRESH_AUTHORIZATION } = require('../services/TranslationKeys');
const { ActionResult } = require('../services/actionresult/ActionResult');
const { lineBreak } = require('../loggers/LoggerOsConstants');
const ActionResultUtils = require('../utils/ActionResultUtils');
const { unwrapExceptionMessage, unwrapInformationMessage } = require('../utils/ExceptionUtils');
const { getProjectDefaultAuthId } = require('../utils/AuthenticationUtils');
const ExecutionEnvironmentContext = require('../ExecutionEnvironmentContext');
const { checkIfReauthorizationIsNeeded, refreshAuthorization } = require('../utils/AuthenticationUtils');
const { AUTHORIZATION_PROPERTIES_KEYS } = require('../ApplicationConstants');

module.exports = class CommandActionExecutor {
	constructor(dependencies) {
		assert(dependencies);
		assert(dependencies.cliConfigurationService);
		assert(dependencies.commandsMetadataService);
		assert(dependencies.log);
		assert(dependencies.sdkPath);

		this._executionPath = dependencies.executionPath;
		this._cliConfigurationService = dependencies.cliConfigurationService;
		this._commandsMetadataService = dependencies.commandsMetadataService;
		this._log = dependencies.log;
		this._sdkPath = dependencies.sdkPath;

		if (!dependencies.executionEnvironmentContext) {
			this._executionEnvironmentContext = new ExecutionEnvironmentContext();
		} else {
			this._executionEnvironmentContext = dependencies.executionEnvironmentContext;
		}
	}

	async executeAction(context) {
		assert(context);
		assert(context.arguments);
		assert(context.commandName);
		assert(typeof context.runInInteractiveMode === 'boolean');

		let commandUserExtension;
		try {
			const commandName = context.commandName;
			const commandMetadata = this._commandsMetadataService.getCommandMetadataByName(commandName);
			this._cliConfigurationService.initialize(this._executionPath);
			const projectFolder = this._cliConfigurationService.getProjectFolder(commandName);
			commandUserExtension = this._cliConfigurationService.getCommandUserExtension(commandName);
			const runInInteractiveMode = context.runInInteractiveMode;
			const defaultAuthId = commandMetadata.isSetupRequired ? getProjectDefaultAuthId(this._executionPath) : null;

			this._checkCanExecuteCommand({ runInInteractiveMode, commandMetadata, defaultAuthId });

			const commandArguments = this._extractOptionValuesFromArguments(commandMetadata.options, context.arguments);
			
			// run beforeExecute(args) from suitecloud.config.js
			const beforeExecutingOutput = await commandUserExtension.beforeExecuting({
				commandName: commandName,
				projectFolder: this._executionPath,
				arguments: commandMetadata.isSetupRequired ? this._applyDefaultContextParams(commandArguments, defaultAuthId) : commandArguments,
			});
			const overriddenArguments = beforeExecutingOutput.arguments;
			
			if (commandMetadata.isSetupRequired && !context.arguments[AUTHORIZATION_PROPERTIES_KEYS.SKIP_AUHTORIZATION_CHECK]) {
				// check if reauthz is needed to show proper message before continuing with the execution
				// check after the beforeExecute() has been performed because for instance some unit-test failed and we won't continue the execution
				await this._refreshAuthorizationIfNeeded(defaultAuthId);
			}

			// command creation
			// src/commands/{noun}/{verb}/{verb}{noun}Command.js => specific implementation creation for a given command
			const command = this._getCommand(runInInteractiveMode, projectFolder, commandMetadata);

			// command execution
			// src/commands/Command.js, run(inputParams) => execution flow for all commands
			const actionResult = await command.run(overriddenArguments)

			if (context.runInInteractiveMode) {
				// generate non-interactive equivalent
				const notInteractiveCommand = ActionResultUtils.extractNotInteractiveCommand(commandName, commandMetadata, actionResult);
				this._log.info(NodeTranslationService.getMessage(CLI.SHOW_NOT_INTERACTIVE_COMMAND_MESSAGE, notInteractiveCommand));
			}

			if (actionResult.isSuccess() && commandUserExtension.onCompleted) {
				// run onCompleted(output) from suitecloud.config.js
				commandUserExtension.onCompleted(actionResult);
			} else if (!actionResult.isSuccess() && commandUserExtension.onError) {
				// run onError(error) from suitecloud.config.js
				commandUserExtension.onError(ActionResultUtils.getErrorMessagesString(actionResult));
			}
			return actionResult;

		} catch (error) {
			let errorMessage = this._logGenericError(error);
			if (commandUserExtension && commandUserExtension.onError) {
				// run onError(error) from suitecloud.config.js
				commandUserExtension.onError(error);
			}
			return ActionResult.Builder.withErrors(Array.isArray(errorMessage) ? errorMessage : [errorMessage]).build();
		}
	}

	async _refreshAuthorizationIfNeeded(defaultAuthId) {
		const inspectAuthzOperationResult = await checkIfReauthorizationIsNeeded(defaultAuthId, this._sdkPath, this._executionEnvironmentContext);

		if (!inspectAuthzOperationResult.isSuccess()) {
			throw inspectAuthzOperationResult.errorMessages;
		}
		const inspectAuthzData = inspectAuthzOperationResult.data;
		if (inspectAuthzData[AUTHORIZATION_PROPERTIES_KEYS.NEEDS_REAUTHORIZATION]) {
			await this._log.info(NodeTranslationService.getMessage(COMMAND_REFRESH_AUTHORIZATION.MESSAGES.CREDENTIALS_NEED_TO_BE_REFRESHED, defaultAuthId));
			const refreshAuthzOperationResult = await refreshAuthorization(defaultAuthId, this._sdkPath, this._executionEnvironmentContext);

			if (!refreshAuthzOperationResult.isSuccess()) {
				throw refreshAuthzOperationResult.errorMessages;
			}
			await this._log.info(NodeTranslationService.getMessage(COMMAND_REFRESH_AUTHORIZATION.MESSAGES.AUTHORIZATION_REFRESH_COMPLETED));
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

	_checkCanExecuteCommand({ commandMetadata, defaultAuthId, runInInteractiveMode}) {
		if (commandMetadata.isSetupRequired && !defaultAuthId) {
			throw NodeTranslationService.getMessage(ERRORS.SETUP_REQUIRED);
		}
		if (runInInteractiveMode && !commandMetadata.supportsInteractiveMode) {
			throw NodeTranslationService.getMessage(ERRORS.COMMAND_DOES_NOT_SUPPORT_INTERACTIVE_MODE, commandMetadata.name);
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
		const commandPath = commandMetadata.generator;
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
			executionEnvironmentContext: this._executionEnvironmentContext,
		});
	}

	_applyDefaultContextParams(args, defaultAuthId) {
		args.authid = defaultAuthId;
		return args;
	}
};
