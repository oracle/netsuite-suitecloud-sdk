'use strict';

const Context = require('./Context');
const NodeUtils = require('./utils/NodeUtils');
const CryptoUtils = require('./utils/CryptoUtils');
const CLIException = require('./CLIException');
const ApplicationConstants = require('./ApplicationConstants');
const spawn = require('child_process').spawn;
const ConfigurationService = require('./services/ConfigurationService');

module.exports.SDKExecutor = class SDKExecutor {

    _getCLIParamsFrom(executionContext) {
        var cliParams = Object.assign({}, executionContext.getParams());
        return cliParams;
    }

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
        return new Promise((resolve, reject) => {
            let cliParams = this._getCLIParamsFrom(executionContext);
            const cliParamsAsString = this._convertParamsObjToString(cliParams);
            
            const jvmCommand = `${ConfigurationService.getConfig().jvmInvocationOptions} "${Context.SDKFilePath}" ${executionContext.getCommand()} ${cliParamsAsString}`;

            const childProcess = spawn(jvmCommand, [], { shell: true });

            childProcess.stderr.on('data', data => {
                const sdkOutput = data.toString('utf8');
                Context.EventEmitter.emit(ApplicationConstants.CLI_EXCEPTION_EVENT, new CLIException(1, sdkOutput));
                reject(sdkOutput);
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
                if(code === 0){
                    resolve("HERE WE SHOULD ADD THE LAST SDKOUTPUT");
                } else if (code !== 0) {
                    var exceptionMessage = `ERROR: SDK exited with code ${code}`;
                    Context.EventEmitter.emit(ApplicationConstants.CLI_EXCEPTION_EVENT,
                        new CLIException(2, exceptionMessage));
                    reject(exceptionMessage);
                }
            });
        })
    }
};

module.exports.SDKExecutionContext = class SDKExecutionContext {

    constructor(command, params) {
        this._command = command;
        this._params = params || {};
    }

    getCommand() {
        return this._command;
    }

    addParam(name, value){
        this._params[`-${name}`] = value;
    }

    getParams() {
        return this._params;
    }

};