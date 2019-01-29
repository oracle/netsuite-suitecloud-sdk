#!/usr/bin/env node
'use strict';

const CLI = require('./CLI');
const CommandsMetadataService = require('./metadata/CommandsMetadataService');

var commandsMetadata = CommandsMetadataService.getCommandsMetadata();
var runInInteractiveMode = process.argv[3] == '-i' //TODO: CHECK IF ANY CONTAINS -i
const cliInstance = new CLI(commandsMetadata, runInInteractiveMode);
cliInstance.start(process);