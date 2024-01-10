/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const path = require('path');
const fs = require('fs');
const HOME_PATH = require('os').homedir();

const ROOT_DIRECTORY = path.dirname(path.resolve(__dirname, '../../'));
const PACKAGE_FILE = `${ROOT_DIRECTORY}/package.json`;
const CONFIG_FILE = './config.json';
const { FOLDERS } = require('../../ApplicationConstants');
const { sdkFilename } = require(PACKAGE_FILE);

let CONFIG_FILE_CACHE = null;

class SdkProperties {
	constructor() {
		this._loadCache();
	}

	getDownloadURL() {
		// read config.js file if exists or use package.json
		const configFile = this.configFileExists() ? CONFIG_FILE_CACHE : require(PACKAGE_FILE);
		return configFile.sdkDownloadUrl;
	}

	getSdkFileName() {
		// read config.js file if exists or use package.json
		const sdkFileName = this.configFileExists() ? CONFIG_FILE_CACHE.sdkFilename : sdkFilename
		return sdkFileName;
	}

	configFileExists() {
		return CONFIG_FILE_CACHE !== null;
	}

	_loadCache() {
		if (fs.existsSync(path.resolve(__dirname, CONFIG_FILE))) {
			CONFIG_FILE_CACHE = require(CONFIG_FILE);
		}
	}

	getSdkPath() {
		return path.join(HOME_PATH, `${FOLDERS.SUITECLOUD_SDK}/${FOLDERS.NODE_CLI}/${this.getSdkFileName()}`);
	}
}

module.exports = new SdkProperties();
