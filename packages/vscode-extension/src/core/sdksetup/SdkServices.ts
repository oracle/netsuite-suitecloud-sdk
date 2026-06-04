/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { homedir } from 'os';
import { parse } from 'url';
import { VSTranslationService } from '../../service/VSTranslationService';
import { ERRORS, EXTENSION_INSTALLATION } from '../../service/TranslationKeys';
import MessageService from '../../service/MessageService';
import { validateSdk } from './SdkValidator';
import { ApplicationConstants, EnvironmentInformationService, FileSystemService } from '../../util/ExtensionUtil';
import { verifySdkArtifact } from './SdkArtifactVerifier';
import { getSdkDownloadFullUrl, getSdkPath, getSdkFilename, getSdkSha256, isUnverifiedSdkArtifactAllowed, SUITECLOUD_FOLDER, VSCODE_SDK_FOLDER } from './SdkProperties';

const VALID_JAR_CONTENT_TYPES = ['application/java-archive', 'application/x-java-archive', 'application/x-jar'];

const messageService = new MessageService();
const translationService = new VSTranslationService();
const fileSystemService = new FileSystemService();

export async function installIfNeeded() {
	validateJavaVersion();

	const sdkPath = path.join(getSdkPath());
	if (!fs.existsSync(sdkPath) || !isSdkArtifactTrusted(sdkPath) || !(await validateSdk(sdkPath))) {
		await install();
	}
}

function validateJavaVersion() {
	const environmentInformationService = new EnvironmentInformationService();
	const installedJavaVersion = environmentInformationService.getInstalledJavaVersionString();
	for (const compatibleJavaVersion of ApplicationConstants.SDK_COMPATIBLE_JAVA_VERSIONS) {
		if (installedJavaVersion.startsWith(compatibleJavaVersion)) {
			return;
		}
	}

	let errorMessage;
	if (installedJavaVersion === '') {
		errorMessage = translationService.getMessage(`${ERRORS.SDK_JAVA_VERSION_NOT_INSTALLED}`, ApplicationConstants.SDK_COMPATIBLE_JAVA_VERSIONS.join(', '));
		messageService.showErrorMessage(errorMessage);
		throw errorMessage;
	}
	errorMessage = translationService.getMessage(`${ERRORS.SDK_JAVA_VERSION_NOT_COMPATIBLE}`, installedJavaVersion, ApplicationConstants.SDK_COMPATIBLE_JAVA_VERSIONS.join(', '));
	messageService.showErrorMessage(errorMessage);
	throw errorMessage;
}

async function install() {
	const sdkParentDirectory = fileSystemService.createFolder(homedir(), SUITECLOUD_FOLDER);
	const sdkDirectory = fileSystemService.createFolder(sdkParentDirectory, VSCODE_SDK_FOLDER);
	const fullUrl = getSdkDownloadFullUrl();

	try {
		const downloadFilePromise = downloadFile(fullUrl, sdkDirectory);
		messageService.showInformationMessage(
			translationService.getMessage(EXTENSION_INSTALLATION.IN_PROGRESS),
			translationService.getMessage(EXTENSION_INSTALLATION.IN_PROGRESS),
			downloadFilePromise
		);
		await downloadFilePromise;
		messageService.showInformationMessage(translationService.getMessage(EXTENSION_INSTALLATION.SUCCESS.SDK_DOWNLOADED));
	} catch (error) {
		messageService.showErrorMessage(translationService.getMessage(EXTENSION_INSTALLATION.ERROR.GENERAL_ERROR, fullUrl, `${error}`));
		throw error;
	}
}

async function downloadFile(url: string, sdkDirectory: string) {
	const sdkDestinationFile = path.join(sdkDirectory, getSdkFilename());
	const temporarySdkDestinationFile = `${sdkDestinationFile}.tmp`;
	const parsedUrl = parse(url);

	if (parsedUrl.protocol !== 'https:') {
		throw translationService.getMessage(EXTENSION_INSTALLATION.ERROR.WRONG_DOWNLOAD_URL_PROTOCOL);
	}

	const options = {
		method: 'GET',
		protocol: parsedUrl.protocol,
		host: parsedUrl.host,
		path: parsedUrl.path,
	};

	let file: fs.WriteStream | undefined;
	try {
		file = fs.createWriteStream(temporarySdkDestinationFile);
		const sdk = await save(options, file);
		file.close();
		verifySdkArtifactIfNeeded(sdk);
		fs.renameSync(temporarySdkDestinationFile, sdkDestinationFile);
		if (!(await validateSdk(sdkDestinationFile))) {
			throw translationService.getMessage(EXTENSION_INSTALLATION.ERROR.SDK_INVALID);
		}
	} finally {
		if (file) {
			file.close();
		}
		removeFileIfExists(temporarySdkDestinationFile);
	}
}

function save(options: https.RequestOptions, file: fs.WriteStream): Promise<string> {
	return new Promise((resolve, reject) => {
		https.get(options, (response) => {
			const contentType = response.headers['content-type'];
			if (!isSuccessStatusCode(response.statusCode) || !isValidJarContentType(contentType)) {
				reject(translationService.getMessage(EXTENSION_INSTALLATION.ERROR.SDK_NOT_AVAILABLE));
				return;
			}
			response.pipe(file);
			file.on('finish', () => {
				return resolve(file.path.toString('utf8'));
			});
		}).on('error', (err) => {
			return reject(err);
		});
	});
}

function removeFileIfExists(filePath: string) {
	if (fs.existsSync(filePath)) {
		fs.unlinkSync(filePath);
	}
}

function isSdkArtifactTrusted(sdkPath: string) {
	if (isUnverifiedSdkArtifactAllowed()) {
		return true;
	}

	try {
		return verifySdkArtifact(sdkPath, getSdkSha256());
	} catch (error) {
		removeFileIfExists(sdkPath);
		return false;
	}
}

function verifySdkArtifactIfNeeded(sdkPath: string) {
	if (!isUnverifiedSdkArtifactAllowed()) {
		verifySdkArtifact(sdkPath, getSdkSha256());
	}
}

function isSuccessStatusCode(statusCode: number | undefined) {
	return statusCode !== undefined && statusCode >= 200 && statusCode < 300;
}

function isValidJarContentType(contentType: string | undefined) {
	return contentType !== undefined && VALID_JAR_CONTENT_TYPES.includes(contentType.split(';')[0].trim());
}
