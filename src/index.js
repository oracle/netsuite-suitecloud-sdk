#!/usr/bin/env node
"use strict";

const CLI = require('./CLI');
const ListBundlesCommandGenerator = require('./commands/ListBundlesCommandGenerator');
const ListFilesCommandGenerator = require('./commands/ListFilesCommandGenerator');
const SetupCommandGenerator = require('./commands/SetupCommandGenerator');

var commandGenerators = [
    new ListBundlesCommandGenerator(),
    new SetupCommandGenerator(),
    new ListFilesCommandGenerator()
];

var cliInstance = new CLI(commandGenerators);
cliInstance.start(process);


