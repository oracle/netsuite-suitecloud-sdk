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

function validateUriProxy(configuredProxy) {
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

	if (!parsedProxyUri.port || Number.isNaN(Number(parsedProxyUri.port))) {
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

//TODO We should consider standard proxy variables instead
//http_proxy, HTTP_PROXY, https_proxy and HTTPS_PROXY
function resolveRuntimeProxyFromEnv() {
	if (process.env[ENV_VARS.SUITECLOUD_PROXY]) {
		return {
			proxyUri: process.env[ENV_VARS.SUITECLOUD_PROXY],
			envVarName: ENV_VARS.SUITECLOUD_PROXY,
		};
	}
	return undefined;
}

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

module.exports = { validateUriProxy, resolveRuntimeProxyFromEnv, resolveSdkDownloadProxyFromEnv };
