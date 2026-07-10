/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import {
	Agent,
	request as httpsRequest,
	type AgentOptions,
	type RequestOptions,
} from 'node:https';
import type { ClientRequest, IncomingMessage } from 'node:http';

export const PROXY_ENVIRONMENT_VARIABLES = {
	SUITECLOUD_PROXY: 'SUITECLOUD_PROXY',
	NPM_CONFIG_HTTPS_PROXY: 'npm_config_https_proxy',
	NPM_CONFIG_PROXY: 'npm_config_proxy',
} as const;

export type ProxyConfiguration = {
	proxyUri: string;
	envVarName: string;
};

type ProxyEnvironment = NodeJS.ProcessEnv;

const PROTOCOL_HTTP = 'http:';
const PROTOCOL_HTTPS = 'https:';
const DEFAULT_INVALID_URL_CODE = 'ERR_INVALID_URL';
const VM_ENG_HOST_SUFFIX = 'vm.eng';
const REGEX_SYSTEM_URL = /^system\.netsuite\.com$/;
const REGEX_ACCOUNT_SPECIFIC_URL = /^[\w-]+\.app\.netsuite\.com$/;
const REGEX_SUITETALK_API_PRODUCTION_URL = /^[\w-]+\.suitetalk\.api\.netsuite\.com$/;

/**
 * Validates a proxy URI using the same rules as the Java CLI and the existing Node CLI:
 * only HTTP(S) proxy URLs with an explicitly declared port are accepted.
 */
export function validateProxyUri(configuredProxy: ProxyConfiguration): void {
	let parsedProxyUri: URL;
	try {
		parsedProxyUri = new URL(configuredProxy.proxyUri);
	} catch (error: unknown) {
		throw createInvalidProxyConfigurationError(configuredProxy, getErrorCode(error));
	}

	if (![PROTOCOL_HTTP, PROTOCOL_HTTPS].includes(parsedProxyUri.protocol)) {
		const proxyError = new Error(
			`You specified an unsupported protocol for the ${configuredProxy.envVarName} environment variable. ` +
				`Enter a proxy URL with either the http or https protocol.\nReceived: ${configuredProxy.proxyUri}.`
		) as Error & { code?: string };
		proxyError.code = DEFAULT_INVALID_URL_CODE;
		throw proxyError;
	}

	if (!hasExplicitPort(configuredProxy.proxyUri)) {
		throw createInvalidProxyConfigurationError(configuredProxy, DEFAULT_INVALID_URL_CODE);
	}
}

/** Resolves the proxy used by runtime SuiteCloud requests. */
export function resolveRuntimeProxyFromEnv(environment: ProxyEnvironment = process.env): ProxyConfiguration | undefined {
	return readProxyConfiguration(environment, PROXY_ENVIRONMENT_VARIABLES.SUITECLOUD_PROXY);
}

/**
 * Resolves the proxy used for SDK downloads, preserving the established priority:
 * SUITECLOUD_PROXY, npm_config_https_proxy, then npm_config_proxy.
 */
export function resolveSdkDownloadProxyFromEnv(environment: ProxyEnvironment = process.env): ProxyConfiguration | undefined {
	return (
		readProxyConfiguration(environment, PROXY_ENVIRONMENT_VARIABLES.SUITECLOUD_PROXY) ??
		readProxyConfiguration(environment, PROXY_ENVIRONMENT_VARIABLES.NPM_CONFIG_HTTPS_PROXY) ??
		readProxyConfiguration(environment, PROXY_ENVIRONMENT_VARIABLES.NPM_CONFIG_PROXY)
	);
}

/** Creates an HTTPS agent for an explicitly supplied proxy configuration. */
export function getProxyAgent(configuredProxy: ProxyConfiguration | undefined): Agent | undefined {
	if (!configuredProxy) {
		return undefined;
	}

	validateProxyUri(configuredProxy);
	return new Agent({
		proxyEnv: {
			HTTP_PROXY: configuredProxy.proxyUri,
			HTTPS_PROXY: configuredProxy.proxyUri,
		},
	} as AgentOptions);
}

/** Returns whether a hostname is one of the SuiteCloud production domains that supports SUITECLOUD_PROXY. */
export function isProductionDomain(hostName: string): boolean {
	return (
		REGEX_SYSTEM_URL.test(hostName) ||
		REGEX_ACCOUNT_SPECIFIC_URL.test(hostName) ||
		REGEX_SUITETALK_API_PRODUCTION_URL.test(hostName)
	);
}

/**
 * Creates the agent required by a SuiteCloud request.
 * Production traffic honors SUITECLOUD_PROXY; internal VM traffic preserves the existing relaxed TLS behavior.
 */
export function getSuiteCloudHttpsAgent(hostName: string, environment: ProxyEnvironment = process.env): Agent | undefined {
	if (isProductionDomain(hostName)) {
		return getProxyAgent(resolveRuntimeProxyFromEnv(environment));
	}
	if (hostName.includes(VM_ENG_HOST_SUFFIX)) {
		return new Agent({ rejectUnauthorized: false });
	}
	return undefined;
}

/** Centralized HTTPS request entry point for SuiteCloud services. */
export function requestSuiteCloudHttps(
	hostName: string,
	requestOptions: RequestOptions,
	responseListener: (response: IncomingMessage) => void
): ClientRequest {
	return httpsRequest(
		{
			...requestOptions,
			agent: getSuiteCloudHttpsAgent(hostName),
		},
		responseListener
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
		`The ${configuredProxy.envVarName} environment variable must contain a valid proxy URL including a protocol, ` +
			`hostname, and port. For example, http://my-proxy-domain:80.\nReceived: ${configuredProxy.proxyUri}.`
	) as Error & { code?: string };
	proxyError.code = code ?? DEFAULT_INVALID_URL_CODE;
	return proxyError;
}

function getErrorCode(error: unknown): string | undefined {
	return error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
		? error.code
		: undefined;
}
