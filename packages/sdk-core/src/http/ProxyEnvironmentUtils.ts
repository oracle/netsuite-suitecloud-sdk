/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { UTILS } from '../services/translation/TranslationKeys';
import { translationService } from '../services/translation/TranslationService';

export const PROXY_ENVIRONMENT_VARIABLES = {
	SUITECLOUD_PROXY: 'SUITECLOUD_PROXY',
	NPM_CONFIG_HTTPS_PROXY: 'npm_config_https_proxy',
	NPM_CONFIG_PROXY: 'npm_config_proxy',
} as const;

export type ProxyConfiguration = { proxyUri: string; envVarName: string };
export type ProxyEnvironment = NodeJS.ProcessEnv;

const PROTOCOL_HTTP = 'http:';
const PROTOCOL_HTTPS = 'https:';
const DEFAULT_INVALID_URL_CODE = 'ERR_INVALID_URL';

/** Validates a proxy URI using the established CLI rules. */
export function validateProxyUri(configuredProxy: ProxyConfiguration): void {
	let parsedProxyUri: URL;
	try {
		parsedProxyUri = new URL(configuredProxy.proxyUri);
	} catch (error: unknown) {
		throw createInvalidProxyConfigurationError(configuredProxy, getErrorCode(error));
	}

	if (![PROTOCOL_HTTP, PROTOCOL_HTTPS].includes(parsedProxyUri.protocol)) {
		const proxyError = new Error(
			translationService.getMessage(
				UTILS.PROXY_CONFIG.ERROR.UNSUPPORTED_PROTOCOL,
				configuredProxy.envVarName,
				configuredProxy.proxyUri
			)
		) as Error & { code?: string };
		proxyError.code = DEFAULT_INVALID_URL_CODE;
		throw proxyError;
	}

	if (!hasExplicitPort(configuredProxy.proxyUri)) {
		throw createInvalidProxyConfigurationError(configuredProxy, DEFAULT_INVALID_URL_CODE);
	}
}

export function resolveRuntimeProxyFromEnv(environment: ProxyEnvironment = process.env): ProxyConfiguration | undefined {
	return readProxyConfiguration(environment, PROXY_ENVIRONMENT_VARIABLES.SUITECLOUD_PROXY);
}

export function resolveSdkDownloadProxyFromEnv(environment: ProxyEnvironment = process.env): ProxyConfiguration | undefined {
	return (
		readProxyConfiguration(environment, PROXY_ENVIRONMENT_VARIABLES.SUITECLOUD_PROXY) ??
		readProxyConfiguration(environment, PROXY_ENVIRONMENT_VARIABLES.NPM_CONFIG_HTTPS_PROXY) ??
		readProxyConfiguration(environment, PROXY_ENVIRONMENT_VARIABLES.NPM_CONFIG_PROXY)
	);
}

function hasExplicitPort(uri: string): boolean {
	return /^[a-zA-Z][a-zA-Z\d+.-]*:\/\/[^/?#]*:\d+\/?$/.test(uri);
}

function readProxyConfiguration(environment: ProxyEnvironment, envVarName: string): ProxyConfiguration | undefined {
	const proxyUri = environment[envVarName];
	return proxyUri ? { proxyUri, envVarName } : undefined;
}

function createInvalidProxyConfigurationError(
	configuredProxy: ProxyConfiguration,
	code: string | undefined
): Error & { code?: string } {
	const proxyError = new Error(
		translationService.getMessage(
			UTILS.PROXY_CONFIG.ERROR.INVALID_CONFIGURATION,
			configuredProxy.envVarName,
			configuredProxy.proxyUri
		)
	) as Error & { code?: string };
	proxyError.code = code ?? DEFAULT_INVALID_URL_CODE;
	return proxyError;
}

function getErrorCode(error: unknown): string | undefined {
	return error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
		? error.code
		: undefined;
}
