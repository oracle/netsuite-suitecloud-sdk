'use strict';

const Context = require('../Context');
const CLIException = require('../CLIException');
const { CLI_EXCEPTION_EVENT } = require('../ApplicationConstants');
const inquirer = require('inquirer');
const CommandOptionsValidator = require('../services/CommandOptionValidator');
const TranslationService = require('../services/TranslationService');
const { COMMAND_OPTION_INTERACTIVE_HELP } = require('../services/TranslationKeys');
const assert = require('assert');

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

		this._name = options.name;
		this._alias = options.alias;
		this._description = options.description;
		this._getCommandQuestions = options.getCommandQuestionsFunc;
		this._preActionFunc = options.preActionFunc;
		this._action = options.actionFunc;
		this._isSetupRequired =
			typeof options.isSetupRequired === 'undefined' ? true : options.isSetupRequired;
		this._runInInteractiveMode = options.runInInteractiveMode;
		this._options = options.options;
		this._commandUserExtension = options.commandUserExtension;
		this._supportsInteractiveMode = options.supportsInteractiveMode;
		this._commandOptionsValidator = new CommandOptionsValidator(this._options);
	}

	attachToProgram(program) {
		var self = this;
		var commandSetup = program.command(`${this._name} folder>`);
		//program.alias(this._alias)

		if (!this._runInInteractiveMode) {
			if (this._supportsInteractiveMode) {
				var interactiveOptionHelp = TranslationService.getMessage(
					COMMAND_OPTION_INTERACTIVE_HELP,
					this._name
				);
				this._options.interactive = {
					name: 'interactive',
					alias: 'i',
					description: interactiveOptionHelp,
					mandatory: false,
				};
			}
			commandSetup = this._addNonInteractiveCommandOptions(commandSetup, this._options);
		}

		commandSetup.description(this._description).action(options => {
			self._onExecuteCommand(options);
		});
	}

	_addNonInteractiveCommandOptions(commandSetup, options) {
		var optionsSortedByName = Object.values(options).sort((option1, option2) =>
			option1.name.localeCompare(option2.name)
		);
		optionsSortedByName.forEach(option => {
			var mandatoryOptionString = option.mandatory ? '<option>' : '[option]';
			var optionString = `-${option.alias}, --${option.name} ${mandatoryOptionString}`;
			commandSetup.option(optionString, option.description);
		});
		return commandSetup;
	}

	_onExecuteCommand(args) {
		var optionValues = this._extractOptionValuesFromArguments(this._options, args);
		var beforeExecutingContext = {
			command: this._name,
			projectPath: process.cwd(),
			arguments: optionValues,
			userArguments: {},
		};

		Promise.resolve(this._commandUserExtension.beforeExecuting(beforeExecutingContext)).then(
			newOptions => {
				this._executeCommandAction(newOptions.arguments)
					.then(completed => {
						if (this._commandUserExtension.onCompleted) {
							this._commandUserExtension.onCompleted(completed);
						}
					})
					.catch(error => {
						Context.EventEmitter.emit(CLI_EXCEPTION_EVENT, error);
						if (this._commandUserExtension.onError) {
							this._commandUserExtension.onError(error);
						}
					});
			}
		);
	}

	_extractOptionValuesFromArguments(options, args) {
		var optionValues = {};
		for (const optionId in options) {
			if (options.hasOwnProperty(optionId) && args.hasOwnProperty(optionId)) {
				optionValues[optionId] = args[optionId];
			}
		}

		return optionValues;
	}

	_executeCommandAction(args) {
		return new Promise((resolve, reject) => {
			var actionFunction = args => {
				const argsProcessingFunctions = [
					this._applyDefaultContextParams.bind(this),
					this._preActionFunc.bind(this),
				];

				const computedArgs = argsProcessingFunctions.reduce((previousArgs, func) => {
					return func(previousArgs);
				}, args);

				var validationErrors = this._commandOptionsValidator.validate(computedArgs);

				if (validationErrors.length === 0) {
					return this._action(computedArgs)
						.then(res => resolve(res))
						.catch(error => reject(error));
				} else {
					var errorMessage = this._commandOptionsValidator.formatErrors(validationErrors);
					reject(new CLIException(4, errorMessage));
				}
			};

			if (this._isSetupRequired && !Context.CurrentAccountDetails.isAccountSetup()) {
				var exceptionMessage = TranslationService.getMessage(
					TRANSLATION_KEYS.SETUP_REQUIRED_ERROR
				);
				reject(new CLIException(3, exceptionMessage));
				return;
			}

			if (this._runInInteractiveMode) {
				this._promptCommandQuestions().then(answers => {
					actionFunction(answers);
				});
			} else {
				actionFunction(args);
			}
		});
	}

	_applyDefaultContextParams(args) {
		if (this._isSetupRequired) {
			args.account = Context.CurrentAccountDetails.getCompId();
			args.role = Context.CurrentAccountDetails.getRoleId();
			args.email = Context.CurrentAccountDetails.getEmail();
			args.url = Context.CurrentAccountDetails.getNetSuiteUrl();
		}

		return args;
	}

	_promptCommandQuestions() {
		return Promise.resolve(this._getCommandQuestions(inquirer.prompt));
	}
};
