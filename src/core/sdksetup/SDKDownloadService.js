/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const fs = require('fs');
const path = require('path');
const request = require('request-promise-native');

const ROOT_DIRECTORY = path.dirname(require.main.filename);


const CONFIG_FILE = './config.json';
const PACKAGE_FILE = `${ROOT_DIRECTORY}/package.json`;

const {
	SDK_DIRECTORY_NAME,
	SDK_FILENAME,
} = require('../../ApplicationConstants');

const NodeUtils = require('../../utils/NodeUtils');
const unwrapExceptionMessage = require('../../utils/ExceptionUtils').unwrapExceptionMessage;

const TranslationService = require('../../services/TranslationService');
const FileSystemService = require('../../services/FileSystemService');
const { executeWithSpinner } = require('../../ui/CliSpinner');

const {
	DOWNLOADING_SUITECLOUD_SDK,
	DOWNLOADING_SUITECLOUD_SDK_SUCCESS,
	DOWNLOADING_SUITECLOUD_SDK_ERROR,
} = require('../../services/TranslationKeys');

class SDKDownloadService {

	constructor() {
		this._fileSystemService = new FileSystemService();
	}

	download() {
		const sdkDirectory = this._fileSystemService.createFolder(ROOT_DIRECTORY, SDK_DIRECTORY_NAME);

		// remove all jar files before downloading
		fs.readdirSync(sdkDirectory)
			.filter(file => /[.]jar$/.test(file))
			.map(file => fs.unlinkSync(path.join(sdkDirectory, file)));

		const fullURL = `${this._getDownloadURL()}/${SDK_FILENAME}`;
		const sdkDestinationFile = path.join(sdkDirectory, SDK_FILENAME);

		executeWithSpinner({
			action: this._downloadFile(fullURL, sdkDestinationFile),
			message: TranslationService.getMessage(DOWNLOADING_SUITECLOUD_SDK, fullURL),
		}).then(() => NodeUtils.println(
			TranslationService.getMessage(DOWNLOADING_SUITECLOUD_SDK_SUCCESS), NodeUtils.COLORS.INFO,
			),
		).catch(error => NodeUtils.println(
			TranslationService.getMessage(DOWNLOADING_SUITECLOUD_SDK_ERROR, fullURL, unwrapExceptionMessage(error)),
			NodeUtils.COLORS.ERROR,
			),
		);
	}

	_getDownloadURL() {
		// read config.js file if exists or use package.json
		const configFileExists = fs.existsSync(path.resolve(__dirname, CONFIG_FILE));
		const configFile = configFileExists ? require(CONFIG_FILE) : require(PACKAGE_FILE);
		return configFile.sdkDownloadUrl;
	}

	_downloadFile(url, destinationFile) {
		const proxy = process.env.npm_config_https_proxy ||
			process.env.npm_config_proxy;

		const isProxyRequired = proxy && !fs.existsSync(path.resolve(__dirname, CONFIG_FILE));

		const options = {
			method: 'GET',
			uri: url,
			encoding: 'binary',
			...(isProxyRequired && { proxy: proxy }),
		};

		return request(options).then(function(body) {
			const file = fs.createWriteStream(destinationFile);
			file.write(body, 'binary');
			file.end();
		});
	}

}

module.exports = new SDKDownloadService();