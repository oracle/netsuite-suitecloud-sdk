/*
 ** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const request = require('request-promise-native');
const SDKProperties = require('../core/sdksetup/SDKProperties');
const { FOLDER_NAMES } = require('../ApplicationConstants');
const NodeUtils = require('../utils/NodeUtils');
const unwrapExceptionMessage = require('../utils/ExceptionUtils').unwrapExceptionMessage;
const TranslationService = require('./TranslationService');
const FileSystemService = require('./FileSystemService');
const { executeWithSpinner } = require('../ui/CliSpinner');
const HOME_PATH = require('os').homedir();
const {
	DOWNLOADING_SUITECLOUD_SDK,
	DOWNLOADING_SUITECLOUD_SDK_SUCCESS,
	DOWNLOADING_SUITECLOUD_SDK_ERROR,
	DOWNLOADING_SUITECLOUD_SDK_ERROR_FILE_NOT_AVAILABLE,
} = require('./TranslationKeys');

const VALID_JAR_CONTENT_TYPES = [
	'application/java-archive',
	'application/x-java-archive',
	'application/x-jar',
];

class SDKDownloadService {
	constructor() {
		this._fileSystemService = new FileSystemService();
	}

	async download() {
		const sdkDirectory = this._fileSystemService.createFolder(HOME_PATH, FOLDER_NAMES.SUITECLOUD_SDK);
		const fullURL = `${SDKProperties.getDownloadURL()}/${SDKProperties.getSDKFileName()}`;

		try {
			await executeWithSpinner({
				action: this._downloadFile(fullURL, sdkDirectory),
				message: TranslationService.getMessage(DOWNLOADING_SUITECLOUD_SDK, fullURL),
			});
			NodeUtils.println(TranslationService.getMessage(DOWNLOADING_SUITECLOUD_SDK_SUCCESS), NodeUtils.COLORS.INFO);
			return true;
		}
		catch (error) {
			NodeUtils.println(TranslationService.getMessage(DOWNLOADING_SUITECLOUD_SDK_ERROR, fullURL, unwrapExceptionMessage(error)), NodeUtils.COLORS.ERROR);
			return false;
		}
	}

	_downloadFile(url, sdkDirectory) {
		const proxy = process.env.npm_config_https_proxy || process.env.npm_config_proxy;

		const isProxyRequired = proxy && !SDKProperties.configFileExists();

		const options = {
			method: 'GET',
			uri: url,
			encoding: 'binary',
			resolveWithFullResponse: true,
			...(isProxyRequired && { proxy: proxy }),
		};

		return request(options).then(function(response) {
			if (!VALID_JAR_CONTENT_TYPES.includes(response.headers['content-type'])) {
				throw TranslationService.getMessage(
					DOWNLOADING_SUITECLOUD_SDK_ERROR_FILE_NOT_AVAILABLE
				);
			}

			// remove all JAR files before writing response to file
			fs.readdirSync(sdkDirectory)
				.filter(file => /[.]jar$/.test(file))
				.map(file => fs.unlinkSync(path.join(sdkDirectory, file)));

			const sdkDestinationFile = path.join(sdkDirectory, SDKProperties.getSDKFileName());
			const file = fs.createWriteStream(sdkDestinationFile);
			file.write(response.body, 'binary');
			file.end();
		});
	}
}

module.exports = new SDKDownloadService();