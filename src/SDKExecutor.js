'use strict';

const Context = require('./Context');
const NodeUtils = require('./utils/NodeUtils');
const CryptoUtils = require('./utils/CryptoUtils');
const CLIException = require('./CLIException');
const ApplicationConstants = require('./ApplicationConstants');
const spawn = require('child_process').spawn;
const ConfigurationService = require('./services/ConfigurationService');
const CliSpinner = require('./ui/CliSpinner');

module.exports.SDKExecutor = class SDKExecutor {

	constructor() {
		this._spinner = new CliSpinner();
	}

	_convertParamsObjToString(cliParams, flags) {
		let cliParamsAsString = '';
		for (var param in cliParams) {
			if (cliParams.hasOwnProperty(param)) {
				const value = cliParams[param] ? ` ${cliParams[param]} ` : ' ';
				cliParamsAsString += param + value;
			}
        }

        if(flags && Array.isArray(flags)){
            flags.forEach(flag => {
                cliParamsAsString += ` ${flag} `;
            })
        }

		return cliParamsAsString;
	}

	execute(executionContext) {
		return new Promise((resolve, reject) => {
            let lastSdkOutput ='';
			const cliParamsAsString = this._convertParamsObjToString(executionContext.getParams(), executionContext.getFlags());

			const jvmCommand = `${ConfigurationService.getConfig().jvmInvocationOptions} "${
				Context.SDKFilePath
			}" ${executionContext.getCommand()} ${cliParamsAsString}`;

			if (executionContext.displaySpinner()) {
				this._spinner.setSpinnerTitle(executionContext.getSpinnerMessage());
				this._spinner.start();
			}

			const childProcess = spawn(jvmCommand, [], { shell: true });

			childProcess.stderr.on('data', data => {
				if (executionContext.displaySpinner()) {
					this._spinner.stop();
				}

				const sdkOutput = data.toString('utf8');
				Context.EventEmitter.emit(
					ApplicationConstants.CLI_EXCEPTION_EVENT,
					new CLIException(1, sdkOutput)
				);
				reject(sdkOutput);
			});

			childProcess.stdout.on('data', data => {
				const sdkOutput = data.toString('utf8');
				if (sdkOutput.includes('Enter password')) {
					if (
						Context.CurrentAccountDetails.getPassword() &&
						Context.CurrentAccountDetails.getEncryptionKey()
					) {
						const password = Context.CurrentAccountDetails.getPassword();
						const encryptionKey = Context.CurrentAccountDetails.getEncryptionKey();
						childProcess.stdin.write(CryptoUtils.decrypt(password, encryptionKey));
						childProcess.stdin.end();
					} else {
						Context.EventEmitter.emit(
							ApplicationConstants.CLI_EXCEPTION_EVENT,
							new CLIException(3, 'Authentication error: please run "sdf setup"')
						);
						childProcess.kill('SIGINT');
					}
					return;
                }

                lastSdkOutput += sdkOutput;
			});

			childProcess.on('close', code => {
				if (executionContext.displaySpinner()) {
					this._spinner.stop();
				}

				if (code === 0) {
                    if (executionContext.showOutput) {
                        NodeUtils.println(lastSdkOutput, NodeUtils.COLORS.CYAN);
                    }
					resolve(lastSdkOutput);
				} else if (code !== 0) {
					var exceptionMessage = `ERROR: SDK exited with code ${code}`;
					Context.EventEmitter.emit(
						ApplicationConstants.CLI_EXCEPTION_EVENT,
						new CLIException(2, exceptionMessage)
					);
					reject(exceptionMessage);
				}
			});
		});
	}
};

