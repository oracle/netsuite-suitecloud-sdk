"use strict";
const program = require('commander');
const NodeUtils = require('./NodeUtils');
const Context = require('./Context');
const ApplicationConstants = require('./ApplicationConstants');
const TranslationService = require('./services/TranslationService');

module.exports = class CLI {

    constructor(commandGenerators){
        this._commandGenerators = commandGenerators;
        this._initializeCommandGenerators();
        this._initializeErrorHandlers();
    }

    _initializeCommandGenerators(){
        this._commandGenerators.forEach(commandGenerator => {
            var command = commandGenerator.create();
            command.attachToProgram(program);
        });
    }

    _initializeErrorHandlers(){
        var self = this;
        Context.EventEmitter.on(ApplicationConstants.CLI_EXCEPTION_EVENT, (exception) => {
            NodeUtils.println(self._unwrapExceptionMessage(exception), NodeUtils.COLORS.RED);
        });
        Context.EventEmitter.on('error', (exception) => {
            NodeUtils.println(self._unwrapExceptionMessage(exception), NodeUtils.COLORS.RED);
        });
    }

    _unwrapExceptionMessage(exception){
        if(exception.getErrorMessage){
            return exception.getErrorMessage();
        }else{
            return exception;
        }
    }

    start(process){
        try {
            program
                .version('0.0.1', '-v, --version')
                .usage(TranslationService.getMessage('general_usage_title'))
                .parse(process.argv);

            if (!program.args.length) {
                NodeUtils.println(TranslationService.getMessage('cli_title'), NodeUtils.COLORS.CYAN);
                program.help();
            }
        }catch (exception) {
            NodeUtils.println(this._unwrapExceptionMessage(exception), NodeUtils.COLORS.RED);
        }
    }

};