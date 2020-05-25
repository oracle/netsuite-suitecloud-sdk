/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const {
	SDK_INTEGRATION_MODE_JVM_OPTION,
	SDK_CLIENT_PLATFORM_VERSION_JVM_OPTION,
	SDK_PROXY_JVM_OPTIONS,
	SDK_REQUIRED_JAVA_VERSION,
} = require('./ApplicationConstants');
const path = require('path');
const FileUtils = require('./utils/FileUtils');
const spawn = require('child_process').spawn;
const CLISettingsService = require('./services/settings/CLISettingsService');
const EnvironmentInformationService = require('./services/EnvironmentInformationService');
const url = require('url');
const NodeTranslationService = require('./services/NodeTranslationService');
const { ERRORS } = require('./services/TranslationKeys');
const SdkErrorCodes = require('./SdkErrorCodes');

const DATA_EVENT = 'data';
const CLOSE_EVENT = 'close';
const UTF8 = 'utf8';

module.exports = class SdkExecutor {
	constructor(sdkPath) {

		this._sdkPath = sdkPath;

		this._CLISettingsService = new CLISettingsService();
		this._environmentInformationService = new EnvironmentInformationService();
	}

	execute(executionContext) {
		const proxyOptions = this._getProxyOptions();

		return new Promise((resolve, reject) => {
			let lastSdkOutput = '';
			let lastSdkError = '';

			if (!this._CLISettingsService.isJavaVersionValid()) {
				const javaVersionError = this._checkIfJavaVersionIssue();
				if (javaVersionError) {
					reject(javaVersionError);
					return;
				}
			}

			const cliParams = this._convertParamsObjToString(
				executionContext.getParams(),
				executionContext.getFlags()
			);

			const integrationModeOption = executionContext.isIntegrationMode()
				? SDK_INTEGRATION_MODE_JVM_OPTION
				: '';

			const clientPlatformVersionOption = `${SDK_CLIENT_PLATFORM_VERSION_JVM_OPTION}=${process.versions.node}`;

			console.log(`SdkExecutor: sdkPath is ${JSON.stringify(this._sdkPath)}`);
			if (!FileUtils.exists(this._sdkPath)) {
				throw NodeTranslationService.getMessage(
					ERRORS.SDKEXECUTOR.NO_JAR_FILE_FOUND,
					path.join(__dirname, '..')
				);
			}
			const quotedSdkJarPath = `"${this._sdkPath}"`;
			
			const vmOptions = `${proxyOptions} ${integrationModeOption} ${clientPlatformVersionOption}`;
			const jvmCommand = `java -jar ${vmOptions} ${quotedSdkJarPath} ${executionContext.getCommand()} ${cliParams}`;

			const childProcess = spawn(jvmCommand, [], { shell: true });

			childProcess.stderr.on(DATA_EVENT, data => {
				lastSdkError += data.toString(UTF8);
			});

			childProcess.stdout.on(DATA_EVENT, data => {
				lastSdkOutput += data.toString(UTF8);
			});

			childProcess.on(CLOSE_EVENT, code => {
				if (code === 0) {
					try {
						const output = executionContext.isIntegrationMode()
							? JSON.parse(lastSdkOutput)
							: lastSdkOutput;
						if (
							executionContext.isIntegrationMode &&
							output.errorCode &&
							output.errorCode === SdkErrorCodes.NO_TBA_SET_FOR_ACCOUNT
						) {
							reject(
								NodeTranslationService.getMessage(
									ERRORS.SDKEXECUTOR.NO_TBA_FOR_ACCOUNT_AND_ROLE
								)
							);
						}
						resolve(output);
					} catch (error) {
						reject(
							NodeTranslationService.getMessage(ERRORS.SDKEXECUTOR.RUNNING_COMMAND, error)
						);
					}
				} else if (code !== 0) {
					// check if the problem was due to bad Java Version
					const javaVersionError = this._checkIfJavaVersionIssue();

					const sdkErrorMessage = NodeTranslationService.getMessage(
						ERRORS.SDKEXECUTOR.SDK_ERROR,
						code,
						lastSdkError
					);

					reject(javaVersionError ? javaVersionError : sdkErrorMessage);
				}
			});
		});
	}

	_getProxyOptions() {
		if (!this._CLISettingsService.useProxy()) {
			return '';
		}
		const proxyUrl = url.parse(this._CLISettingsService.getProxyUrl());
		if (!proxyUrl.protocol || !proxyUrl.port || !proxyUrl.hostname) {
			throw NodeTranslationService.getMessage(ERRORS.WRONG_PROXY_SETTING, cliSettings.proxyUrl);
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

	_checkIfJavaVersionIssue() {
		const javaVersionInstalled = this._environmentInformationService.getInstalledJavaVersionString();
		if (javaVersionInstalled.startsWith(SDK_REQUIRED_JAVA_VERSION)) {
			this._CLISettingsService.setJavaVersionValid(true);
			return;
		}

		this._CLISettingsService.setJavaVersionValid(false);
		if (javaVersionInstalled === '') {
			return NodeTranslationService.getMessage(
				ERRORS.CLI_SDK_JAVA_VERSION_NOT_INSTALLED,
				SDK_REQUIRED_JAVA_VERSION
			);
		}
		return NodeTranslationService.getMessage(
			ERRORS.CLI_SDK_JAVA_VERSION_NOT_COMPATIBLE,
			javaVersionInstalled,
			SDK_REQUIRED_JAVA_VERSION
		);
	}
};
