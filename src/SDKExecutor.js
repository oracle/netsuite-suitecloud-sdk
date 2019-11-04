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
} = require('./ApplicationConstants');
const SDKProperties = require('./core/sdksetup/SDKProperties');
const path = require('path');
const FileUtils = require('./utils/FileUtils');
const spawn = require('child_process').spawn;
const CLISettingsService = require('./services/settings/CLISettingsService');
const url = require('url');
const TranslationService = require('./services/TranslationService');
const { ERRORS } = require('./services/TranslationKeys');
const SDKErrorCodes = require('./SDKErrorCodes');
const AuthenticationService = require('./core/authentication/AuthenticationService');

module.exports.SDKExecutor = class SDKExecutor {
	constructor() {
		this._CLISettingsService = new CLISettingsService();
		this._authenticationService = new AuthenticationService();
	}

	execute(executionContext) {
		const proxyOptions = this._getProxyOptions();
		const authId = executionContext.includeProjectDefaultAuthId
			? this._authenticationService.getProjectDefaultAuthId()
			: null;

		return new Promise((resolve, reject) => {
			let lastSdkOutput = '';

			if (executionContext.includeProjectDefaultAuthId) {
				executionContext.addParam('authId', authId);
			}

			const cliParams = this._convertParamsObjToString(
				executionContext.getParams(),
				executionContext.getFlags()
			);

			const integrationModeOption = executionContext.isIntegrationMode()
				? SDK_INTEGRATION_MODE_JVM_OPTION
				: '';

			const developmentModeOption = SDK_DEVELOPMENT_MODE_JVM_OPTION; //HARDCODED: this should be in the SDK

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
			const jvmCommand = `java -jar ${vmOptions} -DintegrationConsumerKey=b05d56072f779a7a11ccf0f8d1cd337beead2e788d91ac5fed2ba4a439cc16c5 -DintegrationConsumerSecret=ddefd9d9744bec6162167413c6fd493920e635dffba400e237be9e0829dd9452  ${quotedSdkJarPath} ${executionContext.getCommand()} ${cliParams}`;

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
					reject(TranslationService.getMessage(ERRORS.SDKEXECUTOR.SDK_ERROR, code));
				}
			});
		});
	}

	_getProxyOptions() {
		const cliSettings = this._CLISettingsService.getSettings();
		if (!cliSettings.useProxy) {
			return '';
		}
		const proxyUrl = url.parse(cliSettings.proxyUrl);
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
