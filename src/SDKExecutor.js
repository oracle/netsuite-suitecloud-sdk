/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const {
	SDK_DEVELOPMENT_MODE_JVM_OPTION,
	SDK_INTEGRATION_MODE_JVM_OPTION,
	SDK_PROXY_JVM_OPTIONS,
	SDK_DIRECTORY_NAME,
	SDK_FILENAME,
} = require('./ApplicationConstants');
const path = require('path');
const spawn = require('child_process').spawn;
const UserPreferencesService = require('./services/userpreferences/UserPreferencesService');
const AccountDetailsService = require('./core/accountsetup/AccountDetailsService');
const url = require('url');
const TranslationService = require('./services/TranslationService');
const { ERRORS } = require('./services/TranslationKeys');

module.exports.SDKExecutor = class SDKExecutor {

	constructor() {
		this._userPreferencesService = new UserPreferencesService();
		this._accountDetailsService = new AccountDetailsService();
	}

	execute(executionContext) {
		const proxyOptions = this._getProxyOptions();
		const accountDetails = executionContext.includeAccountDetailsParams ? this._accountDetailsService.get() : null;

		return new Promise((resolve, reject) => {
			let lastSdkOutput = '';

			if (executionContext.includeAccountDetailsParams) {
				executionContext.addParam('account', accountDetails.accountId);
				executionContext.addParam('role', accountDetails.roleId);
				executionContext.addParam('email', accountDetails.email);
				executionContext.addParam('url', accountDetails.netSuiteUrl);
			}

			const cliParams = this._convertParamsObjToString(
				executionContext.getParams(),
				executionContext.getFlags(),
			);

			const integrationModeOption = executionContext.isIntegrationMode()
				? SDK_INTEGRATION_MODE_JVM_OPTION
				: '';

			const developmentModeOption = accountDetails && accountDetails.isDevelopment
				? SDK_DEVELOPMENT_MODE_JVM_OPTION
				: '';

			const sdkJarPath = `"${path.join(__dirname, `../${SDK_DIRECTORY_NAME}/${SDK_FILENAME}`)}"`;
			const vmOptions = `${proxyOptions} ${integrationModeOption} ${developmentModeOption}`;
			const jvmCommand = `java -jar ${vmOptions} ${sdkJarPath} ${executionContext.getCommand()} ${cliParams}`;

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
							TranslationService.getMessage(ERRORS.SDKEXECUTOR.RUNNING_COMMAND, error),
						);
					}
				} else if (code !== 0) {
					reject(TranslationService.getMessage(ERRORS.SDKEXECUTOR.SDK_ERROR, code));
				}
			});
		});
	}

	_getProxyOptions() {
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
