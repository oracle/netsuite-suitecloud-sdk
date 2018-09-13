"use strict";
const program = require('commander');
const NodeUtils = require('./NodeUtils');
const Context = require('./Context');
const ApplicationConstants = require('./ApplicationConstants');

module.exports = class CLI {

    constructor(commandGenerators){
        this._commandGenerators = commandGenerators;
        this._initialize();
        this._initializeErrorHandlers();
    }

    _initialize(){
        this._commandGenerators.forEach(commandGenerator => {
            var command = commandGenerator.create();
            command.attachToProgram(program);
        });
    }

    _initializeErrorHandlers(){
        Context.EventEmitter.on(ApplicationConstants.CLI_EXCEPTION_EVENT, (exception) => {
            NodeUtils.println(exception.getErrorMessage(), NodeUtils.COLORS.RED);
        });
        Context.EventEmitter.on('error', (exception) => {
            NodeUtils.println(exception, NodeUtils.COLORS.RED);
        });
    }

    start(process){
        try {
            program
                .version('0.0.1', '-v, --version')
                .usage('General usage of the sdfcli command')
                .parse(process.argv);

            if (!program.args.length) {
                NodeUtils.println('NetSuite Node CLI for NS 19.1', NodeUtils.COLORS.CYAN)
                program.help();
            }
        } catch(exception) {
            NodeUtils.println(exception, NodeUtils.COLORS.RED);
        }
    }
}