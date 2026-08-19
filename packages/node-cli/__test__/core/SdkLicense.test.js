/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

jest.mock('child_process', () => ({
	spawnSync: jest.fn(),
}));

jest.mock('os', () => ({
	platform: jest.fn(),
}));

const os = require('os');
const { spawnSync } = require('child_process');
const SdkLicense = require('../../src/core/sdksetup/SdkLicense');

describe('SdkLicense', () => {
	const licenseAcceptanceEnvironmentVariable = 'SUITECLOUD_CLI_ACCEPT_LICENSE';

	beforeEach(() => {
		delete process.env[licenseAcceptanceEnvironmentVariable];
		delete process.env.npm_config_acceptsuitecloudsdklicense;
		delete process.env.npm_config_acceptSuiteCloudSDKLicense;
		os.platform.mockReturnValue('darwin');
		spawnSync.mockReturnValue({ status: 0 });
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('does not display the license when it has been accepted through the SuiteCloud environment variable', () => {
		process.env[licenseAcceptanceEnvironmentVariable] = 'true';

		SdkLicense.show();

		expect(spawnSync).not.toHaveBeenCalled();
	});

	it('displays the license when the SuiteCloud environment variable is not set to true', () => {
		process.env[licenseAcceptanceEnvironmentVariable] = 'false';

		SdkLicense.show();

		expect(spawnSync).toHaveBeenCalledWith(
			'open',
			['resources/FUTC-LICENSE.txt'],
			{ stdio: 'ignore', detached: true, shell: true }
		);
	});

	it('continues to support the legacy npm configuration environment variable', () => {
		process.env.npm_config_acceptsuitecloudsdklicense = 'true';

		SdkLicense.show();

		expect(spawnSync).not.toHaveBeenCalled();
	});
});
