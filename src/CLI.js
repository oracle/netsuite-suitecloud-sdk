'use strict';

const program = require('commander');
const NodeUtils = require('./utils/NodeUtils');
const CLIConfigurationService = require('./services/extensibility/CLIConfigurationService');
const TranslationService = require('./services/TranslationService');
const { INTERACTIVE_OPTION_DESCRIPTION, CLI_TITLE, ERRORS } = require('./services/TranslationKeys');
const CommandActionExecutor = require('./services/CommandActionExecutor');
const CommandOutputHandler = require('./CommandOutputHandler');
const unwrapExceptionMessage = require('./utils/ExceptionUtils').unwrapExceptionMessage;

module.exports = class CLI {
	constructor(commandsMetadata, runInInteractiveMode) {
		this._cliConfigurationService = new CLIConfigurationService(process.cwd());
		this._commandsMetadata = commandsMetadata;
		this._runInInteractiveMode = runInInteractiveMode;
		this._commandOutputHandler = new CommandOutputHandler();
		this._commandActionExecutor = new CommandActionExecutor(runInInteractiveMode);
	}

	start(process) {
		try {
			this._initializeConfigurationService();
			this._initializeCommands();

			program
				.version('0.0.1', '-v, --version')
				.option(
					'-i, --interactive',
					TranslationService.getMessage(INTERACTIVE_OPTION_DESCRIPTION)
				)
				.on('command:*', args => {
					NodeUtils.println(
						TranslationService.getMessage(ERRORS.COMMAND_DOES_NOT_EXIST, args[0]),
						NodeUtils.COLORS.ERROR
					);
				})
				.parse(process.argv);

			if (!program.args.length) {
				this._printHelp();
			}
		} catch (exception) {
			NodeUtils.println(unwrapExceptionMessage(exception), NodeUtils.COLORS.ERROR);
		}
	}

	_initializeConfigurationService() {
		this._cliConfigurationService.initialize();
	}

	_initializeCommands() {
		const commandsMetadataArraySortedByCommandName = Object.values(this._commandsMetadata).sort(
			(command1, command2) => command1.name.localeCompare(command2.name)
		);

		commandsMetadataArraySortedByCommandName.forEach(commandMetadata => {
			const command = this._createCommandFrom(commandMetadata);
			command.attachToProgram({
				program,
				runInInteractiveMode: this._runInInteractiveMode,
				commandOutputHandler: this._commandOutputHandler,
				commandActionExecutor: this._commandActionExecutor,
			});
		});
	}

	_createCommandFrom(commandMetadata) {
		const commandGeneratorPath = this._runInInteractiveMode
			? commandMetadata.interactiveGenerator
			: commandMetadata.nonInteractiveGenerator;

		const commandUserExtension = this._cliConfigurationService.getCommandUserExtension(
			commandMetadata.name
		);
		const projectFolder = this._cliConfigurationService.getProjectFolder(commandMetadata.name);

		const Generator = require(commandGeneratorPath);
		const generatorInstance = new Generator({
			commandMetadata,
			commandUserExtension,
			projectFolder,
        });
        
		return generatorInstance.create();
	}

	_printHelp() {
		NodeUtils.println(TranslationService.getMessage(CLI_TITLE), NodeUtils.COLORS.RESULT);
		program.help();
	}
};
