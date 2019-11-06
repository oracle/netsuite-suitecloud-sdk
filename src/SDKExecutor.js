/*
 ** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const {
	SDK_DEVELOPMENT_MODE_JVM_OPTION,
	SDK_INTEGRATION_MODE_JVM_OPTION,
	SDK_CLIENT_PLATFORM_VERSION_JVM_OPTION,
	SDK_PROXY_JVM_OPTIONS,
	SDK_DIRECTORY_NAME,
	SDK_REQUIRED_JAVA_VERSION,
} = require('./ApplicationConstants');
const SDKProperties = require('./core/sdksetup/SDKProperties');
const path = require('path');
const FileUtils = require('./utils/FileUtils');
const spawn = require('child_process').spawn;
const CLISettingsService = require('./services/settings/CLISettingsService');
const EnvironmentInformationService = require('./services/EnvironmentInformationService');
const AccountDetailsService = require('./core/accountsetup/AccountDetailsService');
const url = require('url');
const TranslationService = require('./services/TranslationService');
const { ERRORS } = require('./services/TranslationKeys');
const SDKErrorCodes = require('./SDKErrorCodes');

module.exports.SDKExecutor = class SDKExecutor {
	constructor() {
		this._CLISettingsService = new CLISettingsService();
		this._accountDetailsService = new AccountDetailsService();
		this._environmentInformationService = new EnvironmentInformationService();
	}

	execute(executionContext) {
		const proxyOptions = this._getProxyOptions();
		const accountDetails = executionContext.includeAccountDetailsParams
			? this._accountDetailsService.get()
			: null;

		return new Promise((resolve, reject) => {
			let lastSdkOutput = '';
			let lastSdkError = '';

			if (!this._CLISettingsService.isJavaVersionValid()) {
				const javaVersionInstalled = this._environmentInformationService.getInstalledJavaVersionString();
				if (javaVersionInstalled.startsWith(SDK_REQUIRED_JAVA_VERSION)) {
					this._CLISettingsService.setJavaVersionValid(true);
				} else if (javaVersionInstalled === '') {
					reject(
						TranslationService.getMessage(
							ERRORS.CLI_SDK_JAVA_VERSION_NOT_INSTALLED,
							SDK_REQUIRED_JAVA_VERSION
						)
					);
					return;
				} else {
					reject(
						TranslationService.getMessage(
							ERRORS.CLI_SDK_JAVA_VERSION_NOT_COMPATIBLE,
							javaVersionInstalled,
							SDK_REQUIRED_JAVA_VERSION
						)
					);
					return;
				}
			}

			if (executionContext.includeAccountDetailsParams) {
				executionContext.addParam('account', accountDetails.accountId);
				executionContext.addParam('role', accountDetails.roleId);
				executionContext.addParam('email', accountDetails.email);
				executionContext.addParam('url', accountDetails.netSuiteUrl);
			}

			const cliParams = this._convertParamsObjToString(
				executionContext.getParams(),
				executionContext.getFlags()
			);

			const integrationModeOption = executionContext.isIntegrationMode()
				? SDK_INTEGRATION_MODE_JVM_OPTION
				: '';

			const developmentModeOption =
				accountDetails && accountDetails.isDevelopment
					? SDK_DEVELOPMENT_MODE_JVM_OPTION
					: '';

			const clientPlatformVersionOption = `${SDK_CLIENT_PLATFORM_VERSION_JVM_OPTION}=${process.versions.node}`;

			const sdkJarPath = path.join(
				__dirname,
				`../${SDK_DIRECTORY_NAME}/${SDKProperties.getSDKFileName()}`
			);
			if (!FileUtils.exists(sdkJarPath)) {
				throw TranslationService.getMessage(
					ERRORS.SDKEXECUTOR.NO_JAR_FILE_FOUND,
					path.join(__dirname, '..')
				);
			}
			const quotedSdkJarPath = `"${sdkJarPath}"`;
			const vmOptions = `${proxyOptions} ${integrationModeOption} ${developmentModeOption} ${clientPlatformVersionOption}`;
			const jvmCommand = `java -jar ${vmOptions} ${quotedSdkJarPath} ${executionContext.getCommand()} ${cliParams}`;

			const childProcess = spawn(jvmCommand, [], { shell: true });

			childProcess.stderr.on('data', data => {
				lastSdkError += data.toString('utf8');
			});

			childProcess.stdout.on('data', data => {
				lastSdkOutput += data.toString('utf8');
			});

			childProcess.on('close', code => {
				if (code === 0) {
					try {
						const output = executionContext.isIntegrationMode()
							? JSON.parse(lastSdkOutput)
							: lastSdkOutput;
						if (
							executionContext.isIntegrationMode &&
							output.errorCode &&
							output.errorCode === SDKErrorCodes.NO_TBA_SET_FOR_ACCOUNT
						) {
							reject(
								TranslationService.getMessage(
									ERRORS.SDKEXECUTOR.NO_TBA_FOR_ACCOUNT_AND_ROLE
								)
							);
						}
						resolve(output);
					} catch (error) {
						reject(
							TranslationService.getMessage(ERRORS.SDKEXECUTOR.RUNNING_COMMAND, error)
						);
					}
				} else if (code !== 0) {
					// check if the problem was due to bad Java Version
					const javaVersionInstalled = this._environmentInformationService.getInstalledJavaVersionString();
					if (!javaVersionInstalled.startsWith(SDK_REQUIRED_JAVA_VERSION)) {
						this._CLISettingsService.setJavaVersionValid(false);
						if (javaVersionInstalled === '') {
							reject(
								TranslationService.getMessage(
									ERRORS.CLI_SDK_JAVA_VERSION_NOT_INSTALLED,
									SDK_REQUIRED_JAVA_VERSION
								)
							);
							return;
						} else {
							reject(
								TranslationService.getMessage(
									ERRORS.CLI_SDK_JAVA_VERSION_NOT_COMPATIBLE,
									javaVersionInstalled,
									SDK_REQUIRED_JAVA_VERSION
								)
							);
							return;
						}
					}

					// java version was not the problem
					reject(
						TranslationService.getMessage(
							ERRORS.SDKEXECUTOR.SDK_ERROR,
							code,
							lastSdkError
						)
					);
				}
			});
		});
	}

	_getProxyOptions() {
		if (!this._CLISettingsService.useProxy()) {
			return '';
		}
		const proxyUrl = url.parse(this._CLISettingsService.proxyUrl());
		if (!proxyUrl.protocol || !proxyUrl.port || !proxyUrl.hostname) {
			throw TranslationService.getMessage(ERRORS.WRONG_PROXY_SETTING, cliSettings.proxyUrl);
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
