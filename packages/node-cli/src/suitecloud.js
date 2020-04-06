#!/usr/bin/env node
/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const CLI = require('./CLI');
const CommandsMetadataService = require('./core/CommandsMetadataService');
const CommandActionExecutor = require('./core/CommandActionExecutor');
const CommandInstanceFactory = require('./core/CommandInstanceFactory');
const CommandRegistrationService = require('./core/CommandRegistrationService');
const CommandOptionsValidator = require('./core/CommandOptionsValidator');
const CLIConfigurationService = require('./core/extensibility/CLIConfigurationService');
const AuthenticationService = require('./core/authentication/AuthenticationService');
const path = require('path');
const NodeConsoleLogger = require('./loggers/NodeConsoleLogger');

const executionPath = process.cwd();
const rootCLIPath = path.dirname(require.main.filename);
const commandsMetadataServiceSingleton = new CommandsMetadataService(rootCLIPath);

const cliInstance = new CLI({
	commandsMetadataService: commandsMetadataServiceSingleton,
	commandRegistrationService: new CommandRegistrationService(),
	commandActionExecutor: new CommandActionExecutor({
		executionPath,
		commandOptionsValidator: new CommandOptionsValidator(),
		cliConfigurationService: new CLIConfigurationService(),
		commandInstanceFactory: new CommandInstanceFactory(),
		authenticationService: new AuthenticationService(executionPath),
		commandsMetadataService: commandsMetadataServiceSingleton,
		log: NodeConsoleLogger,
	}),
});

cliInstance.start(process);
