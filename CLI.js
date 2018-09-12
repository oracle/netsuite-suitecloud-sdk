"use strict";
const program = require('commander');
const NodeUtils = require('./NodeUtils');

module.exports = class CLI {

    constructor(commandGenerators){
        this._commandGenerators = commandGenerators;
        this._initialize();
    }

    _initialize(){
        this._commandGenerators.forEach(commandGenerator => {
            var command = commandGenerator.create();
            command.attachToProgram(program);
        });
    }

    start(process){
        program
        .version('0.0.1', '-v, --version')
        .usage('General usage of the sdfcli command')
        .parse(process.argv);

        if (!program.args.length) {
            NodeUtils.println('NetSuite Node CLI for NS 19.1', NodeUtils.COLORS.CYAN)
            program.help();
        }
    }
}