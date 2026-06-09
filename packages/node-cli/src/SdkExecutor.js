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
	SDK_EXECUTOR_NON_ALLOWED_PARAMETERS_REGEX,
	SDK_EXECUTOR_NON_ALLOWED_CONTROL_PARAMETERS,
	SDK_EXECUTOR_NON_ALLOWED_SYMBOLS,
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

		if (executionEnvironmentContext) {
			this._executionEnvironmentContext = executionEnvironmentContext;
		} else {
			this._executionEnvironmentContext = new ExecutionEnvironmentContext();
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

		this._validateJavaVersion();
		this._validateSdkJarExists();

		const args = [
			...this._getIntegrationModeArgs(executionContext),
			...this._getClientPlatformArgs(),
			...this._getCustomVmArgs(),
			'-jar',
			this._sdkPath,
			executionContext.getCommand(),
			...this._buildCliArgs(executionContext),
		];

		this._validateExecutionArgs(args);
		return spawn('java', args, { shell: false });
	}

	_validateJavaVersion() {
		if (!this._CLISettingsService.isJavaVersionValid()) {
			const javaVersionError = this._checkIfJavaVersionIssue();
			if (javaVersionError) {
				throw javaVersionError;
			}
		}
	}

	_validateSdkJarExists() {
		if (!FileUtils.exists(this._sdkPath)) {
			throw NodeTranslationService.getMessage(ERRORS.SDKEXECUTOR.NO_JAR_FILE_FOUND, path.join(__dirname, '..'));
		}
	}

	_getIntegrationModeArgs(executionContext) {
		return executionContext.isIntegrationMode() ? SDK_INTEGRATION_MODE_JVM_OPTIONS : [];
	}

	_getClientPlatformArgs() {
		return [
			`${SDK_CLIENT_PLATFORM_JVM_OPTION}=${this._executionEnvironmentContext.getPlatform()}`,
			`${SDK_CLIENT_PLATFORM_VERSION_JVM_OPTION}=${this._executionEnvironmentContext.getPlatformVersion()}`,
		];
	}

	_getCustomVmArgs() {
		const customVmOptions = this._CLISettingsService.getCustomVmOptions();
		if (!customVmOptions) {
			return [];
		}

		return Object.entries(customVmOptions).map(([vmOptionKey, vmOptionValue]) => {
			if (this._hasUnsupportedSDKExecutionCharacters(vmOptionKey)) {
				throw NodeTranslationService.getMessage(ERRORS.CLI_SDK_JAVA_UNSUPPORTED_CHARACTERS_IN_VM_OPTIONS_NAME, vmOptionKey,
					SDK_EXECUTOR_NON_ALLOWED_CONTROL_PARAMETERS, SDK_EXECUTOR_NON_ALLOWED_SYMBOLS);
			}
			if (this._hasUnsupportedSDKExecutionCharacters(vmOptionValue)) {
				throw NodeTranslationService.getMessage(ERRORS.CLI_SDK_JAVA_UNSUPPORTED_CHARACTERS_IN_VM_OPTIONS_VALUE, vmOptionValue,
					vmOptionKey, SDK_EXECUTOR_NON_ALLOWED_CONTROL_PARAMETERS, SDK_EXECUTOR_NON_ALLOWED_SYMBOLS);
			}

			return (vmOptionValue === '') ? vmOptionKey : `${vmOptionKey}=${String(vmOptionValue).trim()}`;
		});
	}

	_buildCliArgs(executionContext) {
		const params = executionContext.getParams();
		const executionParams = this._getExecutionParams(params);
		const flags = executionContext.getFlags();
		const executionFlags = flags && Array.isArray(flags) ? flags : [];

		return [...executionParams, ...executionFlags];
	}

	_validateExecutionArgs(args) {
		args.forEach((arg) => {
			if (this._hasUnsupportedSDKExecutionCharacters(arg)) {
				throw NodeTranslationService.getMessage(ERRORS.CLI_SDK_JAVA_UNSUPPORTED_CHARACTERS_GENERIC, arg,
					SDK_EXECUTOR_NON_ALLOWED_CONTROL_PARAMETERS, SDK_EXECUTOR_NON_ALLOWED_SYMBOLS);
			}
		});
	}

	_getExecutionParams(params) {
		const args = [];

		Object.entries(params).forEach(([param, paramValue]) => {
			args.push(param);
			if (paramValue) {
				if (typeof paramValue === 'string') {
					const splitParam = this._splitParameters(paramValue);
					for (const splitParamValue of splitParam) {
						if (this._hasUnsupportedSDKExecutionCharacters(splitParamValue)) {
							throw NodeTranslationService.getMessage(ERRORS.CLI_SDK_JAVA_UNSUPPORTED_CHARACTERS_IN_PARAMETER,
								CommandUtils.unquoteString(splitParamValue),
								param, SDK_EXECUTOR_NON_ALLOWED_CONTROL_PARAMETERS, SDK_EXECUTOR_NON_ALLOWED_SYMBOLS);
						}
						args.push(CommandUtils.unquoteString(splitParamValue));
					}
				} else {
					args.push(paramValue);
				}
			}
		});
		return args;
	}

	_hasUnsupportedSDKExecutionCharacters(value) {
		if (value === undefined || value === null) {
			return false;
		}
		return (SDK_EXECUTOR_NON_ALLOWED_PARAMETERS_REGEX.test(String(value)));
	}

	_splitParameters(value) {
		if (value === undefined || value === null) {
			return [];
		}

		const trimmedValue = value.trim();

		if (trimmedValue === "") {
			return [];
		}
		//We need to split words. Words are text groups separated by spaces. They can be surrounded by "" or not.
		//If they are surrounded by "" they may have spaces inside.
		const validParameterValueListPattern  = /^(?:"[^"]*"|[^"\s]+)(?:\s+(?:"[^"]*"|[^"\s]+))*$/;
		const parameterValueTokenPattern  = /"[^"]*"|[^"\s]+/g;

		if (!validParameterValueListPattern.test(trimmedValue)) {
			return [value];
		}

		return trimmedValue.match(parameterValueTokenPattern);
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
