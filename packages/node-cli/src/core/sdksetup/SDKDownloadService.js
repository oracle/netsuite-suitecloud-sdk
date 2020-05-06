/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const request = require('request-promise-native');
const SDKProperties = require('./SDKProperties');

const HOME_PATH = require('os').homedir();

const { FOLDERS } = require('../../ApplicationConstants');

const NodeConsoleLogger = require('../../loggers/NodeConsoleLogger');
const unwrapExceptionMessage = require('../../utils/ExceptionUtils').unwrapExceptionMessage;

const NodeTranslationService = require('../../services/NodeTranslationService');
const FileSystemService = require('../../services/FileSystemService');
const { executeWithSpinner } = require('../../ui/CliSpinner');

const {
	DOWNLOADING_SUITECLOUD_SDK,
	DOWNLOADING_SUITECLOUD_SDK_SUCCESS,
	DOWNLOADING_SUITECLOUD_SDK_ERROR,
	DOWNLOADING_SUITECLOUD_SDK_ERROR_FILE_NOT_AVAILABLE,
} = require('../../services/TranslationKeys');

const VALID_JAR_CONTENT_TYPES = ['application/java-archive', 'application/x-java-archive', 'application/x-jar'];

class SDKDownloadService {
	constructor() {
		this._fileSystemService = new FileSystemService();
	}

	async download() {
		const sdkParentDirectory = this._fileSystemService.createFolder(HOME_PATH, FOLDERS.SUITECLOUD_SDK);
		// remove OLD jar files
		this._removeJarFilesFrom(sdkParentDirectory);
		const sdkDirectory = this._fileSystemService.createFolder(sdkParentDirectory, FOLDERS.NODE_CLI);

		const fullURL = `${SDKProperties.getDownloadURL()}/${SDKProperties.getSDKFileName()}`;

		try {
			await executeWithSpinner({
				action: this._downloadFile(fullURL, sdkDirectory),
				message: NodeTranslationService.getMessage(DOWNLOADING_SUITECLOUD_SDK, fullURL),
			})
			NodeConsoleLogger.info(NodeTranslationService.getMessage(DOWNLOADING_SUITECLOUD_SDK_SUCCESS));
		}
		catch (error) {
			NodeConsoleLogger.error(NodeTranslationService.getMessage(DOWNLOADING_SUITECLOUD_SDK_ERROR, fullURL, unwrapExceptionMessage(error)))
		}
	}

	_downloadFile(url, sdkDirectory) {
		const proxy = process.env.npm_config_https_proxy || process.env.npm_config_proxy;
		const isProxyRequired = proxy && !SDKProperties.configFileExists();
		const removeJarFilesFrom = this._removeJarFilesFrom;

		const options = {
			method: 'GET',
			uri: url,
			encoding: 'binary',
			resolveWithFullResponse: true,
			...(isProxyRequired && { proxy: proxy }),
		};

		return request(options).then(function(response) {
			if (!VALID_JAR_CONTENT_TYPES.includes(response.headers['content-type'])) {
				throw NodeTranslationService.getMessage(DOWNLOADING_SUITECLOUD_SDK_ERROR_FILE_NOT_AVAILABLE);
			}

			// remove all jar files before writing response to file
			removeJarFilesFrom(sdkDirectory)

			const sdkDestinationFile = path.join(sdkDirectory, SDKProperties.getSDKFileName());
			const file = fs.createWriteStream(sdkDestinationFile);
			file.write(response.body, 'binary');
			file.end();
		});
	}

	_removeJarFilesFrom(folder) {
		// remove all JAR files before writing response to file
		fs.readdirSync(folder)
			.filter(file => /[.]jar$/.test(file))
			.map(file => fs.unlinkSync(path.join(folder, file)));
	}
}

module.exports = new SDKDownloadService();
