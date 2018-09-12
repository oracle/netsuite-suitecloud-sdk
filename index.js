#!/usr/bin/env node
"use strict";

const CLI = require('./src/CLI');
const NodeUtils = require('./src/NodeUtils');
const ListBundlesCommandGenerator = require('./src/commands/ListBundlesCommandGenerator');
const ListFilesCommandGenerator = require('./src/commands/ListFilesCommandGenerator');
const SetupCommandGenerator = require('./src/commands/SetupCommandGenerator');


var commandGenerators = [
    new ListBundlesCommandGenerator(),
    new SetupCommandGenerator(),
    new ListFilesCommandGenerator()
];

try {
    var cliInstance = new CLI(commandGenerators);
    cliInstance.start(process);
} catch(exception) {
    var errorMessage = exception.defaultMessage ? exception.defaultMessage : exception;
    NodeUtils.println(errorMessage, NodeUtils.COLORS.RED);
}


