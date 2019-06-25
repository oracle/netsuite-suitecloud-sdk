'use strict';

const {
	SDK_INTEGRATION_MODE_JVM_OPTION,
	SDK_PROXY_JVM_OPTIONS,
	SDF_SDK_PATHNAME,
} = require('./ApplicationConstants');
const path = require('path');
const spawn = require('child_process').spawn;
const UserPreferencesService = require('./services/userpreferences/UserPreferencesService');
const url = require('url');
const TranslationService = require('./services/TranslationService');
const { ERRORS } = require('./services/TranslationKeys');

module.exports.SDKExecutor = class SDKExecutor {
	constructor() {
		this._userPreferencesService = new UserPreferencesService();
	}

	execute(executionContext) {
		const proxyJarSettings = this._getProxySettingsIfSet();
		return new Promise((resolve, reject) => {
			let lastSdkOutput = '';
			const cliParamsAsString = this._convertParamsObjToString(
				executionContext.getParams(),
				executionContext.getFlags()
			);

			const integrationModeOption = executionContext.isIntegrationMode()
				? SDK_INTEGRATION_MODE_JVM_OPTION
				: '';

			const jvmCommand = `java ${proxyJarSettings} -jar ${integrationModeOption} "${path.join(
				__dirname,
				SDF_SDK_PATHNAME
			)}" ${executionContext.getCommand()} ${cliParamsAsString}`;

			const childProcess = spawn(jvmCommand, [], { shell: true });

			childProcess.stderr.on('data', data => {
				const sdkOutput = data.toString('utf8');
				reject(sdkOutput);
			});

			childProcess.stdout.on('data', data => {
				const sdkOutput = data.toString('utf8');
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
							TranslationService.getMessage(ERRORS.SDKEXECUTOR.RUNNING_COMMAND, error)
						);
					}
				} else if (code !== 0) {
					reject(TranslationService.getMessage(ERRORS.SDKEXECUTOR.SDK_ERROR, code));
				}
			});
		});
	}

	_getProxySettingsIfSet() {
		const userPreferences = this._userPreferencesService.getUserPreferences();
		if (!userPreferences.useProxy) {
			return '';
		}
		const proxyUrl = url.parse(userPreferences.proxyUrl);
		if (!proxyUrl.protocol || !proxyUrl.port || !proxyUrl.hostname) {
			throw TranslationService.getMessage(
				ERRORS.WRONG_PROXY_SETTING,
				userPreferences.proxyUrl
			);
		}
		const protocolWithoutColon = proxyUrl.protocol.slice(0, -1);
		const hostName = proxyUrl.hostname;
		const port = proxyUrl.port;
		const { PROTOCOL, HOST, PORT } = SDK_PROXY_JVM_OPTIONS;
		return `${PROTOCOL}=${protocolWithoutColon} ${HOST}=${hostName} ${PORT}=${port}`;
	}

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
};
