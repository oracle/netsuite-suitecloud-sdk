'use strict';

const { NodeVM } = require('vm2');
const NodeUtils = require('../utils/NodeUtils');
const FileUtils = require('../utils/FileUtils');
const path = require('path');
const CLIException = require('../CLIException');

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

const isString = str => typeof str === 'string' || str instanceof String;

class CLIConfigurationService {
	constructor(executionPath) {
		this._cliConfig = DEFAULT_CONFIG;
		this._executionPath = executionPath;
	}

	initialize() {
		var cliConfigFile = path.join(this._executionPath, CLI_CONFIG_JS_FILE);
		if (!FileUtils.exists(cliConfigFile)) return;

		try {
			var nodeVm = new NodeVM({
				console: 'inherit',
				sandbox: {},
				require: {
					external: true,
					builtin: ['*'],
					root: this._executionPath,
				},
			});
			var cliConfigFileContent = FileUtils.readAsString(cliConfigFile);
			this._cliConfig = nodeVm.run(cliConfigFileContent, cliConfigFile);
		} catch (error) {
			throw new CLIException(
				4,
				`Error while loading configuration file ${cliConfigFile}. Please review the file and try again. Details:${
					NodeUtils.lineBreak
				}${error}`
			);
		}
	}

	getCommandUserExtension(command) {
		var commandExtension =
			this._cliConfig && this._cliConfig.commands[command]
				? this._cliConfig.commands[command]
				: {};
		return {
			...DEFAULT_COMMAND,
			...commandExtension,
		};
	}

	getProjectFolder(command) {
		var defaultProjectFolder = isString(this._cliConfig.defaultProjectFolder)
			? this._cliConfig.defaultProjectFolder
			: '';

		var commandConfig = this._cliConfig && this._cliConfig.commands[command];
		var commandOverridenProjectFolder;
		if (commandConfig && isString(commandConfig.projectFolder)) {
			commandOverridenProjectFolder = commandConfig.projectFolder;
		}
		return path.join(
			this._executionPath,
			commandOverridenProjectFolder ? commandOverridenProjectFolder : defaultProjectFolder
		);
	}
}

module.exports = CLIConfigurationService;
