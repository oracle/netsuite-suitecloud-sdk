'use strict';

const { NodeVM } = require('vm2');
const FileUtils = require('../utils/FileUtils');

const CLI_CONFIG_JS_FILE = 'cli-config.js';
const DEFAULT_CONFIG = {
    interactiveMode: true
};
const DEFAULT_COMMAND = {
    allowUserDefaultConfig: true,
    beforeExecuting: (options) => { },
    onCompleted: (completed) => { },
    onError: (error) => { }
}

var CLI_CONFIG;

class CLIConfigurationService{
    constructor(executionPath){
        var NODEVM = new NodeVM({
            console: 'inherit',
            sandbox: {},
            require: {
                context: 'sandbox',
                external: true,
                root: executionPath,
            }
        });

        var cliConfigFile = executionPath + '/' + CLI_CONFIG_JS_FILE;
        if (FileUtils.exists(cliConfigFile)) {
            var cliConfigFileContent = FileUtils.readAsString(cliConfigFile);
            CLI_CONFIG = NODEVM.run(cliConfigFileContent);
        }
    }
    getCommandUserExtension(command) {
        return { ...DEFAULT_COMMAND, ...(CLI_CONFIG && CLI_CONFIG.commands[command] ? CLI_CONFIG.commands[command] : {}) };
    }

    getCLIGeneralOptions() {
        return { ...DEFAULT_CONFIG, ...(CLICONFIG && CLI_CONFIG.general ? CLI_CONFIG.general : {}) };
    }
}

var executionPath = process.cwd();
module.exports = new CLIConfigurationService(executionPath);