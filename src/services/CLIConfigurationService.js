'use strict';

const { NodeVM } = require('vm2');
const FileUtils = require('../utils/FileUtils');
const path = require('path');

const CLI_CONFIG_JS_FILE = 'cli-config.js';
const DEFAULT_CONFIG = {
	defaultProjectFolder: '',
	commands: {},
};
const DEFAULT_COMMAND = {
	beforeExecuting: options => {
		return options;
	},
	onCompleted: completed => {},
	onError: error => {},
};

var CLI_CONFIG;

var isString = str => typeof str === 'string' || str instanceof String;

class CLIConfigurationService {
	constructor(executionPath) {
		var NODEVM = new NodeVM({
			console: 'inherit',
			sandbox: {},
			require: {
				external: true,
				builtin: ['*'],
				root: executionPath,
			},
		});

		var cliConfigFile = executionPath + '/' + CLI_CONFIG_JS_FILE;
		if (FileUtils.exists(cliConfigFile)) {
			var cliConfigFileContent = FileUtils.readAsString(cliConfigFile);
			CLI_CONFIG = NODEVM.run(cliConfigFileContent, cliConfigFile);
		} else {
			CLI_CONFIG = DEFAULT_CONFIG;
		}
	}

	getCommandUserExtension(command) {
		return {
			...DEFAULT_COMMAND,
			...(CLI_CONFIG && CLI_CONFIG.commands[command] ? CLI_CONFIG.commands[command] : {}),
		};
	}

	getProjectFolder(command) {
		var executionPath = process.cwd();

		var defaultProjectFolder = isString(CLI_CONFIG.defaultProjectFolder)
			? path.join(executionPath, CLI_CONFIG.defaultProjectFolder)
			: executionPath;

		var commandConfig = CLI_CONFIG && CLI_CONFIG.commands[command];
		var commandOverridenProjectFolder;
		if (commandConfig && isString(commandConfig.projectFolder)) {
			commandOverridenProjectFolder = commandConfig.projectFolder;
		}

		return commandOverridenProjectFolder ? commandOverridenProjectFolder : defaultProjectFolder;
	}
}

var executionPath = process.cwd();
module.exports = new CLIConfigurationService(executionPath);
