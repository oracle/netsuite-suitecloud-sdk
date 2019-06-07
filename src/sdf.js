#!/usr/bin/env node
'use strict';

const CLI = require('./CLI');
const CommandsMetadataService = require('./core/CommandsMetadataService');
const CommandActionExecutor = require('./core/CommandActionExecutor');
const CommandInstanceFactory = require('./core/CommandInstanceFactory');
const CommandRegistrationService = require('./core/CommandRegistrationService');
const CommandOptionsValidator = require('./core/CommandOptionsValidator');
const CLIConfigurationService = require('./core/extensibility/CLIConfigurationService');
const CommandOutputHandler = require('./core/CommandOutputHandler');

const commandsMetadataServiceSingleton = new CommandsMetadataService();
const cliInstance = new CLI({
	commandsMetadataService: commandsMetadataServiceSingleton,
	commandRegistrationService: new CommandRegistrationService(),
	commandActionExecutor: new CommandActionExecutor({
		commandOutputHandler: new CommandOutputHandler(),
		commandOptionsValidator: new CommandOptionsValidator(),
		cliConfigurationService: new CLIConfigurationService(),
		commandInstanceFactory: new CommandInstanceFactory(),
		commandsMetadataService: commandsMetadataServiceSingleton,
	}),
});

cliInstance.start(process);
