/*
 ** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const assert = require('assert');
var path = require('path');
const program = require('commander');
const NodeUtils = require('./utils/NodeUtils');
const TranslationService = require('./services/TranslationService');
const {
	CLI: { INTERACTIVE_OPTION_DESCRIPTION, TITLE, USAGE },
	ERRORS,
} = require('./services/TranslationKeys');
const { SDK_REQUIRED_JAVA_VERSION } = require('./ApplicationConstants');
const spawn = require('child_process').spawnSync;
const unwrapExceptionMessage = require('./utils/ExceptionUtils').unwrapExceptionMessage;
const INTERACTIVE_ALIAS = '-i';
const INTERACTIVE_OPTION = '--interactive';

const CLI_VERSION = '19.2.1';

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
			if (!this._isInstalledJavaVersionSupported()) {
				throw new Error(
					TranslationService.getMessage(
						ERRORS.CLI_SDK_JAVA_VERSION_NOT_COMPATIBLE,
						SDK_REQUIRED_JAVA_VERSION
					)
				);
			}
			const rootCLIPath = this._getCLIRootPath();
			this._commandsMetadataService.initializeCommandsMetadata(rootCLIPath);
			const runInInteractiveMode = this._isRunningInInteractiveMode();

			const commandMetadataList = this._commandsMetadataService.getCommandsMetadata();
			this._initializeCommands(commandMetadataList, runInInteractiveMode);

			program
				.version(CLI_VERSION, '--version')
				.option(
					`${INTERACTIVE_ALIAS}, ${INTERACTIVE_OPTION}`,
					TranslationService.getMessage(INTERACTIVE_OPTION_DESCRIPTION)
				)
				.on('command:*', args => {
					NodeUtils.println(
						TranslationService.getMessage(ERRORS.COMMAND_DOES_NOT_EXIST, args[0]),
						NodeUtils.COLORS.ERROR
					);
				})
				.usage(TranslationService.getMessage(USAGE))
				.parse(process.argv);

			if (!program.args.length) {
				this._printHelp();
			}
		} catch (exception) {
			NodeUtils.println(unwrapExceptionMessage(exception), NodeUtils.COLORS.ERROR);
		}
	}

	_isInstalledJavaVersionSupported() {
		const installedJavaVersion = this._getInstalledJavaVersion();
		return installedJavaVersion.startsWith(`"${SDK_REQUIRED_JAVA_VERSION}`);
	}

	_getInstalledJavaVersion() {
		const cmd = 'java -fullversion';
		const childProcess = spawn(cmd, [], { shell: true });
		const fullVersionOutput = childProcess.stderr.toString();
		const segments = fullVersionOutput.split(' ');
		return segments[3]; //The actual version is in the 4th segment of the output (i.e. java full version "11.1.0_201-b09")
	}

	_getCLIRootPath() {
		return path.dirname(require.main.filename);
	}

	_initializeCommands(commandMetadataList, runInInteractiveMode) {
		const commandsMetadataArraySortedByCommandName = Object.values(commandMetadataList).sort(
			(command1, command2) => command1.name.localeCompare(command2.name)
		);

		commandsMetadataArraySortedByCommandName.forEach(commandMetadata => {
			this._commandRegistrationService.register({
				commandMetadata: commandMetadata,
				program: program,
				runInInteractiveMode: runInInteractiveMode,
				executeCommandFunction: async options => {
					await this._commandActionExecutor.executeAction({
						executionPath: process.cwd(),
						commandName: commandMetadata.name,
						runInInteractiveMode: runInInteractiveMode,
						arguments: options,
					});
				},
			});
		});
	}

	_isRunningInInteractiveMode() {
		return process.argv[3] == INTERACTIVE_ALIAS || process.argv[3] === INTERACTIVE_OPTION;
	}

	_printHelp() {
		NodeUtils.println(TranslationService.getMessage(TITLE, CLI_VERSION), NodeUtils.COLORS.INFO);
		program.help();
	}
};
