/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { homedir } from 'os';
import { join, resolve } from 'path';
import { existsSync } from 'fs';

export const SUITECLOUD_FOLDER = '.suitecloud-sdk';
export const VSCODE_SDK_FOLDER = 'vscode';

const EXTENSION_CONFIG_JSON_FILENAME = 'extension.config.json';
const EXTENSION_CONFIG_JSON_FILE = './' + EXTENSION_CONFIG_JSON_FILENAME;
const EXTENSION_PACKAGE_METADATA = require('../../../package.json');
const EXTENSION_CONFIG_JSON_FILE_PATH = resolve(__dirname, EXTENSION_CONFIG_JSON_FILENAME);
const IS_CUSTOM_SDK_METADATA_USED = existsSync(EXTENSION_CONFIG_JSON_FILE_PATH);
// SDK ownership belongs to the VS Code product. Internal builds can still override
// these values with a generated extension.config.json next to this module.
const SDK_METADATA = IS_CUSTOM_SDK_METADATA_USED
	? require(EXTENSION_CONFIG_JSON_FILE)
	: EXTENSION_PACKAGE_METADATA;

function getSdkDownloadUrl(): string {
	return SDK_METADATA.sdkDownloadUrl;
}

export function getSdkPath(): string {
	return join(homedir(), SUITECLOUD_FOLDER, VSCODE_SDK_FOLDER, getSdkFilename());
}

export function getSdkFilename(): string {
	return SDK_METADATA.sdkFilename;
}

export function getSdkSha256(): string {
	return SDK_METADATA.sdkSha256;
}

export function isCustomSdkMetadataUsed(): boolean {
	return IS_CUSTOM_SDK_METADATA_USED;
}

export function getSdkDownloadFullUrl(): string {
	return getSdkDownloadUrl() + '/' + getSdkFilename();
}
