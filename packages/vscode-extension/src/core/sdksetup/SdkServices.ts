/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { homedir } from 'os';
import { parse } from 'url';
import { VSTranslationService } from '../../service/VSTranslationService';
import { EXTENSION_INSTALLATION } from '../../service/TranslationKeys';
import MessageService from '../../service/MessageService';
import { validateSdk } from './SdkValidator';
import { FileSystemService } from '../../util/ExtensionUtil';
import { SDK_DOWNLOAD_URL, SDK_FILENAME, SUITECLOUD_FOLDER, VSCODE_SDK_FOLDER, sdkPath } from './SdkProperties';

const VALID_JAR_CONTENT_TYPES = ['application/java-archive', 'application/x-java-archive', 'application/x-jar'];

const messageService = new MessageService();
const translationService = new VSTranslationService();
const fileSystemService = new FileSystemService();

export async function installIfNeeded() {
	if (!fs.existsSync(path.join(sdkPath)) || !(await validateSdk(path.join(sdkPath)))) {
		await install();
	}
}

async function install() {
	const sdkParentDirectory = fileSystemService.createFolder(homedir(), SUITECLOUD_FOLDER);
	const sdkDirectory = fileSystemService.createFolder(sdkParentDirectory, VSCODE_SDK_FOLDER);
	const fullURL = `${SDK_DOWNLOAD_URL}/${SDK_FILENAME}`;

	try {
		const downloadFilePromise = downloadFile(fullURL, sdkDirectory);
		messageService.showInformationMessage(
			translationService.getMessage(EXTENSION_INSTALLATION.IN_PROGRESS),
			translationService.getMessage(EXTENSION_INSTALLATION.IN_PROGRESS),
			downloadFilePromise
		);
		await downloadFilePromise;
		messageService.showInformationMessage(translationService.getMessage(EXTENSION_INSTALLATION.SUCCESS.SDK_DOWNLOADED));
	} catch (error) {
		messageService.showErrorMessage(translationService.getMessage(EXTENSION_INSTALLATION.ERROR.GENERAL_ERROR, fullURL, error));
		throw error;
	}
}

async function downloadFile(url: string, sdkDirectory: string) {
	const sdkDestinationFile = path.join(sdkDirectory, SDK_FILENAME);
	const parsedUrl = parse(url);

	removeJarFilesFrom(sdkDirectory);

	const options = {
		method: 'GET',
		protocol: parsedUrl.protocol,
		host: parsedUrl.host,
		path: parsedUrl.path,
	};

	let file: fs.WriteStream | undefined;
	try {
		file = fs.createWriteStream(sdkDestinationFile);
		const sdk = await save(options, file);
		file.close();
		if (!(await validateSdk(sdk))) {
			throw translationService.getMessage(EXTENSION_INSTALLATION.ERROR.SDK_INVALID);
		}
	} finally {
		if (file) {
			file.close();
		}
	}
}

function save(options: http.RequestOptions | https.RequestOptions, file: fs.WriteStream): Promise<string> {
	let getFn = options.protocol === 'https:' ? https.get : http.get;
	return new Promise((resolve, reject) => {
		getFn(options, (response) => {
			const contentType = response.headers['content-type'];
			if (!contentType || !VALID_JAR_CONTENT_TYPES.includes(contentType)) {
				throw VSTranslationService.getMessage(EXTENSION_INSTALLATION.ERROR.SDK_NOT_AVAILABLE);
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

function removeJarFilesFrom(folder: string) {
	// remove all JAR files before writing response to file
	fs.readdirSync(folder)
		.filter((file) => /[.]jar$/.test(file))
		.map((file) => fs.unlinkSync(path.join(folder, file)));
}
