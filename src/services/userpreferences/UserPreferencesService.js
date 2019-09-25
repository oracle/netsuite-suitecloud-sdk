/*
 ** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const FileSystemService = require('../FileSystemService');
const FileUtils = require('../../utils/FileUtils');
const UserPreferences = require('./UserPreferences');
const path = require('path');
const TranslationService = require('../TranslationService');
const { ERRORS } = require('../TranslationKeys');

const HOME_PATH = require('os').homedir();
const { FILE_NAMES, FOLDER_NAMES } = require('../../ApplicationConstants');

const USER_PREFERENCES_FILEPATH = path.join(
	HOME_PATH,
	FOLDER_NAMES.USER_PREFERENCES,
	FILE_NAMES.USER_PREFERENCES
);

const USER_PREFERENCES_PROPERTIES_KEYS = ['proxyUrl', 'useProxy'];
const DEFAULT_USER_PREFERENCES = new UserPreferences({
	useProxy: false,
	proxyUrl: '',
});

let CACHED_USER_PREFERENCES;

module.exports = class UserPreferencesService {
	constructor() {
		this._fileSystemService = new FileSystemService();
	}

	hasUserPreferences() {
		return FileUtils.exists(USER_PREFERENCES_FILEPATH);
	}

	setUserPreferences(userPreferences) {
		this._fileSystemService.createFolder(HOME_PATH, FOLDER_NAMES.USER_PREFERENCES);
		FileUtils.create(USER_PREFERENCES_FILEPATH, userPreferences);
	}

	clearUserPreferences() {
		if (!this.hasUserPreferences()) {
			return;
		}
		this.setUserPreferences(DEFAULT_USER_PREFERENCES);
		CACHED_USER_PREFERENCES = null;
	}

	getUserPreferences() {
		if (this.hasUserPreferences()) {
			if (CACHED_USER_PREFERENCES) {
				return CACHED_USER_PREFERENCES;
			}
			let userPreferencesJson;
			try {
				userPreferencesJson = FileUtils.readAsJson(`${USER_PREFERENCES_FILEPATH}`);
			} catch (error) {
				throw `${TranslationService.getMessage(
					ERRORS.JSON_PARSING_PROBLEM,
					USER_PREFERENCES_FILEPATH
				)}\n${TranslationService.getMessage(ERRORS.USER_PREFERENCES_FILE_CONTENT)}`;
			}
			this._validateUserPreferencesFileStructure(userPreferencesJson);
			const userPreferences = UserPreferences.fromJson(userPreferencesJson);
			CACHED_USER_PREFERENCES = userPreferences;
			return userPreferences;
		}
		return DEFAULT_USER_PREFERENCES;
	}

	_validateUserPreferencesFileStructure(userPreferencesJson) {
		USER_PREFERENCES_PROPERTIES_KEYS.forEach(propertyKey => {
			if (!userPreferencesJson.hasOwnProperty(propertyKey)) {
				throw TranslationService.getMessage(ERRORS.USER_PREFERENCES_FILE_CONTENT);
			}
		});
	}
};
