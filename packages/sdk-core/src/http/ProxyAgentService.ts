/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { Agent, type AgentOptions } from 'node:https';
import { type ProxyConfiguration, validateProxyUri } from './ProxyEnvironmentUtils';

/** Returns an HTTPS agent configured to use the supplied proxy for HTTP and HTTPS requests. */
export function getProxyAgent(configuredProxy: ProxyConfiguration | undefined): Agent | undefined {
	if (!configuredProxy) {
		return undefined;
	}

	validateProxyUri(configuredProxy);
	return new Agent({
		proxyEnv: { HTTP_PROXY: configuredProxy.proxyUri, HTTPS_PROXY: configuredProxy.proxyUri },
	} as AgentOptions);
}
