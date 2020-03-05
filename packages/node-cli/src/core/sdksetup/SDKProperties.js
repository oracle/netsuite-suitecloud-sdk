/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const path = require('path');
const fs = require('fs');
const ROOT_DIRECTORY = path.dirname(require.main.filename);
const CONFIG_FILE = './config.json';
const PACKAGE_FILE = `${ROOT_DIRECTORY}/package.json`;
const { SDK_FILENAME } = require('../../ApplicationConstants');

let CONFIG_FILE_CACHE = null;

class SDKProperties {
	constructor() {
		this._loadCache();
	}

	getDownloadURL() {
		// read config.js file if exists or use package.json
		const configFile = this.configFileExists() ? CONFIG_FILE_CACHE : require(PACKAGE_FILE);
		return configFile.sdkDownloadUrl;
	}

	getSDKFileName() {
		return this.configFileExists() ? CONFIG_FILE_CACHE.sdkFilename : SDK_FILENAME;
	}

	configFileExists() {
		return CONFIG_FILE_CACHE !== null;
	}

	_loadCache() {
		if (fs.existsSync(path.resolve(__dirname, CONFIG_FILE))) {
			CONFIG_FILE_CACHE = require(CONFIG_FILE);
		}
	}
}

module.exports = new SDKProperties();
