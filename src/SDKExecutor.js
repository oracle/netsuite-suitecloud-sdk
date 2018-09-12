"use strict";
const Context = require('./Context');
const NodeUtils = require('./NodeUtils');
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
            NodeUtils.println(sdkOutput, NodeUtils.COLORS.RED);
        });

        childProcess.stdout.on('data', (data) => {
            var sdkOutput = data.toString('utf8');
            NodeUtils.println(sdkOutput, NodeUtils.COLORS.CYAN);
            if(sdkOutput.includes('Enter password')){
                childProcess.stdin.write(Context.CurrentAccountDetails.getPassword());
                childProcess.stdin.end();
            }
        });
      }
}