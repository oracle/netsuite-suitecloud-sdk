/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const SdkArtifactVerifier = require('../../src/core/sdksetup/SdkArtifactVerifier');

describe('SdkArtifactVerifier', () => {
	let testFolder;
	let testFile;
	let expectedSha256;

	beforeEach(() => {
		testFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'suitecloud-sdk-artifact-'));
		testFile = path.join(testFolder, 'sdk.jar');
		fs.writeFileSync(testFile, 'trusted artifact content');
		expectedSha256 = crypto.createHash('sha256').update(fs.readFileSync(testFile)).digest('hex');
	});

	afterEach(() => {
		fs.rmSync(testFolder, { recursive: true, force: true });
	});

	it('verifies an artifact that matches the expected SHA-256 checksum', () => {
		expect(SdkArtifactVerifier.verify(testFile, createSdkProperties({ sha256: expectedSha256 }))).toBe(true);
	});

	it('normalizes uppercase SHA-256 checksums', () => {
		expect(SdkArtifactVerifier.verify(testFile, createSdkProperties({ sha256: expectedSha256.toUpperCase() }))).toBe(true);
	});

	it('rejects an artifact that does not match the expected SHA-256 checksum', () => {
		const wrongSha256 = '0'.repeat(64);

		expect(() => SdkArtifactVerifier.verify(testFile, createSdkProperties({ sha256: wrongSha256 }))).toThrow();
	});

	it('rejects missing SHA-256 metadata', () => {
		expect(() => SdkArtifactVerifier.verify(testFile, createSdkProperties())).toThrow();
	});

	it('skips SHA-256 verification when custom SDK metadata is used', () => {
		expect(SdkArtifactVerifier.verify(testFile, createSdkProperties({ customSdkMetadataUsed: true }))).toBe(true);
	});
});

function createSdkProperties({ sha256, customSdkMetadataUsed = false } = {}) {
	return {
		getSdkSha256: jest.fn(() => sha256),
		isCustomSdkMetadataUsed: jest.fn(() => customSdkMetadataUsed),
	};
}
