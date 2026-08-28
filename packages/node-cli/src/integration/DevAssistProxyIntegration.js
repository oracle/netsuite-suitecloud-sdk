/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const path = require('node:path');
const SdkExecutor = require('../SdkExecutor');
const {
	readClientAPIKeyFileContents,
	writeClientAPIKeyFileContents,
} = require('../utils/ClientAPIKeyUtils');
const { ClientAPIKeyObjectWrapper } = require('../utils/ClientAPIKeyObjectWrapper');
const { generateAPIKey } = require('../utils/APIKeyGenerator');

const PROXY_START_COMMAND = 'proxy:start';
const PROXY_SDK_PATH_ENVIRONMENT_VARIABLE = 'SUITECLOUD_DEVASSIST_PROXY_SDK_PATH';

const createSdkExecutor = (sdkPath, executionEnvironmentContext) =>
	new SdkExecutor(sdkPath, executionEnvironmentContext);

async function readProxyApiKey(sdkPath, executionEnvironmentContext) {
	const readResult = await readClientAPIKeyFileContents(
		createSdkExecutor(sdkPath, executionEnvironmentContext)
	);
	const apiKey = new ClientAPIKeyObjectWrapper(readResult.data).getDefaultKeyValue();
	return typeof apiKey === 'string' && apiKey.trim() ? apiKey.trim() : undefined;
}

async function generateAndStoreProxyApiKey(sdkPath, executionEnvironmentContext) {
	const sdkExecutor = createSdkExecutor(sdkPath, executionEnvironmentContext);
	const readResult = await readClientAPIKeyFileContents(sdkExecutor);
	const wrapper = new ClientAPIKeyObjectWrapper(readResult.data);
	const apiKey = generateAPIKey();
	wrapper.setDefaultKeyValue(apiKey);
	const writeResult = await writeClientAPIKeyFileContents(sdkExecutor, wrapper.toJsonString());
	return { apiKey, writeResult };
}

const getCliEntrypointPath = () => path.join(__dirname, '..', 'suitecloud.js');

const createProxyStartEnvironment = (sdkPath, baseEnvironment = process.env) => {
	if (typeof sdkPath !== 'string' || !path.isAbsolute(sdkPath)) {
		throw new Error('The SuiteCloud proxy SDK path must be absolute.');
	}
	return {
		...baseEnvironment,
		[PROXY_SDK_PATH_ENVIRONMENT_VARIABLE]: sdkPath,
	};
};

const resolveCliSdkPath = (commandName, defaultSdkPath, environment = process.env) => {
	if (commandName !== PROXY_START_COMMAND) {
		return defaultSdkPath;
	}
	const proxySdkPath = environment[PROXY_SDK_PATH_ENVIRONMENT_VARIABLE];
	return typeof proxySdkPath === 'string' && path.isAbsolute(proxySdkPath)
		? proxySdkPath
		: defaultSdkPath;
};

const isProxyStartSupported = () => {
	try {
		require.resolve('../commands/proxy/start/ProxyStartCommand');
		return true;
	} catch {
		return false;
	}
};

module.exports = {
	createProxyStartEnvironment,
	generateAndStoreProxyApiKey,
	getCliEntrypointPath,
	isProxyStartSupported,
	readProxyApiKey,
	resolveCliSdkPath,
};
