/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const SdkProperties = require('./SdkProperties');

const https = require('https');
const http = require('http');
const { URL } = require('url');
const ProxyAgent = require('./ProxyAgent');

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

class SdkDownloadService {
	constructor() {
		this._fileSystemService = new FileSystemService();
	}

	async download() {
		const sdkParentDirectory = this._fileSystemService.createFolder(HOME_PATH, FOLDERS.SUITECLOUD_SDK);
		// remove OLD jar files
		this._removeJarFilesFrom(sdkParentDirectory);
		const sdkDirectory = this._fileSystemService.createFolder(sdkParentDirectory, FOLDERS.NODE_CLI);

		const fullURL = `${SdkProperties.getDownloadURL()}/${SdkProperties.getSdkFileName()}`;
		const destinationFilePath = path.join(sdkDirectory, SdkProperties.getSdkFileName());
		const proxy = process.env.SUITECLOUD_PROXY || process.env.npm_config_https_proxy || process.env.npm_config_proxy;
		const skipProxy = SdkProperties.configFileExists();

		try {
			await executeWithSpinner({
				action: this.downloadJarFilePromise(fullURL, destinationFilePath, proxy, skipProxy),
				message: NodeTranslationService.getMessage(DOWNLOADING_SUITECLOUD_SDK, fullURL),
			});
			NodeConsoleLogger.info(NodeTranslationService.getMessage(DOWNLOADING_SUITECLOUD_SDK_SUCCESS));
		} catch (error) {
			NodeConsoleLogger.error(NodeTranslationService.getMessage(DOWNLOADING_SUITECLOUD_SDK_ERROR, fullURL, unwrapExceptionMessage(error)));
		}
	}

	downloadJarFilePromise(downloadUrl, destinationFilePath, proxy, skipProxy) {
		const isProxyRequired = proxy && !skipProxy;
		const downloadUrlObject = new URL(downloadUrl);
		const downloadUrlProtocol = downloadUrlObject.protocol;

		const requestOptions = {
			encoding: 'binary',
			...(isProxyRequired && { agent: new ProxyAgent(proxy, { tunnel: true, timeout: 15000 }) }),
		};

		if (!/^http:$|^https:$/.test(downloadUrlProtocol)) {
			throw new Error('Invalid SDK jar file download url protocol. Only http: or https: are allowed.');
		}

		const httpx = 'http:'.match(downloadUrlObject.protocol) ? http : https;

		return new Promise((resolve, reject) => {
			const clientReq = httpx.get(downloadUrlObject, requestOptions, (response) => {
				const chunks = [];
				response.on('data', (chunk) => chunks.push(Buffer.from(chunk, 'binary')));

				response.on('end', () => {
					if (!VALID_JAR_CONTENT_TYPES.includes(response.headers['content-type'])) {
						reject(NodeTranslationService.getMessage(DOWNLOADING_SUITECLOUD_SDK_ERROR_FILE_NOT_AVAILABLE));
					}

					const jarFile = fs.createWriteStream(destinationFilePath);
					jarFile.write(Buffer.concat(chunks), 'binary');
					jarFile.end();
					resolve();
				});

				response.on('error', (error) => {
					reject(NodeTranslationService.getMessage(DOWNLOADING_SUITECLOUD_SDK_ERROR_FILE_NOT_AVAILABLE));
				});
			});

			clientReq
				.once('timeout', () => {
					clientReq.destroy();
					reject(new Error(`GET request timeout.`));
				})
				.once('error', (err) => reject(err))
				.end();
		});
	}

	_removeJarFilesFrom(folder) {
		// remove all JAR files before writing response to file
		fs.readdirSync(folder)
			.filter((file) => /[.]jar$/.test(file))
			.map((file) => fs.unlinkSync(path.join(folder, file)));
	}
}

module.exports = new SdkDownloadService();
