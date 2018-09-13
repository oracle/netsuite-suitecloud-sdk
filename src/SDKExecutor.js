"use strict";
const Context = require('./Context');
const NodeUtils = require('./NodeUtils');
const CLIException = require('./CLIException');
const ApplicationConstants = require('./ApplicationConstants');
const spawn = require('child_process').spawn;

module.exports = class SDKExecutor {

    _convertParamsObjToString(cliParams){
        var cliParamsAsString = '';
        for (var param in cliParams) {
            if (cliParams.hasOwnProperty(param)) {
                cliParamsAsString += param + ' ' + cliParams[param] + ' ';
            }
        }
        console.log(cliParamsAsString)
        return cliParamsAsString;
    }

    execute(command, params){
        var defaultParams = {
            '-account' : Context.CurrentAccountDetails.getCompId(),
            '-role' : Context.CurrentAccountDetails.getRoleId(),
            '-email' : Context.CurrentAccountDetails.getEmail(),
            '-url' : Context.CurrentAccountDetails.getNetSuiteUrl()
        }
        var cliParams = Object.assign({}, defaultParams, params);
        var cliParamsAsString = this._convertParamsObjToString(cliParams);

        var childProcess = spawn(`java -jar ${Context.SDKFileName} ${command} ${cliParamsAsString}`, 
            [],
            {
                shell:true
            });
        
        childProcess.stderr.on('data', data =>{
            var sdkOutput = data.toString('utf8');
            Context.EventEmitter.emit(ApplicationConstants.CLI_EXCEPTION_EVENT, 
                new CLIException(1, sdkOutput));            
        });

        childProcess.stdout.on('data', (data) => {
            var sdkOutput = data.toString('utf8');
            if(sdkOutput.includes('Enter password')){
                if(Context.CurrentAccountDetails.getPassword()){
                    childProcess.stdin.write(Context.CurrentAccountDetails.getPassword());
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
            if(code != 0){
                Context.EventEmitter.emit(ApplicationConstants.CLI_EXCEPTION_EVENT, 
                    new CLIException(2, `ERROR: SDK exited with code ${code}`));
            }
        });
      }
}