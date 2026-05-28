/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const {
	SDK_INTEGRATION_MODE_JVM_OPTIONS,
	SDK_CLIENT_PLATFORM_JVM_OPTION,
	SDK_CLIENT_PLATFORM_VERSION_JVM_OPTION,
	SDK_COMPATIBLE_JAVA_VERSIONS,
} = require('./ApplicationConstants');
const path = require('path');
const FileUtils = require('./utils/FileUtils');
const CommandUtils = require('./utils/CommandUtils');
const spawn = require('child_process').spawn;
const CLISettingsService = require('./services/settings/CLISettingsService');
const EnvironmentInformationService = require('./services/EnvironmentInformationService');
const NodeTranslationService = require('./services/NodeTranslationService');
const { ERRORS } = require('./services/TranslationKeys');
const ExecutionEnvironmentContext = require('./ExecutionEnvironmentContext');

const DATA_EVENT = 'data';
const CLOSE_EVENT = 'close';
const UTF8 = 'utf8';

module.exports = class SdkExecutor {
	constructor(sdkPath, executionEnvironmentContext) {
		this._sdkPath = sdkPath;

		this._CLISettingsService = new CLISettingsService();
		this._environmentInformationService = new EnvironmentInformationService();
		this.childProcess = null;

		if (!executionEnvironmentContext) {
			this._executionEnvironmentContext = new ExecutionEnvironmentContext();
		} else {
			this._executionEnvironmentContext = executionEnvironmentContext;
		}
	}

	execute(executionContext, token) {
		return new Promise((resolve, reject) => {
			if (token !== undefined && token !== null) {
				token.cancel = (reason) => {
					this.childProcess.kill('SIGKILL');
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

	_addChildProcessListeners(isIntegrationMode, resolve, reject) {
		let lastSdkOutput = '';
		let lastSdkError = '';

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
					resolve(output);
				} catch (error) {
					reject(NodeTranslationService.getMessage(ERRORS.SDKEXECUTOR.RUNNING_COMMAND, error));
				}
			} else {
				const javaVersionError = this._checkIfJavaVersionIssue();
				if (javaVersionError) {
					reject(javaVersionError);
				}
				reject(NodeTranslationService.getMessage(ERRORS.SDKEXECUTOR.SDK_ERROR, code, lastSdkError));
			}
		});
	}

	_launchJvmCommand(executionContext) {
		if (!this._CLISettingsService.isJavaVersionValid()) {
			const javaVersionError = this._checkIfJavaVersionIssue();
			if (javaVersionError) {
				throw javaVersionError;
			}
		}

		if (!FileUtils.exists(this._sdkPath)) {
			throw NodeTranslationService.getMessage(ERRORS.SDKEXECUTOR.NO_JAR_FILE_FOUND, path.join(__dirname, '..'));
		}

		const args = [];

		if (executionContext.isIntegrationMode()) {
			args.push(...SDK_INTEGRATION_MODE_JVM_OPTIONS);
		}

		const clientPlatform = `${SDK_CLIENT_PLATFORM_JVM_OPTION}=${this._executionEnvironmentContext.getPlatform()}`;
		args.push(clientPlatform);

		const clientPlatformVersionOption = `${SDK_CLIENT_PLATFORM_VERSION_JVM_OPTION}=${this._executionEnvironmentContext.getPlatformVersion()}`;
		args.push(clientPlatformVersionOption);

		const customVmOptions = this._CLISettingsService.getCustomVmOptions();
		if (customVmOptions) {
			Object.keys(customVmOptions).forEach((vmOptionKey) => {
				if (customVmOptions[vmOptionKey] === '') {
					args.push(vmOptionKey);
				} else {
					args.push(`${vmOptionKey}=${customVmOptions[vmOptionKey].trim()}`);
				}
			});
		}

		args.push(
			'-jar',
			this._sdkPath,
			executionContext.getCommand());

		const params = executionContext.getParams();
		for (const param in params) {
			if (Object.hasOwn(params, param)) {
				this._validateAllowedCharacters(params[param], param);
				args.push(param);
				if (params[param]) {
					args.push(typeof params[param] === 'string' ? CommandUtils.unquoteString(params[param]) : params[param]);
				}
			}
		}

		const flags = executionContext.getFlags();
		if (flags && Array.isArray(flags)) {
			args.push(...flags);
		}

		return spawn('java', args, { shell: false });
	}

	_validateAllowedCharacters(value, fieldName = 'argument') {
		if (value === undefined || value === null) {
			return;
		}

		const stringValue = String(value);
		const allowedPattern = /^[a-zA-Z0-9._:/\\\-=\s]+$/;

		if (!allowedPattern.test(CommandUtils.unquoteString(stringValue))) {
			throw NodeTranslationService.getMessage(ERRORS.CLI_SDK_JAVA_UNSAFE_CHARACTERS_IN_PARAMETERS, fieldName, stringValue);
		}
	}

	_checkIfJavaVersionIssue() {
		const javaVersionInstalled = this._environmentInformationService.getInstalledJavaVersionString();
		for (const compatibleJavaVersion of SDK_COMPATIBLE_JAVA_VERSIONS) {
			if (javaVersionInstalled.startsWith(compatibleJavaVersion)) {
				this._CLISettingsService.setJavaVersionValid(true);
				return;
			}
		}

		this._CLISettingsService.setJavaVersionValid(false);
		if (javaVersionInstalled === '') {
			return NodeTranslationService.getMessage(ERRORS.CLI_SDK_JAVA_VERSION_NOT_INSTALLED, SDK_COMPATIBLE_JAVA_VERSIONS.join(', '));
		}
		return NodeTranslationService.getMessage(ERRORS.CLI_SDK_JAVA_VERSION_NOT_COMPATIBLE, javaVersionInstalled, SDK_COMPATIBLE_JAVA_VERSIONS.join(', '));
	}
};
