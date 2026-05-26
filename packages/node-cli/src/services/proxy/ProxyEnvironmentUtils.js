const {
	ENV_VARS,
} = require('../../ApplicationConstants');
const {
	PROTOCOL,
} = require('../../utils/http/HttpConstants');
const NodeTranslationService = require('../NodeTranslationService');
const {
	PROXY_AGENT_SERVICE,
} = require('../TranslationKeys');

const DEFAULT_INVALID_URL_CODE = 'ERR_INVALID_URL';

/**
 * validates the Uri from the Proxy is correct.
 *
 * @param {{ proxyUri: string, envVarName: string }} configuredProxy Proxy configuration to validate. envVarName
 * is the environment variable where the value is retrieved. proxyUri is the value itself.
 * @throws {Error} When `proxyUri` is invalid, uses an unsupported protocol, or does not include a valid port.
 * The thrown error message includes the source environment variable name and configured value.
 */
function validateProxyUri(configuredProxy) {
	let parsedProxyUri;
	try {
		parsedProxyUri = new URL(configuredProxy.proxyUri);
	} catch (error) {
		const proxyError = new Error(
			NodeTranslationService.getMessage(
				PROXY_AGENT_SERVICE.INVALID_PROXY_CONFIGURATION,
				configuredProxy.envVarName,
				configuredProxy.proxyUri,
			),
		);
		proxyError.code = error.code;
		throw proxyError;
	}

	if (![PROTOCOL.HTTP, PROTOCOL.HTTPS].includes(parsedProxyUri.protocol)) {
		const proxyError = new Error(
			NodeTranslationService.getMessage(
				PROXY_AGENT_SERVICE.UNSUPPORTED_PROXY_PROTOCOL,
				configuredProxy.envVarName,
				configuredProxy.proxyUri,
			),
		);
		proxyError.code = DEFAULT_INVALID_URL_CODE;
		throw proxyError;
	}

	if (!hasExplicitPort(configuredProxy.proxyUri)) {
		const proxyError = new Error(
			NodeTranslationService.getMessage(
				PROXY_AGENT_SERVICE.INVALID_PROXY_CONFIGURATION,
				configuredProxy.envVarName,
				configuredProxy.proxyUri,
			),
		);
		proxyError.code = DEFAULT_INVALID_URL_CODE;
		throw proxyError;
	}
}

function hasExplicitPort(uri) {
	return /^[a-zA-Z]+:\/\/[^:/]+:\d+$/.test(uri);
}

//TODO We should consider standard proxy variables instead: http_proxy, HTTP_PROXY, https_proxy and HTTPS_PROXY
/**
 * Resolves the proxy configuration used by the CLI at runtime from environment SUITECLOUD_PROXY.
 *
 * @returns {{ proxyUri: string, envVarName: string } | undefined} The resolved proxy configuration, or `undefined` when no runtime proxy is configured.
 */
function resolveRuntimeProxyFromEnv() {
	if (process.env[ENV_VARS.SUITECLOUD_PROXY]) {
		return {
			proxyUri: process.env[ENV_VARS.SUITECLOUD_PROXY],
			envVarName: ENV_VARS.SUITECLOUD_PROXY,
		};
	}
	return undefined;
}

/**
 * Resolves the proxy configuration used for SDK downloads from supported environment variables.
 *
 * Resolution order:
 * 1. `SUITECLOUD_PROXY`
 * 2. `NPM_CONFIG_HTTPS_PROXY`
 * 3. `NPM_CONFIG_PROXY`
 *
 * @returns {{ proxyUri: string, envVarName: string } | undefined} The first matching proxy configuration, or `undefined` when no supported proxy variable is set.
 */
function resolveSdkDownloadProxyFromEnv() {
	if (process.env[ENV_VARS.SUITECLOUD_PROXY]) {
		return {
			proxyUri: process.env[ENV_VARS.SUITECLOUD_PROXY],
			envVarName: ENV_VARS.SUITECLOUD_PROXY,
		};
	}
	if (process.env[ENV_VARS.NPM_CONFIG_HTTPS_PROXY]) {
		return {
			proxyUri: process.env[ENV_VARS.NPM_CONFIG_HTTPS_PROXY],
			envVarName: ENV_VARS.NPM_CONFIG_HTTPS_PROXY,
		};
	}
	if (process.env[ENV_VARS.NPM_CONFIG_PROXY]) {
		return {
			proxyUri: process.env[ENV_VARS.NPM_CONFIG_PROXY],
			envVarName: ENV_VARS.NPM_CONFIG_PROXY,
		};
	}
	return undefined;
}

module.exports = { validateProxyUri, resolveRuntimeProxyFromEnv, resolveSdkDownloadProxyFromEnv };
