/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const path = require('path');
const assert = require('assert');
const program = require('commander');
const NodeConsoleLogger = require('./loggers/NodeConsoleLogger');
const NodeTranslationService = require('./services/NodeTranslationService');
const {
	CLI: { INTERACTIVE_OPTION_DESCRIPTION, TITLE, USAGE, VERSION_HELP },
	COMMAND_OPTIONS,
	ERRORS,
} = require('./services/TranslationKeys');
const unwrapExceptionMessage = require('./utils/ExceptionUtils').unwrapExceptionMessage;
const INTERACTIVE_ALIAS = '-i';
const INTERACTIVE_OPTION = '--interactive';

// suitecloud executable is in {root}/src/suitecloud.js. package.json file is one level before
const PACKAGE_FILE = `${path.dirname(require.main.filename)}/../package.json`;
const configFile = require(PACKAGE_FILE);
const CLI_VERSION = configFile ? configFile.version : 'unknown';
const { nsCompatibleVersion } = require(PACKAGE_FILE);
const COMMAND_ALIAS = '[command]';
const HELP_COMMAND = 'help';
const HELP_OPTION = '--help';
const HELP_ALIAS = '-h';
const VERSION_OPTION = '--version';

module.exports = class CLI {
	constructor(dependencies) {
		assert(dependencies);
		assert(dependencies.commandsMetadataService);
		assert(dependencies.commandActionExecutor);
		assert(dependencies.commandRegistrationService);

		this._commandsMetadataService = dependencies.commandsMetadataService;
		this._commandActionExecutor = dependencies.commandActionExecutor;
		this._commandRegistrationService = dependencies.commandRegistrationService;
	}

	start(process) {
		try {
			const commandMetadataList = this._commandsMetadataService.getCommandsMetadata();

			const thirdArgument = process.argv[2];
			if (
				thirdArgument &&
				thirdArgument !== HELP_ALIAS &&
				thirdArgument !== HELP_OPTION &&
				thirdArgument !== HELP_COMMAND &&
				thirdArgument !== VERSION_OPTION
			) {
				this._validateCommandExists(commandMetadataList, thirdArgument);
			} else if (thirdArgument == HELP_COMMAND && process.argv[3]) {
				this._validateCommandExists(commandMetadataList, process.argv[3]);
			}

			if (process.argv.length > 3 && (process.argv.includes(HELP_ALIAS) || process.argv.includes(HELP_OPTION))) {
				process.argv = this._leaveOnlyHelpArguments();
			}

			const runInInteractiveMode = this._isRunningInInteractiveMode();
			this._initializeCommands(commandMetadataList, runInInteractiveMode);

			// If there are no arguments, we print SuiteCloud version header
			if (!process.argv || process.argv.length <= 2) {
				NodeConsoleLogger.info(NodeTranslationService.getMessage(TITLE, nsCompatibleVersion));
			}

			program
				.version(CLI_VERSION, VERSION_OPTION, NodeTranslationService.getMessage(VERSION_HELP))
				.option(
					`${INTERACTIVE_ALIAS}, ${INTERACTIVE_OPTION}`,
					NodeTranslationService.getMessage(INTERACTIVE_OPTION_DESCRIPTION),
					this._validateInteractive
				)
				.helpOption(`${HELP_ALIAS}, ${HELP_OPTION}`, NodeTranslationService.getMessage(COMMAND_OPTIONS.HELP))
				.addHelpCommand(`${HELP_COMMAND} ${COMMAND_ALIAS}`, NodeTranslationService.getMessage(COMMAND_OPTIONS.HELP))
				.on('command:*', (args) => {
					NodeConsoleLogger.error(NodeTranslationService.getMessage(ERRORS.COMMAND_DOES_NOT_EXIST, args[0]));
				})
				.usage(NodeTranslationService.getMessage(USAGE))
				.parse(process.argv);
		} catch (exception) {
			NodeConsoleLogger.error(unwrapExceptionMessage(exception));
		}
	}

	_validateCommandExists(commandMetadataList, possibleCommand) {
		if (!commandMetadataList.hasOwnProperty(possibleCommand)) {
			throw NodeTranslationService.getMessage(ERRORS.COMMAND_DOES_NOT_EXIST, possibleCommand);
		}
	}

	_leaveOnlyHelpArguments() {
		return process.argv.slice(0, 3).concat(HELP_ALIAS); //We only leave commandName and help argument
	}

	_isRunningInInteractiveMode() {
		return process.argv.includes(INTERACTIVE_ALIAS) || process.argv.includes(INTERACTIVE_OPTION);
	}

	_validateInteractive() {
		if (process.argv.length > 4) {
			// There are more options apart from -i or --interactive
			throw NodeTranslationService.getMessage(ERRORS.INTERACTIVE_MODE_MORE_OPTIONS);
		}
	}

	_initializeCommands(commandMetadataList, runInInteractiveMode) {
		const commandsMetadataArraySortedByCommandName = Object.values(commandMetadataList).sort((command1, command2) =>
			command1.name.localeCompare(command2.name)
		);

		commandsMetadataArraySortedByCommandName.forEach((commandMetadata) => {
			this._commandRegistrationService.register({
				commandMetadata: commandMetadata,
				program: program,
				runInInteractiveMode: runInInteractiveMode,
				executeCommandFunction: async (options) => {
					return this._commandActionExecutor.executeAction({
						commandName: commandMetadata.name,
						runInInteractiveMode: runInInteractiveMode,
						arguments: options,
					});
				},
			});
		});
	}
};
