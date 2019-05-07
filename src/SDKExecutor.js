'use strict';

const Context = require('./Context');
const CryptoUtils = require('./utils/CryptoUtils');
const CLIException = require('./CLIException');
const ApplicationConstants = require('./ApplicationConstants');
const spawn = require('child_process').spawn;
const ConfigurationService = require('./services/ConfigurationService');
const TranslationService = require('./services/TranslationService');
const { ERRORS } = require('./services/TranslationKeys');

module.exports.SDKExecutor = class SDKExecutor {
	_convertParamsObjToString(cliParams, flags) {
		let cliParamsAsString = '';
		for (const param in cliParams) {
			if (cliParams.hasOwnProperty(param)) {
				const value = cliParams[param] ? ` ${cliParams[param]} ` : ' ';
				cliParamsAsString += param + value;
			}
		}

		if (flags && Array.isArray(flags)) {
			flags.forEach(flag => {
				cliParamsAsString += ` ${flag} `;
			});
		}

		return cliParamsAsString;
	}

	execute(executionContext) {
		return new Promise((resolve, reject) => {
			let lastSdkOutput = '';
			const cliParamsAsString = this._convertParamsObjToString(
				executionContext.getParams(),
				executionContext.getFlags()
			);

			const integrationModeOption = executionContext.isIntegrationMode()
				? ApplicationConstants.SDK_INTEGRATION_MODE_JVM_OPTION
				: '';

			const jvmCommand = `${
				ConfigurationService.getConfig().jvmInvocationOptions
			} ${integrationModeOption} "${
				Context.SDKFilePath
			}" ${executionContext.getCommand()} ${cliParamsAsString}`;

			const childProcess = spawn(jvmCommand, [], { shell: true });

			childProcess.stderr.on('data', data => {
				const sdkOutput = data.toString('utf8');
				reject(new CLIException(1, sdkOutput));
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
						reject(new CLIException(3, TranslationService.getMessage(ERRORS.SDKEXECUTOR.AUTHENTICATION)));
						childProcess.kill('SIGINT');
					}
					return;
				}

				lastSdkOutput += sdkOutput;
			});

			childProcess.on('close', code => {
				if (code === 0) {
					try {
						const output = executionContext.isIntegrationMode()
							? JSON.parse(lastSdkOutput)
							: lastSdkOutput;
						resolve(output);
					} catch (error) {
						reject(
							new CLIException(
								2,
								TranslationService.getMessage(ERRORS.SDKEXECUTOR.RUNNING_COMMAND, error)
							)
						);
					}
				} else if (code !== 0) {
					reject(new CLIException(2, TranslationService.getMessage(ERRORS.SDKEXECUTOR.SDK_ERROR, code)));
				}
			});
		});
	}
};
