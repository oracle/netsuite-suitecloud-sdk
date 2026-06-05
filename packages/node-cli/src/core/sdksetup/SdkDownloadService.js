/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const SdkProperties = require('./SdkProperties');
const SdkArtifactVerifier = require('./SdkArtifactVerifier');

const https = require('https');
const { URL } = require('url');
const { ENCODING, EVENT, HEADER } = require('../../utils/http/HttpConstants');

const HOME_PATH = require('os').homedir();

const { FOLDERS } = require('../../ApplicationConstants');

const unwrapExceptionMessage = require('../../utils/ExceptionUtils').unwrapExceptionMessage;
const ProxyEnvironmentUtils = require('../../services/proxy/ProxyEnvironmentUtils');

const NodeTranslationService = require('../../services/NodeTranslationService');
const FileSystemService = require('../../services/FileSystemService');

const { SDK_DOWNLOAD_SERVICE } = require('../../services/TranslationKeys');

const ProxyService = require('../../services/proxy/ProxyAgentService');

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
		const temporaryDestinationFilePath = `${destinationFilePath}.tmp`;
		const proxy =  ProxyEnvironmentUtils.resolveSdkDownloadProxyFromEnv();
		const skipProxy = SdkProperties.isCustomSdkMetadataUsed();

		try {
			await this._downloadJarFilePromise(fullURL, temporaryDestinationFilePath, proxy, skipProxy);
			SdkArtifactVerifier.verify(temporaryDestinationFilePath, SdkProperties);
			this._fileSystemService.deleteFileIfExists(destinationFilePath);
			fs.renameSync(temporaryDestinationFilePath, destinationFilePath);
		} catch (error) {
			this._fileSystemService.deleteFileIfExists(temporaryDestinationFilePath);
			console.error(NodeTranslationService.getMessage(SDK_DOWNLOAD_SERVICE.ERROR, fullURL, unwrapExceptionMessage(error)));
			process.exit(ERROR_CODE);
		}
	}

	_downloadJarFilePromise(downloadUrl, destinationFilePath, proxy, skipProxy) {
		const downloadUrlObject = new URL(downloadUrl);
		const downloadUrlProtocol = downloadUrlObject.protocol;

		const requestOptions = {
			encoding: ENCODING.BINARY,
			...(proxy && !skipProxy && { agent: ProxyService.getProxyAgent(proxy) }),
		};

		if (!/^https:$/.test(downloadUrlProtocol)) {
			throw new Error(NodeTranslationService.getMessage(SDK_DOWNLOAD_SERVICE.WRONG_DOWNLOAD_URL_PROTOCOL));
		}

		return new Promise((resolve, reject) => {
			const clientReq = https.get(downloadUrlObject, requestOptions, (response) => {
				const chunks = [];
				response.on(EVENT.DATA, (chunk) => chunks.push(Buffer.from(chunk, ENCODING.BINARY)));

				response.on(EVENT.END, () => {
					if (response.statusCode < 200 || response.statusCode >= 300 || !this._isValidJarContentType(response.headers[HEADER.CONTENT_TYPE])) {
						reject(NodeTranslationService.getMessage(SDK_DOWNLOAD_SERVICE.FILE_NOT_AVAILABLE_ERROR));
						return;
					}

					fs.writeFileSync(destinationFilePath, Buffer.concat(chunks), ENCODING.BINARY);
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

	_isValidJarContentType(contentType) {
		return contentType && VALID_JAR_CONTENT_TYPES.includes(contentType.split(';')[0].trim());
	}
}

module.exports = new SdkDownloadService();
