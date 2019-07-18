/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const FileSystemService = require('../FileSystemService');
const FileUtils = require('../../utils/FileUtils');
const UserPreferences = require('./UserPreferences');
const path = require('path');

const SDF_USER_PREFERENCES_FOLDER = '.sdf';
const HOME_PATH = require('os').homedir();
const NODEJS_CLI_FOLDER = 'nodejs-cli';
const USER_PREFERENCES_FILE = 'userpreferences.json';
const USER_PREFERENCES_FILEPATH = path.join(
	HOME_PATH,
	SDF_USER_PREFERENCES_FOLDER,
	NODEJS_CLI_FOLDER,
	USER_PREFERENCES_FILE
);

const DEFAULT_USER_PREFERENCES = new UserPreferences({
	useProxy: false,
	proxyUrl: '',
});

let CACHED_USER_PREFERENCES;

module.exports = class UserPreferencesService {
	constructor() {
		this._fileSystemService = new FileSystemService();
	}

	doesUserHavePreferencesSet() {
		return FileUtils.exists(USER_PREFERENCES_FILEPATH);
	}

	setUserPreferences(userPreferences) {
		this._createFolderIfDoesntExist(HOME_PATH, SDF_USER_PREFERENCES_FOLDER);
		this._createFolderIfDoesntExist(
			path.join(HOME_PATH, SDF_USER_PREFERENCES_FOLDER),
			NODEJS_CLI_FOLDER
		);
		FileUtils.create(USER_PREFERENCES_FILEPATH, userPreferences);
	}

	clearUserPreferences() {
		if (!this.doesUserHavePreferencesSet()) {
			return;
		}
		this.setUserPreferences(DEFAULT_USER_PREFERENCES);
		CACHED_USER_PREFERENCES = null;
	}

	getUserPreferences() {
		if (this.doesUserHavePreferencesSet()) {
			if (CACHED_USER_PREFERENCES) {
				return CACHED_USER_PREFERENCES;
			}
			const userPreferencesJson = FileUtils.readAsJson(USER_PREFERENCES_FILEPATH);
			const userPreferences = UserPreferences.fromJson(userPreferencesJson);
			CACHED_USER_PREFERENCES = userPreferences;
			return userPreferences;
		}
		return DEFAULT_USER_PREFERENCES;
	}

	_createFolderIfDoesntExist(parentDirectory, folder) {
		if (!this._fileSystemService.folderExists(path.join(parentDirectory, folder))) {
			this._fileSystemService.createFolder(parentDirectory, folder);
		}
	}
};
