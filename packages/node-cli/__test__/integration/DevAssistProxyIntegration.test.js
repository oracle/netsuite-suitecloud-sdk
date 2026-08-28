/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
	createProxyStartEnvironment,
	getCliEntrypointPath,
	isProxyStartSupported,
	resolveCliSdkPath,
} = require('../../src/integration/DevAssistProxyIntegration');

describe('Dev Assist proxy integration facade', () => {
	it('exposes the CLI entrypoint used to start the proxy', () => {
		expect(fs.existsSync(getCliEntrypointPath())).toBe(true);
	});

	it('reports proxy:start support through the stable integration boundary', () => {
		expect(isProxyStartSupported()).toBe(true);
	});

	it('passes an absolute SDK path to a proxy child process', () => {
		const vscodeSdkPath = path.resolve('/suitecloud-sdk/vscode/cli.jar');
		const environment = createProxyStartEnvironment(vscodeSdkPath, { PATH: '/usr/bin' });

		expect(environment.PATH).toBe('/usr/bin');
		expect(resolveCliSdkPath('proxy:start', '/suitecloud-sdk/cli/cli.jar', environment))
			.toBe(vscodeSdkPath);
	});

	it('does not override the SDK path for other CLI commands', () => {
		const cliSdkPath = path.resolve('/suitecloud-sdk/cli/cli.jar');
		const environment = createProxyStartEnvironment(
			path.resolve('/suitecloud-sdk/vscode/cli.jar'),
			{}
		);

		expect(resolveCliSdkPath('project:deploy', cliSdkPath, environment)).toBe(cliSdkPath);
	});

	it('rejects a relative proxy SDK path at the process boundary', () => {
		expect(() => createProxyStartEnvironment('relative/cli.jar', {}))
			.toThrow('The SuiteCloud proxy SDK path must be absolute.');
	});
});
