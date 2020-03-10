/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
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
const { FILES, FOLDERS } = require('../../ApplicationConstants');

const CLI_SETTINGS_FILEPATH = path.join(
	HOME_PATH,
	FOLDERS.SUITECLOUD_SDK,
	FILES.CLI_SETTINGS
);

const CLI_SETTINGS_PROPERTIES_KEYS = ['proxyUrl', 'useProxy', 'isJavaVersionValid'];
const DEFAULT_CLI_SETTINGS = new CLISettings({
	useProxy: false,
	proxyUrl: '',
	isJavaVersionValid: false
});

let CACHED_CLI_SETTINGS;

module.exports = class CLISettingsService {
	constructor() {
		this._fileSystemService = new FileSystemService();
	}

	_saveSettings(cliSettings) {
		this._fileSystemService.createFolder(HOME_PATH, FOLDERS.SUITECLOUD_SDK);
		FileUtils.create(CLI_SETTINGS_FILEPATH, cliSettings);
	}

	_getSettings() {
		if (CACHED_CLI_SETTINGS) {
			return CACHED_CLI_SETTINGS;
		}
		if (FileUtils.exists(CLI_SETTINGS_FILEPATH)) {
			try {
				const cliSettingsJson = FileUtils.readAsJson(CLI_SETTINGS_FILEPATH);
				this._validateCLISettingsProperties(cliSettingsJson);
				CACHED_CLI_SETTINGS = CLISettings.fromJson(cliSettingsJson);
				return CLISettings.fromJson(cliSettingsJson);
			} catch (error) {
				throw TranslationService.getMessage(ERRORS.CLI_SETTINGS_FILE_CONTENT);
			}
		}
		CACHED_CLI_SETTINGS = DEFAULT_CLI_SETTINGS;
		return DEFAULT_CLI_SETTINGS;
	}

	isJavaVersionValid() {
		return this._getSettings().isJavaVersionValid;
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

	getProxyUrl() {
		return this._getSettings().proxyUrl;
	}

	setProxyUrl(url) {
		const newSettings = this._getSettings().toJSON();
		if (newSettings.proxyUrl === url && newSettings.useProxy === true) {
			return;
		}
		newSettings.useProxy = true;
		newSettings.proxyUrl = url;
		CACHED_CLI_SETTINGS = CLISettings.fromJson(newSettings);
		this._saveSettings(CACHED_CLI_SETTINGS);
	}

	useProxy() {
		return this._getSettings().useProxy;
	}

	clearProxy() {
		const newSettings = this._getSettings().toJSON();
		if (newSettings.useProxy === false) {
			return;
		}
		newSettings.useProxy = false;
		newSettings.proxyUrl = '';

		CACHED_CLI_SETTINGS = CLISettings.fromJson(newSettings);
		this._saveSettings(CACHED_CLI_SETTINGS);
	}

	_validateCLISettingsProperties(CLISettingsJson) {
		CLI_SETTINGS_PROPERTIES_KEYS.forEach(propertyKey => {
			if (!CLISettingsJson.hasOwnProperty(propertyKey)) {
				throw Error(
					`Missing ${propertyKey} property in the ${CLI_SETTINGS_FILEPATH} file.`
				);
			}
		});
	}
};
