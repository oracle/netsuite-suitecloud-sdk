/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const FileSystemService = require('../FileSystemService');
const FileUtils = require('../../utils/FileUtils');
const CLISettings = require('./CLISettings');
const path = require('path');
const NodeTranslationService = require('../NodeTranslationService');
const {
	ERRORS: { SDK_SETTINGS_FILE },
} = require('../TranslationKeys');

const HOME_PATH = require('os').homedir();
const { FILES, FOLDERS } = require('../../ApplicationConstants');

const SDK_SETTINGS_FILEPATH = path.join(HOME_PATH, FOLDERS.SUITECLOUD_SDK, FILES.SDK_SETTINGS);

const CLI_SETTINGS_PROPERTIES_KEYS = ['isJavaVersionValid'];
const DEFAULT_CLI_SETTINGS = CLISettings.fromJson({
	isJavaVersionValid: false,
});

const VM_OPTION_VALIDATION_ERROR_NAME = 'VmOptionValidationError';
const SYNTAX_ERROR_NAME = 'SyntaxError';
class VmOptionValidationError extends Error {
	constructor(message) {
		super(message);
		this.name = VM_OPTION_VALIDATION_ERROR_NAME;
	}
}

let CACHED_CLI_SETTINGS;

module.exports = class CLISettingsService {
	constructor() {
		this._fileSystemService = new FileSystemService();
	}

	_saveSettings(cliSettings) {
		this._fileSystemService.createFolder(HOME_PATH, FOLDERS.SUITECLOUD_SDK);
		FileUtils.create(SDK_SETTINGS_FILEPATH, cliSettings);
	}

	_getSettings() {
		if (CACHED_CLI_SETTINGS) {
			return CACHED_CLI_SETTINGS;
		}
		if (FileUtils.exists(SDK_SETTINGS_FILEPATH)) {
			try {
				const cliSettingsJson = FileUtils.readAsJson(SDK_SETTINGS_FILEPATH);
				CACHED_CLI_SETTINGS = CLISettings.fromJson(cliSettingsJson);

				// check if the settings file has the expected properties
				if (!this._settingsFileHasExpectedProperties(cliSettingsJson) || this._settingsFileHasVmOptionsNotObjectType(cliSettingsJson)) {
					// regenerate the file with the missing properties default values
					this._saveSettings(CACHED_CLI_SETTINGS);
				}
				this._validateVmOptions(CACHED_CLI_SETTINGS.vmOptions);
				return CACHED_CLI_SETTINGS;
			} catch (error) {
				if (error && error.constructor && error.constructor.name) {
					if (error.constructor.name === SYNTAX_ERROR_NAME) {
						throw NodeTranslationService.getMessage(SDK_SETTINGS_FILE.WRONG_JSON_SYNTAX, SDK_SETTINGS_FILEPATH, error);
					}
					if (error.constructor.name === VM_OPTION_VALIDATION_ERROR_NAME) {
						throw NodeTranslationService.getMessage(SDK_SETTINGS_FILE.INVALID_CUSTOM_VM_OPTION, SDK_SETTINGS_FILEPATH, error);
					}
				}
				throw NodeTranslationService.getMessage(
					SDK_SETTINGS_FILE.GENERIC_PROBLEM,
					SDK_SETTINGS_FILEPATH,
					error
				);
			}
		}
		CACHED_CLI_SETTINGS = DEFAULT_CLI_SETTINGS;
		return DEFAULT_CLI_SETTINGS;
	}

	isJavaVersionValid() {
		return this._getSettings().isJavaVersionValid === true;
	}

	setJavaVersionValid(value) {
		const newSettings = this._getSettings().toJSON();
		if (newSettings.isJavaVersionValid === value) {
			return;
		}
		newSettings.isJavaVersionValid = value;
		CACHED_CLI_SETTINGS = CLISettings.fromJson(newSettings);
		this._saveSettings(CACHED_CLI_SETTINGS);
	}

	getCustomVmOptions() {
		return this._getSettings().vmOptions;
	}

	_settingsFileHasExpectedProperties(settingsFromFile) {
		return CLI_SETTINGS_PROPERTIES_KEYS.every((key) => settingsFromFile.hasOwnProperty(key));
	}

	_settingsFileHasVmOptionsNotObjectType(settingsFromFile) {
		if (!settingsFromFile.hasOwnProperty('vmOptions')) {
			return false;
		}

		if (settingsFromFile.vmOptions !== null && typeof settingsFromFile.vmOptions === 'object') {
			return false;
		}

		return true;
	}

	_validateVmOptions(vmOptions) {
		if (vmOptions === null || vmOptions === undefined) {
			return;
		}

		for (const [key, value] of Object.entries(vmOptions)) {
			// All vmOptions should be named '-Dx' and have at least another character
			if (!key.startsWith('-D') || key.lenght < 3) {
				throw new VmOptionValidationError(`vmOptions keys must start with '-D', and contain at least three characters.`);
			}
			if (typeof value !== 'string') {
				throw new VmOptionValidationError(`vmOptions keys only support string values.`);
			}
		}
	}
};
