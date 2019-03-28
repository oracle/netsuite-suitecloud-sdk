'use strict';

const program = require('commander');
const NodeUtils = require('./utils/NodeUtils');
const Context = require('./Context');
const CLIConfigurationService = require('./services/CLIConfigurationService');
const {
	CLI_EXCEPTION_EVENT,
	CLI_FATAL_EXCEPTION_EVENT,
	CLI_DEFAULT_ERROR_EVENT,
} = require('./ApplicationConstants');
const TranslationService = require('./services/TranslationService');
const { INTERACTIVE_OPTION_DESCRIPTION, CLI_TITLE } = require('./services/TranslationKeys');

module.exports = class CLI {
	constructor(commandsMetadata, runInInteractiveMode) {
		this._cliConfigurationService = new CLIConfigurationService(process.cwd());
		this._commandsMetadata = commandsMetadata;
		this._runInInteractiveMode = runInInteractiveMode;
	}

	start(process) {
		try {
			this._initializeConfigurationService();
			this._initializeCommands();
			this._initializeErrorHandlers();

			program
				.version('0.0.1', '-v, --version')
				.option(
					'-i, --interactive',
					TranslationService.getMessage(INTERACTIVE_OPTION_DESCRIPTION)
				)
				.on('command:*', () => {
					this._printHelp();
				})
				.parse(process.argv);

			if (!program.args.length) {
				this._printHelp();
			}
		} catch (exception) {
			NodeUtils.println(this._unwrapExceptionMessage(exception), NodeUtils.COLORS.ERROR);
		}
	}

	_initializeConfigurationService() {
		this._cliConfigurationService.initialize();
	}

	_initializeCommands() {
		var commandsMetadataArraySortedByCommandName = Object.values(this._commandsMetadata).sort(
			(command1, command2) => command1.name.localeCompare(command2.name)
		);

		commandsMetadataArraySortedByCommandName.forEach(commandMetadata => {
			var command = this._createCommandFrom(commandMetadata);
			command.attachToProgram(program);
		});
	}

	_createCommandFrom(commandMetadata) {
		var commandGeneratorPath = this._runInInteractiveMode
			? commandMetadata.interactiveGenerator
			: commandMetadata.nonInteractiveGenerator;

		var commandUserExtension = this._cliConfigurationService.getCommandUserExtension(
			commandMetadata.name
		);
		var projectFolder = this._cliConfigurationService.getProjectFolder(commandMetadata.name);

		var Generator = require(commandGeneratorPath);
		var generatorInstance = new Generator({
			commandMetadata: commandMetadata,
			commandUserExtension: commandUserExtension,
			projectFolder: projectFolder,
		});
		var command = generatorInstance.create(this._runInInteractiveMode);
		return command;
	}

	_initializeErrorHandlers() {
		const self = this;
		Context.EventEmitter.on(CLI_EXCEPTION_EVENT, exception => {
			NodeUtils.println(self._unwrapExceptionMessage(exception), NodeUtils.COLORS.ERROR);
		});
		Context.EventEmitter.on(CLI_FATAL_EXCEPTION_EVENT, exception => {
			NodeUtils.println(self._unwrapExceptionMessage(exception), NodeUtils.COLORS.ERROR);
			process.exit(1);
		});
		Context.EventEmitter.on(CLI_DEFAULT_ERROR_EVENT, exception => {
			NodeUtils.println(self._unwrapExceptionMessage(exception), NodeUtils.COLORS.ERROR);
		});
	}

	_unwrapExceptionMessage(exception) {
		if (exception.getErrorMessage) {
			return exception.getErrorMessage();
		} else {
			return exception;
		}
	}

	_printHelp() {
		NodeUtils.println(TranslationService.getMessage(CLI_TITLE), NodeUtils.COLORS.RESULT);
		program.help();
	}
};
