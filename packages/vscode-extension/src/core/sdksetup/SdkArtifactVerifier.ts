/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import * as crypto from 'crypto';
import * as fs from 'fs';
import { VSTranslationService } from '../../service/VSTranslationService';
import { EXTENSION_INSTALLATION } from '../../service/TranslationKeys';

const SHA256_PATTERN = /^[a-fA-F0-9]{64}$/;

const translationService = new VSTranslationService();

export function verifySdkArtifact(sdkPath: string, expectedSha256: string): boolean {
	const normalizedExpectedSha256 = normalizeExpectedSha256(expectedSha256);
	const actualSha256 = calculateSha256(sdkPath);

	if (actualSha256 !== normalizedExpectedSha256) {
		throw translationService.getMessage(EXTENSION_INSTALLATION.ERROR.SDK_CHECKSUM_MISMATCH);
	}

	return true;
}

function calculateSha256(sdkPath: string): string {
	return crypto.createHash('sha256').update(fs.readFileSync(sdkPath)).digest('hex');
}

function normalizeExpectedSha256(expectedSha256: string): string {
	if (typeof expectedSha256 !== 'string' || !SHA256_PATTERN.test(expectedSha256.trim())) {
		throw translationService.getMessage(EXTENSION_INSTALLATION.ERROR.SDK_MISSING_CHECKSUM);
	}

	return expectedSha256.trim().toLowerCase();
}
