/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const crypto = require('crypto');
const fs = require('fs');

const NodeTranslationService = require('../../services/NodeTranslationService');
const { SDK_DOWNLOAD_SERVICE } = require('../../services/TranslationKeys');

const SHA256_PATTERN = /^[a-fA-F0-9]{64}$/;
const SHA256 = 'sha256';
const HEX = 'hex';

class SdkArtifactVerifier {
	verify(sdkPath, sdkProperties) {
		if (sdkProperties.isCustomSdkMetadataUsed()) {
			return true;
		}

		const normalizedExpectedSha256 = this._normalizeExpectedSha256(sdkProperties.getSdkSha256());
		const actualSha256 = this._calculateSha256(sdkPath);

		if (actualSha256 !== normalizedExpectedSha256) {
			throw new Error(NodeTranslationService.getMessage(SDK_DOWNLOAD_SERVICE.CHECKSUM_MISMATCH));
		}

		return true;
	}

	_calculateSha256(sdkPath) {
		return crypto.createHash(SHA256).update(fs.readFileSync(sdkPath)).digest(HEX);
	}

	_normalizeExpectedSha256(expectedSha256) {
		if (typeof expectedSha256 !== 'string' || !SHA256_PATTERN.test(expectedSha256.trim())) {
			throw new Error(NodeTranslationService.getMessage(SDK_DOWNLOAD_SERVICE.MISSING_CHECKSUM));
		}

		return expectedSha256.trim().toLowerCase();
	}
}

module.exports = new SdkArtifactVerifier();
