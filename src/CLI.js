'use strict';

const program = require('commander');
const NodeUtils = require('./utils/NodeUtils');
const Context = require('./Context');
const ApplicationConstants = require('./ApplicationConstants');
const TranslationService = require('./services/TranslationService');
const TRANSLATION_KEYS = require('./services/TranslationKeys');

module.exports = class CLI {
	constructor(commandsMetadata, runInInteractiveMode) {
		this._initializeCommands(commandsMetadata, runInInteractiveMode);
		this._initializeErrorHandlers();
	}

	_initializeCommands(commandsMetadata, runInInteractiveMode) {
		for (const commandMetadataId in commandsMetadata) {
			var commandMetadata = commandsMetadata[commandMetadataId];

			var commandGeneratorPath = runInInteractiveMode
				? commandMetadata.interactiveGenerator
				: commandMetadata.nonInteractiveGenerator;

			var Generator = require(commandGeneratorPath);
			var generatorInstance = new Generator(
				commandMetadata,
				Context.CLIConfigurationService.getCommandUserExtension(commandMetadata.name)
			);
			const command = generatorInstance.create(runInInteractiveMode);
			command.attachToProgram(program);
		}
	}

	_initializeErrorHandlers() {
		const self = this;
		Context.EventEmitter.on(ApplicationConstants.CLI_EXCEPTION_EVENT, exception => {
			NodeUtils.println(self._unwrapExceptionMessage(exception), NodeUtils.COLORS.RED);
		});
		Context.EventEmitter.on(ApplicationConstants.CLI_FATAL_EXCEPTION_EVENT, exception => {
			NodeUtils.println(self._unwrapExceptionMessage(exception), NodeUtils.COLORS.RED);
			process.exit(1);
		});
		Context.EventEmitter.on('error', exception => {
			NodeUtils.println(self._unwrapExceptionMessage(exception), NodeUtils.COLORS.RED);
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
		NodeUtils.println(
			TranslationService.getMessage(TRANSLATION_KEYS.CLI_TITLE),
			NodeUtils.COLORS.CYAN
		);
		program.help();
	}

	start(process) {
		try {
			const self = this;
			program
				.version('0.0.1', '-v, --version')
				.option('-i, --interactive', 'Run in interactive mode')
				.on('command:*', () => {
					// unknown command handling
					self._printHelp();
				})
				.parse(process.argv);

			if (!program.args.length) {
				self._printHelp();
			}
		} catch (exception) {
			NodeUtils.println(this._unwrapExceptionMessage(exception), NodeUtils.COLORS.RED);
		}
	}
};
