#!/usr/bin/env node
"use strict";

const CLI = require('./CLI');
const NodeUtils = require('./NodeUtils');
const ListBundlesCommandGenerator = require('./commands/ListBundlesCommandGenerator');
const ListFilesCommandGenerator = require('./commands/ListFilesCommandGenerator');
const SetupCommandGenerator = require('./commands/SetupCommandGenerator');


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


