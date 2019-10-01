/*
 ** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const FileSystemService = require('../FileSystemService');
const FileUtils = require('../../utils/FileUtils');
const CLISettings = require('./CLISettings');
const path = require('path');
const TranslationService = require('../TranslationService');
const { ERRORS } = require('../TranslationKeys');

const HOME_PATH = require('os').homedir();
const { FILE_NAMES, FOLDER_NAMES } = require('../../ApplicationConstants');

const CLI_SETTINGS_FILEPATH = path.join(
	HOME_PATH,
	FOLDER_NAMES.SUITECLOUD_SDK,
	FILE_NAMES.CLI_SETTINGS
);

const CLI_SETTINGS_PROPERTIES_KEYS = ['proxyUrl', 'useProxy'];
const DEFAULT_CLI_SETTINGS = new CLISettings({
	useProxy: false,
	proxyUrl: '',
});

let CACHED_CLI_SETTINGS;

module.exports = class CLISettingsService {
	constructor() {
		this._fileSystemService = new FileSystemService();
	}

	hasCLISettings() {
		return FileUtils.exists(CLI_SETTINGS_FILEPATH);
	}

	setCLISettings(cliSettings) {
		this._fileSystemService.createFolder(HOME_PATH, FOLDER_NAMES.SUITECLOUD_SDK);
		FileUtils.create(CLI_SETTINGS_FILEPATH, cliSettings);
	}

	clearCLISettings() {
		if (!this.hasCLISettings()) {
			return;
		}
		this.setCLISettings(DEFAULT_CLI_SETTINGS);
		CACHED_CLI_SETTINGS = null;
	}

	getCLISettings() {
		if (this.hasCLISettings()) {
			if (CACHED_CLI_SETTINGS) {
				return CACHED_CLI_SETTINGS;
			}
			try {
				const cliSettingsJson = FileUtils.readAsJson(CLI_SETTINGS_FILEPATH);
				this._validateCLISettingsProperties(cliSettingsJson);
				const cliSettings = CLISettings.fromJson(cliSettingsJson);
				CACHED_CLI_SETTINGS = cliSettings;
				return cliSettings;
			} catch (error) {
				throw TranslationService.getMessage(ERRORS.USER_PREFERENCES_FILE_CONTENT);
			}	
		}
		return DEFAULT_CLI_SETTINGS;
	}

	_validateCLISettingsProperties(CLISettingsJson) {
		CLI_SETTINGS_PROPERTIES_KEYS.forEach(propertyKey => {
			if (!CLISettingsJson.hasOwnProperty(propertyKey)) {
				throw Error(`Missing ${propertyKey} property in the ${CLI_SETTINGS_FILEPATH} file.`);
			}
		});
	}
};
