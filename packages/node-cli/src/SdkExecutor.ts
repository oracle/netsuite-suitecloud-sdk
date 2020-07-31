/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import {
	SDK_INTEGRATION_MODE_JVM_OPTION,
	SDK_CLIENT_PLATFORM_VERSION_JVM_OPTION,
	SDK_PROXY_JVM_OPTIONS,
	SDK_REQUIRED_JAVA_VERSION,
} from './ApplicationConstants';
import path from 'path';
import { exists } from './utils/FileUtils';
import { spawn, ChildProcess } from 'child_process';
import { CLISettingsService } from './services/settings/CLISettingsService';
import { getInstalledJavaVersionString } from './utils/EnvironmentInformationUtils';
import url from 'url';
import { NodeTranslationService } from './services/NodeTranslationService';
import { ERRORS } from './services/TranslationKeys';
import * as SdkErrorCodes from './SdkErrorCodes';
import { SdkExecutionContext } from './SdkExecutionContext';
import { OperationResult } from './utils/SdkOperationResultUtils';

const DATA_EVENT = 'data';
const CLOSE_EVENT = 'close';
const UTF8 = 'utf8';

export class SdkExecutor {
	private _sdkPath: string;
	private _CLISettingsService: CLISettingsService;
	private childProcess?: ChildProcess;

	constructor(sdkPath: string) {
		this._sdkPath = sdkPath;

		this._CLISettingsService = new CLISettingsService();
		this.childProcess = undefined;
	}

	execute(executionContext: SdkExecutionContext, token?: {cancel?: (x: string) => void}): Promise<OperationResult<any>> {
		return new Promise((resolve, reject) => {
			if (token !== undefined && token !== null) {
				token.cancel = (reason) => {
					if (this.childProcess) {
						this.childProcess.kill('SIGKILL');
					}
					reject(reason);
				};
			}
			try {
				this.childProcess = this._launchJvmCommand(executionContext);
				this._addChildProcessListeners(executionContext.isIntegrationMode(), resolve, reject);
			} catch (e) {
				reject(e);
			}
		});
	}

	_addChildProcessListeners(isIntegrationMode: boolean, resolve: (value?: any) => void, reject: (reason?: any) => void) {
		let lastSdkOutput = '';
		let lastSdkError = '';
		if (!this.childProcess || !this.childProcess.stderr || !this.childProcess.stdout) {
			return;
		}

		this.childProcess.stderr.on(DATA_EVENT, (data) => {
			lastSdkError += data.toString(UTF8);
		});

		this.childProcess.stdout.on(DATA_EVENT, (data) => {
			lastSdkOutput += data.toString(UTF8);
		});

		this.childProcess.on(CLOSE_EVENT, (code) => {
			if (code === 0) {
				try {
					const output = isIntegrationMode ? JSON.parse(lastSdkOutput) : lastSdkOutput;
					if (isIntegrationMode && output.errorCode && output.errorCode === SdkErrorCodes.NO_TBA_SET_FOR_ACCOUNT) {
						reject(NodeTranslationService.getMessage(ERRORS.SDKEXECUTOR.NO_TBA_FOR_ACCOUNT_AND_ROLE));
					}
					resolve(output);
				} catch (error) {
					reject(NodeTranslationService.getMessage(ERRORS.SDKEXECUTOR.RUNNING_COMMAND, error));
				}
			} else {
				reject(NodeTranslationService.getMessage(ERRORS.SDKEXECUTOR.SDK_ERROR, code, lastSdkError));
			}
		});
	}

	_launchJvmCommand(executionContext: SdkExecutionContext) {
		if (!this._CLISettingsService.isJavaVersionValid()) {
			const javaVersionError = this._checkIfJavaVersionIssue();
			if (javaVersionError) {
				throw javaVersionError;
			}
		}

		const proxyOptions = this._getProxyOptions();
		const cliParams = this._convertParamsObjToString(executionContext.getParams(), executionContext.getFlags());

		const integrationModeOption = executionContext.isIntegrationMode() ? SDK_INTEGRATION_MODE_JVM_OPTION : '';

		const clientPlatformVersionOption = `${SDK_CLIENT_PLATFORM_VERSION_JVM_OPTION}=${process.versions.node}`;

		if (!exists(this._sdkPath)) {
			throw NodeTranslationService.getMessage(ERRORS.SDKEXECUTOR.NO_JAR_FILE_FOUND, path.join(__dirname, '..'));
		}
		const quotedSdkJarPath = `"${this._sdkPath}"`;

		const vmOptions = `${proxyOptions} ${integrationModeOption} ${clientPlatformVersionOption}`;
		const jvmCommand = `java -jar ${vmOptions} ${quotedSdkJarPath} ${executionContext.getCommand()} ${cliParams}`;

		return spawn(jvmCommand, [], { shell: true });
	}

	_getProxyOptions() {
		if (!this._CLISettingsService.useProxy()) {
			return '';
		}
		const proxyUrl = url.parse(this._CLISettingsService.getProxyUrl());
		if (!proxyUrl.protocol || !proxyUrl.port || !proxyUrl.hostname) {
			throw NodeTranslationService.getMessage(ERRORS.WRONG_PROXY_SETTING, proxyUrl);
		}
		const protocolWithoutColon = proxyUrl.protocol.slice(0, -1);
		const hostName = proxyUrl.hostname;
		const port = proxyUrl.port;
		const { PROTOCOL, HOST, PORT } = SDK_PROXY_JVM_OPTIONS;

		return `${PROTOCOL}=${protocolWithoutColon} ${HOST}=${hostName} ${PORT}=${port}`;
	}

	_convertParamsObjToString(cliParams: {[x: string]: string}, flags: string[]) {
		let cliParamsAsString = '';
		for (const param in cliParams) {
			if (cliParams.hasOwnProperty(param)) {
				const value = cliParams[param] ? ` ${cliParams[param]} ` : ' ';
				cliParamsAsString += param + value;
			}
		}

		if (flags && Array.isArray(flags)) {
			flags.forEach((flag) => {
				cliParamsAsString += ` ${flag} `;
			});
		}

		return cliParamsAsString;
	}

	_checkIfJavaVersionIssue() {
		const javaVersionInstalled = getInstalledJavaVersionString();
		if (javaVersionInstalled.startsWith(SDK_REQUIRED_JAVA_VERSION)) {
			this._CLISettingsService.setJavaVersionValid(true);
			return;
		}

		this._CLISettingsService.setJavaVersionValid(false);
		if (javaVersionInstalled === '') {
			return NodeTranslationService.getMessage(ERRORS.CLI_SDK_JAVA_VERSION_NOT_INSTALLED, SDK_REQUIRED_JAVA_VERSION);
		}
		return NodeTranslationService.getMessage(ERRORS.CLI_SDK_JAVA_VERSION_NOT_COMPATIBLE, javaVersionInstalled, SDK_REQUIRED_JAVA_VERSION);
	}
};
