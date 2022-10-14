/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { homedir } from 'os';
import { join, resolve } from 'path';
import { existsSync } from 'fs';

const PJSON = require('../../../package.json');

export const SUITECLOUD_FOLDER = '.suitecloud-sdk';
export const VSCODE_SDK_FOLDER = 'vscode';

const EXTENSION_CONFIG_JSON_FILENAME = 'extension.config.json';
const EXTENSION_CONFIG_JSON_FILE = './' + EXTENSION_CONFIG_JSON_FILENAME;

function getSdkDownloadUrl(): string {
	if (extensionConfigJsonFileExists()) {
		const extensionConfigJsonFile = require(EXTENSION_CONFIG_JSON_FILE);
		return extensionConfigJsonFile.sdkDownloadUrl;
	}

	return PJSON.sdkDownloadUrl;
}

function extensionConfigJsonFileExists(): boolean {
	return existsSync(resolve(__dirname, EXTENSION_CONFIG_JSON_FILENAME));
}

export function getSdkPath(): string {
	return join(homedir(), SUITECLOUD_FOLDER, VSCODE_SDK_FOLDER, getSdkFilename());
}

export function getSdkFilename(): string {
	if (extensionConfigJsonFileExists()) {
		const extensionConfigJsonFile = require(EXTENSION_CONFIG_JSON_FILE);
		return extensionConfigJsonFile.sdkFilename;
	}

	return PJSON.sdkFileName;
}

export function getSdkDownloadFullUrl(): string {
	return getSdkDownloadUrl() + '/' + getSdkFilename();
}
