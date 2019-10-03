/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const path = require('path');
const fs = require('fs');
const ROOT_DIRECTORY = path.dirname(require.main.filename);
const CONFIG_FILE = './config.json';
const PACKAGE_FILE = `${ROOT_DIRECTORY}/package.json`;
const { SDK_FILENAME } = require('../../ApplicationConstants');

class SDKProperties {
    getDownloadURL() {
		// read config.js file if exists or use package.json
		const configFile = this.configFileExists() ? require(CONFIG_FILE) : require(PACKAGE_FILE);
		return configFile.sdkDownloadUrl;
	}

    getSDKFileName() {
        return this.configFileExists() ? require(CONFIG_FILE).sdkFilename : SDK_FILENAME;
    }

    configFileExists() {
        return fs.existsSync(path.resolve(__dirname, CONFIG_FILE));
    }
}

module.exports = new SDKProperties();