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
				const value = cliParams[param] ? ` ${cliParams[param]} ` : ' ';
				cliParamsAsString += param + value;
			}
		}
		return cliParamsAsString;
	}

	execute(executionContext) {
		return new Promise((resolve, reject) => {
            let lastSdkOutput;
			let cliParams = this._getCLIParamsFrom(executionContext);
			const cliParamsAsString = this._convertParamsObjToString(cliParams);

			const jvmCommand = `${ConfigurationService.getConfig().jvmInvocationOptions} "${
				Context.SDKFilePath
			}" ${executionContext.getCommand()} ${cliParamsAsString}`;

			const childProcess = spawn(jvmCommand, [], { shell: true });

			childProcess.stderr.on('data', data => {
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

                lastSdkOutput = sdkOutput;
				if (executionContext.showOutput) {
					NodeUtils.println(sdkOutput, NodeUtils.COLORS.CYAN);
				}
			});

			childProcess.on('close', code => {
				if (code === 0) {
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

module.exports.SDKExecutionContext = class SDKExecutionContext {
	constructor(options) {
		this._command = options.command;
		this._showOutput =  typeof options.showOutput === 'undefined' ?  true : options.showOutput;
		this._params = {};

		if (options.params) {
			Object.keys(options.params).forEach(key => {
				this.addParam(key, options.params[key]);
			});
		}
	}

	get showOutput() {
		return this._showOutput;
	}

	getCommand() {
		return this._command;
	}

	addParam(name, value) {
		this._params[`-${name}`] = value;
	}

	getParams() {
		return this._params;
	}
};
