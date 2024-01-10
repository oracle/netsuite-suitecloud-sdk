/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { lineBreak } = require('../../loggers/LoggerConstants');
const FileUtils = require('../../utils/FileUtils');
const path = require('path');
const NodeTranslationService = require('./../../services/NodeTranslationService');
const { ERRORS } = require('./../../services/TranslationKeys');
const CommandUserExtension = require('./CommandUserExtension');
const CLI_CONFIG_JS_FILE = 'suitecloud.config.js';
const DEFAULT_CONFIG = {
	defaultProjectFolder: '',
	commands: {},
};

const isString = (str) => typeof str === 'string' || str instanceof String;

module.exports = class CLIConfigurationService {
	constructor() {
		this._cliConfig = DEFAULT_CONFIG;
	}

	initialize(executionPath) {
		this._executionPath = executionPath;
		const cliConfigFile = path.join(this._executionPath, CLI_CONFIG_JS_FILE);
		if (!FileUtils.exists(cliConfigFile)) {
			return;
		}

		try {
			this._cliConfig = require(cliConfigFile);
		} catch (error) {
			throw NodeTranslationService.getMessage(ERRORS.CLI_CONFIG_ERROR_LOADING_CONFIGURATION_MODULE, cliConfigFile, lineBreak, error);
		}
	}

	getCommandUserExtension(commandName) {
		const commandExtension =
			this._cliConfig && this._cliConfig.commands && this._cliConfig.commands[commandName] ? this._cliConfig.commands[commandName] : {};
		return new CommandUserExtension(commandExtension);
	}

	getProjectFolder(command) {
		const defaultProjectFolder = isString(this._cliConfig.defaultProjectFolder) ? this._cliConfig.defaultProjectFolder : '';

		const commandConfig = this._cliConfig && this._cliConfig.commands && this._cliConfig.commands[command];
		let commandOverriddenProjectFolder;
		if (commandConfig && isString(commandConfig.projectFolder)) {
			commandOverriddenProjectFolder = commandConfig.projectFolder;
		}
		return path.join(this._executionPath, commandOverriddenProjectFolder ? commandOverriddenProjectFolder : defaultProjectFolder);
	}
};
