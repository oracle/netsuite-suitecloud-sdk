'use strict';

const Context = require('./Context');
const NodeUtils = require('./NodeUtils');
const CryptoUtils = require('./CryptoUtils');
const CLIException = require('./CLIException');
const ApplicationConstants = require('./ApplicationConstants');
const spawn = require('child_process').spawn;
const ConfigurationService = require('./services/ConfigurationService');

module.exports.SDKExecutor = class SDKExecutor {

    _convertParamsObjToString(cliParams) {
        let cliParamsAsString = '';
        for (var param in cliParams) {
            if (cliParams.hasOwnProperty(param)) {
                const value = cliParams[param] ? ` "${cliParams[param]}" ` : ' ';
                cliParamsAsString += param + value;
            }
        }
        console.log(cliParamsAsString);
        return cliParamsAsString;
    }

    execute(executionContext) {
        let cliParams;
        if (executionContext.applyDefaultParams()) {
            const defaultParams = {
                '-account': Context.CurrentAccountDetails.getCompId(),
                '-role': Context.CurrentAccountDetails.getRoleId(),
                '-email': Context.CurrentAccountDetails.getEmail(),
                '-url': Context.CurrentAccountDetails.getNetSuiteUrl()
            };
            cliParams = Object.assign({}, defaultParams, executionContext.getParams());
        } else {
            cliParams = Object.assign({}, executionContext.getParams());
        }

        const cliParamsAsString = this._convertParamsObjToString(cliParams);

        const jvmCommand = `${ConfigurationService.getConfig().jvmInvocationOptions} "${Context.SDKFilePath}" ${executionContext.getCommand()} ${cliParamsAsString}`;

        const childProcess = spawn(jvmCommand, [], {shell: true});

        childProcess.stderr.on('data', data => {
            const sdkOutput = data.toString('utf8');
            Context.EventEmitter.emit(ApplicationConstants.CLI_EXCEPTION_EVENT,
                new CLIException(1, sdkOutput));
        });

        childProcess.stdout.on('data', (data) => {
            const sdkOutput = data.toString('utf8');
            if (sdkOutput.includes('Enter password')) {
                if (Context.CurrentAccountDetails.getPassword() && Context.CurrentAccountDetails.getEncryptionKey()) {
                    const password = Context.CurrentAccountDetails.getPassword();
                    const encryptionKey = Context.CurrentAccountDetails.getEncryptionKey();
                    childProcess.stdin.write(CryptoUtils.decrypt(password, encryptionKey));
                    childProcess.stdin.end();
                } else {
                    Context.EventEmitter.emit(ApplicationConstants.CLI_EXCEPTION_EVENT,
                        new CLIException(3, 'Authentication error: please run "sdf setup"'));
                    childProcess.kill('SIGINT');
                }
                return;
            }
            NodeUtils.println(sdkOutput, NodeUtils.COLORS.CYAN);
        });

        childProcess.on('close', (code) => {
            if (code !== 0) {
                Context.EventEmitter.emit(ApplicationConstants.CLI_EXCEPTION_EVENT,
                    new CLIException(2, `ERROR: SDK exited with code ${code}`));
            }
        });
    }

};

module.exports.SDKExecutionContext = class SDKExecutionContext {

    constructor(command, params, applyDefaultParams) {
        this._command = command;
        this._params = params;
        this._applyDefaultParams = (typeof applyDefaultParams === 'undefined') ? true : applyDefaultParams;
    }

    getCommand() {
        return this._command;
    }

    applyDefaultParams() {
        return this._applyDefaultParams;
    }

    getParams() {
        return this._params;
    }

};