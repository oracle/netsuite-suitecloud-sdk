/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

export {
	getProxyAgent,
	getSuiteCloudHttpsAgent,
	isProductionDomain,
	PROXY_ENVIRONMENT_VARIABLES,
	requestSuiteCloudHttps,
	resolveRuntimeProxyFromEnv,
	resolveSdkDownloadProxyFromEnv,
	validateProxyUri,
} from '../http/SuiteCloudHttpsClient';
export type { ProxyConfiguration } from '../http/SuiteCloudHttpsClient';
