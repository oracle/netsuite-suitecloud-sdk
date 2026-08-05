/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

function loadContext({ osType, osRelease = '', powershellCaption = '' }) {
	let ExecutionEnvironmentContext;
	jest.isolateModules(() => {
		jest.doMock('os', () => ({
			type: () => osType,
			release: () => osRelease,
		}));
		jest.doMock('child_process', () => ({
			spawnSync: (command) => {
				if (command === 'powershell.exe') {
					return { status: 0, stdout: powershellCaption };
				}
				return { stderr: 'openjdk version "17.0.6"' };
			},
		}));
		ExecutionEnvironmentContext = require('../src/ExecutionEnvironmentContext');
	});
	return ExecutionEnvironmentContext;
}

describe('ExecutionEnvironmentContext telemetry', () => {
	afterEach(() => jest.resetModules());
	const architecture = process.arch === 'x64' ? 'amd64' : process.arch === 'arm64' ? 'aarch64' : process.arch;

	it('uses the Java wire format and Mac OS X value', () => {
		const Context = loadContext({ osType: 'Darwin' });
		expect(new Context({ platform: 'VSCode', platformVersion: '1.99.0' }).toUserAgentString())
			.toBe(`VSCode/1.99.0 MacOSX SuiteCloudSDK/2026.1.0 Java/17.0.6;${architecture}`);
	});

	it('uses the Windows product caption rather than the kernel version', () => {
		const Context = loadContext({
			osType: 'Windows_NT',
			osRelease: '10.0.26100',
			powershellCaption: 'Microsoft Windows Server 2025 Datacenter',
		});
		expect(new Context({ platform: 'SuiteCloudCLIforNode.js', platformVersion: 'v24.16.0' }).toUserAgentString())
			.toBe(`SuiteCloudCLIforNode.js/v24.16.0 WindowsServer2025 SuiteCloudSDK/2026.1.0 Java/17.0.6;${architecture}`);
	});
});
