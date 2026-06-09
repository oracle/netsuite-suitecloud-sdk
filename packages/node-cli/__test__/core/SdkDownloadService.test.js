/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

jest.mock('../../src/core/sdksetup/SdkProperties', () => ({
	getDownloadURL: jest.fn(),
	getSdkFileName: jest.fn(),
	getSdkSha256: jest.fn(),
	isCustomSdkMetadataUsed: jest.fn(),
}));

jest.mock('../../src/core/sdksetup/SdkArtifactVerifier', () => ({
	verify: jest.fn(),
}));

const SdkProperties = require('../../src/core/sdksetup/SdkProperties');
const SdkArtifactVerifier = require('../../src/core/sdksetup/SdkArtifactVerifier');
const SdkDownloadService = require('../../src/core/sdksetup/SdkDownloadService');
const fs = require('fs');

describe('SdkDownloadService', () => {
	const sdkParentDirectory = '/tmp/.suitecloud-sdk';
	const sdkDirectory = '/tmp/.suitecloud-sdk/node-cli';
	const sdkFilename = 'sdk.jar';
	const sdkDownloadUrl = 'https://example.com/sdk';

	beforeEach(() => {
		jest.clearAllMocks();
		SdkProperties.getDownloadURL.mockReturnValue(sdkDownloadUrl);
		SdkProperties.getSdkFileName.mockReturnValue(sdkFilename);
		SdkProperties.isCustomSdkMetadataUsed.mockReturnValue(false);
		SdkDownloadService._fileSystemService.createFolder = jest
			.fn()
			.mockReturnValueOnce(sdkParentDirectory)
			.mockReturnValueOnce(sdkDirectory);
		jest.spyOn(SdkDownloadService, '_removeJarFilesFrom').mockImplementation(() => {});
		jest.spyOn(SdkDownloadService, '_downloadJarFilePromise').mockResolvedValue();
		SdkDownloadService._fileSystemService.deleteFileIfExists = jest.fn();
		jest.spyOn(fs, 'renameSync').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('delegates SDK artifact verification to SdkArtifactVerifier with SDK properties', async () => {
		const temporarySdkPath = `${sdkDirectory}/${sdkFilename}.tmp`;
		const finalSdkPath = `${sdkDirectory}/${sdkFilename}`;

		await SdkDownloadService.download();

		expect(SdkDownloadService._downloadJarFilePromise).toHaveBeenCalledWith(
			`${sdkDownloadUrl}/${sdkFilename}`,
			temporarySdkPath,
			undefined,
			false
		);
		expect(SdkArtifactVerifier.verify).toHaveBeenCalledWith(temporarySdkPath, SdkProperties);
		expect(SdkDownloadService._fileSystemService.deleteFileIfExists).toHaveBeenCalledWith(finalSdkPath);
		expect(fs.renameSync).toHaveBeenCalledWith(temporarySdkPath, finalSdkPath);
	});
});
