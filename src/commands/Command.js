'use strict';

const Context = require('../Context');
const CLIException = require('../CLIException');
const ApplicationConstants = require('../ApplicationConstants');
const inquirer = require('inquirer');
const TranslationService = require('../services/TranslationService');
const TRANSLATION_KEYS = require('../services/TranslationKeys');

module.exports = class Command {
	constructor(options) {
		//TODO ASSERT NAME, ALIAS, DESCRIPTION, ACTION, COMMANDOPTIONS ARE VALID
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
	}

	_promptCommandQuestions() {
		return Promise.resolve(this._getCommandQuestions()).then(questions => {
			return inquirer.prompt(questions);
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

				var validationErrors = this._validateCommandOptions(computedArgs);

				if (validationErrors.length === 0) {
					return this._action(computedArgs)
						.then(res => resolve(res))
						.catch(error => reject(error));
				} else {
					var errorMessage =
						TranslationService.getMessage(
							TRANSLATION_KEYS.COMMAND_OPTIONS_VALIDATION_ERRORS
						) + validationErrors.toString(); //DO THIS RIGHT!
					reject(new CLIException(4, errorMessage));
				}
			};

			if (this._isSetupRequired && !Context.CurrentAccountDetails.isAccountSetup()) {
				reject(
					new CLIException(
						3,
						TranslationService.getMessage(TRANSLATION_KEYS.SETUP_REQUIRED_ERROR)
					)
				);
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

	_validateCommandOptions(args) {
		var validationErrors = [];

		var isMandatoryOptionPresent = (optionId, aliasId, args) => {
			return args[optionId] || args[aliasId];
		};

		for (const optionId in this._options) {
			const option = this._options[optionId];
			var aliasId = option.alias;
			if (this._options.hasOwnProperty(optionId)) {
				if (option.mandatory && !isMandatoryOptionPresent(optionId, aliasId, args)) {
					validationErrors.push(`${option.name} argument is mandatory`);
				}
			}
		}
		return validationErrors;
	}

	_addNonInteractiveCommandOptions(commandSetup, options) {
		for (const optionId in options) {
			if (this._options.hasOwnProperty(optionId)) {
				const option = this._options[optionId];
				var mandatoryOptionString = option.mandatory ? '<option>' : '[option]';
				var optionString = `-${option.alias}, --${option.name} ${mandatoryOptionString}`;
				commandSetup.option(optionString, option.description);
			}
		}
		return commandSetup;
	}

	_onExecuteCommand(args) {
		if (this._commandUserExtension.beforeExecuting) {
			this._commandUserExtension.beforeExecuting({
				command: this._name,
				arguments: {},
				userArguments: {},
			});
		}

		this._executeCommandAction(args)
			.then(completed => {
				if (this._commandUserExtension.onCompleted) {
					this._commandUserExtension.onCompleted(completed);
				}
			})
			.catch(error => {
				Context.EventEmitter.emit(ApplicationConstants.CLI_EXCEPTION_EVENT, error);
				if (this._commandUserExtension.onError) {
					this._commandUserExtension.onError(error);
				}
			});
	}

	attachToProgram(program) {
		var self = this;
		var commandSetup = program.command(`${this._name} folder>`);
		//program.alias(this._alias)

		if (!this._runInInteractiveMode) {
			if (this._supportsInteractiveMode) {
				this._options.interactive = {
					name: 'interactive',
					alias: 'i',
					description: `Run the ${this._name} command in interactive mode`,
					mandatory: false,
				};
			}
			commandSetup = this._addNonInteractiveCommandOptions(commandSetup, this._options);
		}

		commandSetup
			//.allowUnknownOption()
			.description(this._description)
			.action(options => {
				self._onExecuteCommand(options);
			});
	}
};
