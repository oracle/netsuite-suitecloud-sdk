#!/usr/bin/env node
'use strict';

const CLI = require('./CLI');
const ListBundlesCommandGenerator = require('./commands/ListBundlesCommandGenerator');
const ListFilesCommandGenerator = require('./commands/ListFilesCommandGenerator');
const SetupCommandGenerator = require('./commands/SetupCommandGenerator');
const CreateProjectCommandGenerator = require('./commands/CreateProjectCommandGenerator');
const ValidateCommandGenerator = require('./commands/ValidateCommandGenerator');

const commandGenerators = [
    new CreateProjectCommandGenerator(),
    new SetupCommandGenerator(),
    new ListBundlesCommandGenerator(),
    new ListFilesCommandGenerator(),
    new ValidateCommandGenerator()
];

const cliInstance = new CLI(commandGenerators);
cliInstance.start(process);


