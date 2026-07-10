/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

jest.mock('node:https', () => ({
	...jest.requireActual('node:https'),
	request: jest.fn(() => ({ request: true })),
}));

const https = require('node:https');
const { http } = require('@oracle/suitecloud-sdk-core');

const SUITECLOUD_PROXY = 'SUITECLOUD_PROXY';
const NPM_CONFIG_HTTPS_PROXY = 'npm_config_https_proxy';
const NPM_CONFIG_PROXY = 'npm_config_proxy';
const PROXY_ENVIRONMENT_VARIABLE_NAMES = [SUITECLOUD_PROXY, NPM_CONFIG_HTTPS_PROXY, NPM_CONFIG_PROXY];
const originalProxyEnvironment = Object.fromEntries(
	PROXY_ENVIRONMENT_VARIABLE_NAMES.map((name) => [name, process.env[name]])
);

afterEach(() => {
	for (const name of PROXY_ENVIRONMENT_VARIABLE_NAMES) {
		const originalValue = originalProxyEnvironment[name];
		if (originalValue === undefined) {
			delete process.env[name];
		} else {
			process.env[name] = originalValue;
		}
	}
	jest.clearAllMocks();
});

describe('centralized SuiteCloud HTTPS proxy support', () => {
	it('resolves runtime and SDK download proxy configuration', () => {
		process.env[SUITECLOUD_PROXY] = 'http://proxy.example.com:8080';
		process.env[NPM_CONFIG_HTTPS_PROXY] = 'http://https.example.com:8081';

		expect(http.resolveRuntimeProxyFromEnv()).toEqual({
			proxyUri: 'http://proxy.example.com:8080',
			envVarName: SUITECLOUD_PROXY,
		});
		expect(http.resolveSdkDownloadProxyFromEnv()).toEqual({
			proxyUri: 'http://proxy.example.com:8080',
			envVarName: SUITECLOUD_PROXY,
		});
		expect(http.getProxyAgent(http.resolveRuntimeProxyFromEnv()).options.proxyEnv).toEqual({
			HTTP_PROXY: 'http://proxy.example.com:8080',
			HTTPS_PROXY: 'http://proxy.example.com:8080',
		});
	});

	it('resolves SUITECLOUD_PROXY for runtime traffic', () => {
		process.env[SUITECLOUD_PROXY] = 'http://proxy.example.com:8080';

		expect(http.resolveRuntimeProxyFromEnv()).toEqual({
			proxyUri: 'http://proxy.example.com:8080',
			envVarName: SUITECLOUD_PROXY,
		});
	});

	it('preserves the SDK download proxy priority', () => {
		process.env[SUITECLOUD_PROXY] = 'http://suitecloud.example.com:8080';
		process.env[NPM_CONFIG_HTTPS_PROXY] = 'http://https.example.com:8081';
		process.env[NPM_CONFIG_PROXY] = 'http://npm.example.com:8082';

		expect(http.resolveSdkDownloadProxyFromEnv()).toEqual({
			proxyUri: 'http://suitecloud.example.com:8080',
			envVarName: SUITECLOUD_PROXY,
		});

		delete process.env[SUITECLOUD_PROXY];
		expect(http.resolveSdkDownloadProxyFromEnv()).toEqual({
			proxyUri: 'http://https.example.com:8081',
			envVarName: NPM_CONFIG_HTTPS_PROXY,
		});
	});

	it.each([
		['not-a-url', 'valid proxy URL including a protocol, hostname, and port'],
		['ftp://proxy.example.com:21', 'unsupported protocol'],
		['https://proxy.example.com', 'valid proxy URL including a protocol, hostname, and port'],
	])('rejects invalid proxy configuration %s', (proxyUri, expectedMessage) => {
		expect(() => http.validateProxyUri({ proxyUri, envVarName: SUITECLOUD_PROXY })).toThrow(expectedMessage);
	});

	it('uses SUITECLOUD_PROXY for production SuiteCloud requests', () => {
		process.env[SUITECLOUD_PROXY] = 'http://proxy.example.com:8080';
		const responseListener = jest.fn();

		http.requestSuiteCloudHttps(
			'123456.suitetalk.api.netsuite.com',
			{ method: 'POST', path: '/services' },
			responseListener
		);

		const [requestOptions, listener] = https.request.mock.calls[0];
		expect(listener).toBe(responseListener);
		expect(requestOptions.agent).toBeInstanceOf(https.Agent);
		expect(requestOptions.agent.options.proxyEnv).toEqual({
			HTTP_PROXY: 'http://proxy.example.com:8080',
			HTTPS_PROXY: 'http://proxy.example.com:8080',
		});
	});

	it('preserves relaxed TLS only for internal VM hosts', () => {
		process.env[SUITECLOUD_PROXY] = 'http://proxy.example.com:8080';

		http.requestSuiteCloudHttps('test.vm.eng', { method: 'GET' }, jest.fn());
		const [requestOptions] = https.request.mock.calls[0];

		expect(requestOptions.agent).toBeInstanceOf(https.Agent);
		expect(requestOptions.agent.options.rejectUnauthorized).toBe(false);
		expect(requestOptions.agent.options.proxyEnv).toBeUndefined();
	});

	it('does not apply the production proxy to non-production hosts', () => {
		process.env[SUITECLOUD_PROXY] = 'http://proxy.example.com:8080';

		http.requestSuiteCloudHttps('test.f.eng', { method: 'GET' }, jest.fn());
		const [requestOptions] = https.request.mock.calls[0];

		expect(requestOptions.agent).toBeUndefined();
	});
});
