/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const path = require('path');
const fs = require('fs');
const HOME_PATH = require('os').homedir();

const CONFIG_FILE = './config.json';
const { FOLDERS } = require('../../ApplicationConstants');
const PACKAGE_METADATA = require('../../../package.json');

class SdkProperties {
	constructor() {
		const configFilePath = path.resolve(__dirname, CONFIG_FILE);
		// Load the SDK artifact metadata used to download and verify the bundled SDK dependency.
		this._isCustomSdkMetadataUsed = fs.existsSync(configFilePath);
		this._sdkMetadata = this._isCustomSdkMetadataUsed ? require(CONFIG_FILE) : PACKAGE_METADATA;
	}

	getDownloadURL() {
		return this._sdkMetadata.sdkDownloadUrl;
	}

	getSdkFileName() {
		return this._sdkMetadata.sdkFilename;
	}

	getSdkSha256() {
		return this._sdkMetadata.sdkSha256;
	}

	isUnverifiedSdkArtifactAllowed() {
		return this._sdkMetadata.allowUnverifiedSdkArtifact === true;
	}

	isCustomSdkMetadataUsed() {
		return this._isCustomSdkMetadataUsed;
	}

	getSdkPath() {
		return path.join(HOME_PATH, `${FOLDERS.SUITECLOUD_SDK}/${FOLDERS.NODE_CLI}/${this.getSdkFileName()}`);
	}
}

module.exports = new SdkProperties();
