/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const SdkProperties = require('./SdkProperties');

const https = require('https');
const http = require('http');
const { URL } = require('url');
const ProxyAgent = require('../../utils/http/ProxyAgent');
const { ENCODING, EVENT, HEADER, PROTOCOL } = require('../../utils/http/HttpConstants');

const HOME_PATH = require('os').homedir();

const { FOLDERS } = require('../../ApplicationConstants');

const unwrapExceptionMessage = require('../../utils/ExceptionUtils').unwrapExceptionMessage;

const NodeTranslationService = require('../../services/NodeTranslationService');
const FileSystemService = require('../../services/FileSystemService');

const { SDK_DOWNLOAD_SERVICE } = require('../../services/TranslationKeys');

const VALID_JAR_CONTENT_TYPES = ['application/java-archive', 'application/x-java-archive', 'application/x-jar'];
const ERROR_CODE = -1;

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
			await this._downloadJarFilePromise(fullURL, destinationFilePath, proxy, skipProxy);
		} catch (error) {
			console.error(NodeTranslationService.getMessage(SDK_DOWNLOAD_SERVICE.ERROR, fullURL, unwrapExceptionMessage(error)));
			process.exit(ERROR_CODE);
		}
	}

	_downloadJarFilePromise(downloadUrl, destinationFilePath, proxy, skipProxy) {
		const downloadUrlObject = new URL(downloadUrl);
		const downloadUrlProtocol = downloadUrlObject.protocol;

		const requestOptions = {
			encoding: ENCODING.BINARY,
			...(proxy && !skipProxy && { agent: new ProxyAgent(proxy, { tunnel: true, timeout: 15000 }) }),
		};

		if (!/^http:$|^https:$/.test(downloadUrlProtocol)) {
			throw new Error(NodeTranslationService.getMessage(SDK_DOWNLOAD_SERVICE.WRONG_DOWNLOAD_URL_PROTOCOL));
		}

		const httpxModule = PROTOCOL.HTTP.match(downloadUrlObject.protocol) ? http : https;

		return new Promise((resolve, reject) => {
			const clientReq = httpxModule.get(downloadUrlObject, requestOptions, (response) => {
				const chunks = [];
				response.on(EVENT.DATA, (chunk) => chunks.push(Buffer.from(chunk, ENCODING.BINARY)));

				response.on(EVENT.END, () => {
					if (!VALID_JAR_CONTENT_TYPES.includes(response.headers[HEADER.CONTENT_TYPE])) {
						reject(NodeTranslationService.getMessage(SDK_DOWNLOAD_SERVICE.FILE_NOT_AVAILABLE_ERROR));
					}

					const jarFile = fs.createWriteStream(destinationFilePath);
					jarFile.write(Buffer.concat(chunks), ENCODING.BINARY);
					jarFile.end();
					resolve();
				});

				response.on(EVENT.ERROR, (error) => {
					reject(NodeTranslationService.getMessage(SDK_DOWNLOAD_SERVICE.FILE_NOT_AVAILABLE_ERROR));
				});
			});

			clientReq
				.once(EVENT.TIMEOUT, () => {
					clientReq.destroy();
					reject(new Error(NodeTranslationService.getMessage(SDK_DOWNLOAD_SERVICE.GET_TIMEOUT)));
				})
				.once(EVENT.ERROR, (err) => reject(err))
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
