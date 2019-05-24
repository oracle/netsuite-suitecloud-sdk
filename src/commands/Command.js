'use strict';

const TranslationService = require('../services/TranslationService');
const { COMMAND_OPTION_INTERACTIVE_HELP } = require('../services/TranslationKeys');
const assert = require('assert');
const OPTION_TYPE_FLAG = 'FLAG';
const INTERACTIVE_OPTION_NAME = 'interactive';
const INTERACTIVE_OPTION_ALIAS = 'i';

module.exports = class Command {
	constructor(options) {
		assert(options);
		assert(options.name);
		assert(options.description);
		assert(options.options);
		assert(options.getCommandQuestionsFunc instanceof Function);
		assert(options.preActionFunc instanceof Function);
		assert(options.actionFunc instanceof Function);
		assert(options.commandUserExtension);
		assert(options.commandOutputFormater);

		this._name = options.name;
		this._alias = options.alias;
		this._description = options.description;
		this._projectFolder = options.projectFolder;
		this._getCommandQuestions = options.getCommandQuestionsFunc;
		this._preActionFunc = options.preActionFunc;
		this._action = options.actionFunc;
		this._isSetupRequired =
			typeof options.isSetupRequired === 'undefined' ? true : options.isSetupRequired;
		this._options = options.options;
		this._commandUserExtension = options.commandUserExtension;
		this._supportsInteractiveMode = options.supportsInteractiveMode;
		this._commandOutputFormatter = options.commandOutputFormater;
	}

	attachToProgram(options) {
		assert(options);
		assert(options.program);
		assert(options.commandOutputHandler);
		assert(options.commandActionExecutor);

		const program = options.program;
		const commandOutputHandler = options.commandOutputHandler;
		const commandActionExecutor = options.commandActionExecutor;
		const runInInteractiveMode = options.runInInteractiveMode;

		let commandSetup = program.command(`${this._name} folder>`);
		//program.alias(this._alias)

		if (!runInInteractiveMode) {
			if (this._supportsInteractiveMode) {
				const interactiveOptionHelp = TranslationService.getMessage(
					COMMAND_OPTION_INTERACTIVE_HELP,
					this._name
				);
				this._options.interactive = {
					name: INTERACTIVE_OPTION_NAME,
					alias: INTERACTIVE_OPTION_ALIAS,
					description: interactiveOptionHelp,
					type: OPTION_TYPE_FLAG,
					mandatory: false,
				};
			}
			commandSetup = this._addNonInteractiveCommandOptions(commandSetup, this._options);
		}

		commandSetup.description(this._description).action(options => {
			commandOutputHandler.handle(
				commandActionExecutor.executeAction({
					command: this,
					arguments: options,
				}),
				this._commandOutputFormatter
			);
		});
	}

	get name() {
		return this._name;
	}

	get projectFolder() {
		return this._projectFolder;
	}

	get options() {
		return this._options;
	}

	get commandUserExtension() {
		return this._commandUserExtension;
	}

	get isSetupRequired() {
		return this._isSetupRequired;
	}

	get supportsInteractiveMode() {
		return this._supportsInteractiveMode;
	}

	get getCommandQuestions() {
		return this._getCommandQuestions;
	}

	get preActionFunc() {
		return this._preActionFunc;
	}

	get actionFunc() {
		return this._action;
	}

	_addNonInteractiveCommandOptions(commandSetup, options) {
		const optionsSortedByName = Object.values(options).sort((option1, option2) =>
			option1.name.localeCompare(option2.name)
		);
		optionsSortedByName.forEach(option => {
			if (option.disableInIntegrationMode) {
				return;
			}
			let mandatoryOptionString = '';
			let optionString = '';
			if (option.type !== OPTION_TYPE_FLAG) {
				mandatoryOptionString = option.mandatory ? '<argument>' : '[argument]';
			}
			if (option.alias) {
				optionString = `-${option.alias}, `;
			}
			optionString += `--${option.name} ${mandatoryOptionString}`;
			commandSetup.option(optionString, option.description);
		});
		return commandSetup;
	}
};
