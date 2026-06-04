/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

jest.mock('../../src/core/sdksetup/SdkProperties', () => ({
	getSdkSha256: jest.fn(),
	isUnverifiedSdkArtifactAllowed: jest.fn(),
}));

jest.mock('../../src/core/sdksetup/SdkArtifactVerifier', () => ({
	verify: jest.fn(),
}));

const SdkProperties = require('../../src/core/sdksetup/SdkProperties');
const SdkArtifactVerifier = require('../../src/core/sdksetup/SdkArtifactVerifier');
const SdkDownloadService = require('../../src/core/sdksetup/SdkDownloadService');

describe('SdkDownloadService', () => {
	const sdkPath = '/tmp/sdk.jar';

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('verifies SDK artifacts when unverified artifacts are not allowed', () => {
		SdkProperties.isUnverifiedSdkArtifactAllowed.mockReturnValue(false);
		SdkProperties.getSdkSha256.mockReturnValue('expected-sha256');

		SdkDownloadService._verifySdkArtifactIfNeeded(sdkPath);

		expect(SdkArtifactVerifier.verify).toHaveBeenCalledWith(sdkPath, 'expected-sha256');
	});

	it('does not verify SDK artifacts when unverified artifacts are explicitly allowed', () => {
		SdkProperties.isUnverifiedSdkArtifactAllowed.mockReturnValue(true);

		SdkDownloadService._verifySdkArtifactIfNeeded(sdkPath);

		expect(SdkArtifactVerifier.verify).not.toHaveBeenCalled();
		expect(SdkProperties.getSdkSha256).not.toHaveBeenCalled();
	});

	it('fails on missing SHA-256 metadata when unverified artifacts are not allowed', () => {
		SdkProperties.isUnverifiedSdkArtifactAllowed.mockReturnValue(false);
		SdkArtifactVerifier.verify.mockImplementation(() => {
			throw new Error('missing checksum');
		});

		expect(() => SdkDownloadService._verifySdkArtifactIfNeeded(sdkPath)).toThrow('missing checksum');
	});
});
