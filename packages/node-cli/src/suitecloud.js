#!/usr/bin/env node
/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const CLI = require('./CLI');
const CommandsMetadataService = require('./core/CommandsMetadataService');
const CommandActionExecutor = require('./core/CommandActionExecutor');
const CommandRegistrationService = require('./core/CommandRegistrationService');
const CommandOptionsValidator = require('./core/CommandOptionsValidator');
const CLIConfigurationService = require('./core/extensibility/CLIConfigurationService');
const sdkPath = require('./core/sdksetup/SdkProperties').getSdkPath();
const NodeConsoleLogger = require('./loggers/NodeConsoleLogger');

const executionPath = process.cwd();
const commandsMetadataServiceSingleton = new CommandsMetadataService();

const cliInstance = new CLI({
	commandsMetadataService: commandsMetadataServiceSingleton,
	commandRegistrationService: new CommandRegistrationService(),
	commandActionExecutor: new CommandActionExecutor({
		executionPath,
		commandOptionsValidator: new CommandOptionsValidator(),
		cliConfigurationService: new CLIConfigurationService(),
		commandsMetadataService: commandsMetadataServiceSingleton,
		log: NodeConsoleLogger,
		sdkPath: sdkPath
	}),
});

cliInstance.start(process);
