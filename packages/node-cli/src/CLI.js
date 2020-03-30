/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const path = require('path');
const assert = require('assert');
const program = require('commander');
const NodeConsoleLogger = require('./utils/NodeConsoleLogger');
const TranslationService = require('./services/TranslationService');
const {
	CLI: { INTERACTIVE_OPTION_DESCRIPTION, TITLE, USAGE },
	ERRORS,
} = require('./services/TranslationKeys');
const unwrapExceptionMessage = require('./utils/ExceptionUtils').unwrapExceptionMessage;
const INTERACTIVE_ALIAS = '-i';
const INTERACTIVE_OPTION = '--interactive';

// suitecloud executable is in {root}/src/suitecloud.js. package.json file is one level before
const PACKAGE_FILE = `${path.dirname(require.main.filename)}/../package.json`;
const configFile = require(PACKAGE_FILE);
const CLI_VERSION = configFile ? configFile.version : 'unknown';
const COMPATIBLE_NS_VERSION = '2020.1';

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
			this._commandsMetadataService.initializeCommandsMetadata();
			const runInInteractiveMode = this._isRunningInInteractiveMode();

			const commandMetadataList = this._commandsMetadataService.getCommandsMetadata();
			this._initializeCommands(commandMetadataList, runInInteractiveMode);

			program
				.version(CLI_VERSION, '--version')
				.option(`${INTERACTIVE_ALIAS}, ${INTERACTIVE_OPTION}`, TranslationService.getMessage(INTERACTIVE_OPTION_DESCRIPTION))
				.on('command:*', args => {
					NodeConsoleLogger.println(TranslationService.getMessage(ERRORS.COMMAND_DOES_NOT_EXIST, args[0]), NodeConsoleLogger.COLORS.ERROR);
				})
				.usage(TranslationService.getMessage(USAGE))
				.parse(process.argv);

			if (!program.args.length) {
				this._printHelp();
			}
		} catch (exception) {
			NodeConsoleLogger.println(unwrapExceptionMessage(exception), NodeConsoleLogger.COLORS.ERROR);
		}
	}

	_initializeCommands(commandMetadataList, runInInteractiveMode) {
		const commandsMetadataArraySortedByCommandName = Object.values(commandMetadataList).sort((command1, command2) =>
			command1.name.localeCompare(command2.name)
		);

		commandsMetadataArraySortedByCommandName.forEach(commandMetadata => {
			this._commandRegistrationService.register({
				commandMetadata: commandMetadata,
				program: program,
				runInInteractiveMode: runInInteractiveMode,
				executeCommandFunction: async options => {
					await this._commandActionExecutor.executeAction({
						commandName: commandMetadata.name,
						runInInteractiveMode: runInInteractiveMode,
						arguments: options,
					});
				},
			});
		});
	}

	_isRunningInInteractiveMode() {
		return process.argv[3] === INTERACTIVE_ALIAS || process.argv[3] === INTERACTIVE_OPTION;
	}

	_printHelp() {
		NodeConsoleLogger.println(TranslationService.getMessage(TITLE, COMPATIBLE_NS_VERSION), NodeConsoleLogger.COLORS.INFO);
		program.help();
	}
};
