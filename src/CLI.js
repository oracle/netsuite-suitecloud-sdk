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
const unwrapExceptionMessage = require('./utils/ExceptionUtils').unwrapExceptionMessage;
const INTERACTIVE_ALIAS = '-i';
const INTERACTIVE_OPTION = '--interactive';

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
			const rootCLIPath = this._getCLIRootPath();
			this._commandsMetadataService.initializeCommandsMetadata(rootCLIPath);
			const runInInteractiveMode = this._isRunningInInteractiveMode();

			const commandMetadataList = this._commandsMetadataService.getCommandsMetadata();
			this._initializeCommands(commandMetadataList, runInInteractiveMode);

			program
				.version('0.0.1', '-v, --version')
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
		NodeUtils.println(TranslationService.getMessage(TITLE), NodeUtils.COLORS.RESULT);
		program.help();
	}
};
