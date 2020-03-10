/*
** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const { NodeVM } = require('vm2');
const NodeUtils = require('../../utils/NodeUtils');
const FileUtils = require('../../utils/FileUtils');
const path = require('path');
const TranslationService = require('./../../services/TranslationService');
const { ERRORS } = require('./../../services/TranslationKeys');
const CommandUserExtension = require('./CommandUserExtension');
const CLI_CONFIG_JS_FILE = 'suitecloud.config.js';
const DEFAULT_CONFIG = {
	defaultProjectFolder: '',
	commands: {},
};

const isString = str => typeof str === 'string' || str instanceof String;

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
			const nodeVm = new NodeVM({
				console: 'inherit',
				sandbox: {},
				require: {
					external: true,
					builtin: ['*'],
					root: this._executionPath,
				},
			});
			const cliConfigFileContent = FileUtils.readAsString(cliConfigFile);
			this._cliConfig = nodeVm.run(cliConfigFileContent, cliConfigFile);
		} catch (error) {
			throw TranslationService.getMessage(
				ERRORS.CLI_CONFIG_ERROR_LOADING_CONFIGURATION_MODULE,
				cliConfigFile,
				NodeUtils.lineBreak,
				error
			);
		}
	}

	getCommandUserExtension(commandName) {
		const commandExtension =
			this._cliConfig && this._cliConfig.commands[commandName]
				? this._cliConfig.commands[commandName]
				: {};
		return new CommandUserExtension(commandExtension);
	}

	getProjectFolder(command) {
		const defaultProjectFolder = isString(this._cliConfig.defaultProjectFolder)
			? this._cliConfig.defaultProjectFolder
			: '';

		const commandConfig = this._cliConfig && this._cliConfig.commands[command];
		let commandOverridenProjectFolder;
		if (commandConfig && isString(commandConfig.projectFolder)) {
			commandOverridenProjectFolder = commandConfig.projectFolder;
		}
		return path.join(
			this._executionPath,
			commandOverridenProjectFolder ? commandOverridenProjectFolder : defaultProjectFolder
		);
	}
};
