"use strict";

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
        this._action = options.actionFunc;
        this._isSetupRequired = (typeof options.isSetupRequired === 'undefined') ? true : options.isSetupRequired;
        this._runInInteractiveMode = options.runInInteractiveMode;
        this._options = options.options;
        this._commandUserExtension = options.commandUserExtension;
        this._supportsInteractiveMode = options.supportsInteractiveMode;
    }

    _promptCommandQuestions() {
        return inquirer.prompt(this._getCommandQuestions());
    }

    _executeCommandAction(args) {
        return new Promise((resolve, reject) => {
            var actionFunction = (args) => {
                var validationErrors = this._validateCommandOptions(args);
                if (validationErrors.length === 0) {
                    return this._action(args)
                        .then((res) => resolve(res))
                        .catch((error) => reject(error));
                } else {
                    var errorMessage = TranslationService.getMessage(TRANSLATION_KEYS.COMMAND_OPTIONS_VALIDATION_ERRORS)
                        + validationErrors.toString(); //DO THIS RIGHT! 
                    reject(new CLIException(4, errorMessage));
                }
            }

            if (this._isSetupRequired && !Context.CurrentAccountDetails.isAccountSetup()) {
                reject(new CLIException(3, TranslationService.getMessage(TRANSLATION_KEYS.SETUP_REQUIRED_ERROR)));
                return;
            }

            if (this._runInInteractiveMode) {
                this._promptCommandQuestions().then((answers) => {
                    actionFunction(answers)
                })
            } else {
                actionFunction(args)
            }
        });
    }

    _validateCommandOptions(args) {
        var validationErrors = [];
        for (const optionId in this._options) {
            if (this._options.hasOwnProperty(optionId)) {
                const option = this._options[optionId];
                if (option.mandatory && args[optionId] == null) {
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
                var optionString = `-${option.alias}, --${option.name} ${mandatoryOptionString}`
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
                userArguments: {}
            });
        }

        this._executeCommandAction(args)
            .then((completed) => {
                if (this._commandUserExtension.onCompleted) {
                    this._commandUserExtension.onCompleted(completed);
                }
            }).catch((error) => {
                Context.EventEmitter.emit(ApplicationConstants.CLI_EXCEPTION_EVENT, error);
                if (this._commandUserExtension.onError) {
                    this._commandUserExtension.onError(error);
                }
            });
    }

    attachToProgram(program) {
        var commandSetup = program
            .command(this._name)
        //.alias(this._alias)

        if (!this._runInInteractiveMode) {
            if (this._supportsInteractiveMode) {
                this._options.interactive = {
                    name: "interactive",
                    alias: "i",
                    description: `Run the ${this._name} command in interactive mode`,
                    mandatory: false
                }
            }
            commandSetup = this._addNonInteractiveCommandOptions(commandSetup, this._options)
        }

        commandSetup
            .description(this._description)
            .action(this._onExecuteCommand.bind(this));
    }
};