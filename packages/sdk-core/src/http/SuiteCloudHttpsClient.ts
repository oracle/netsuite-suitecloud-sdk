/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import {
	Agent,
	request as httpsRequest,
	type RequestOptions,
} from 'node:https';
import type { ClientRequest, IncomingMessage } from 'node:http';
import { getProxyAgent } from './ProxyAgentService';
import { resolveRuntimeProxyFromEnv, type ProxyEnvironment } from './ProxyEnvironmentUtils';

export { getProxyAgent } from './ProxyAgentService';
export {
	PROXY_ENVIRONMENT_VARIABLES,
	resolveRuntimeProxyFromEnv,
	resolveSdkDownloadProxyFromEnv,
	validateProxyUri,
} from './ProxyEnvironmentUtils';
export type { ProxyConfiguration } from './ProxyEnvironmentUtils';
const VM_ENG_HOST_SUFFIX = 'vm.eng';
const REGEX_SYSTEM_URL = /^system\.netsuite\.com$/;
const REGEX_ACCOUNT_SPECIFIC_URL = /^[\w-]+\.app\.netsuite\.com$/;
const REGEX_SUITETALK_API_PRODUCTION_URL = /^[\w-]+\.suitetalk\.api\.netsuite\.com$/;

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
