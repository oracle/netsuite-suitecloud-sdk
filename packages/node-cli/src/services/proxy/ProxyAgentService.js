/*
 ** Copyright (c) 2022 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const https = require('node:https');
const ProxyEnvironmentUtils = require('./ProxyEnvironmentUtils');

/**
 * Returns an HTTPS agent configured to use the provided proxy URI for both HTTP and HTTPS requests.
 *
 * @param {{ proxyUri: string } | undefined} configuredProxy Proxy settings to validate and apply.
 * @returns {https.Agent | undefined} The configured HTTPS agent, or `undefined` if no proxy was provided.
 */
function getProxyAgent(configuredProxy) {
	if (!configuredProxy) {
		return undefined;
	}

	ProxyEnvironmentUtils.validateUriProxy(configuredProxy);

	return new https.Agent({
		proxyEnv: {
			HTTP_PROXY: configuredProxy.proxyUri,
			HTTPS_PROXY: configuredProxy.proxyUri,
		},
	});
}
module.exports = { getProxyAgent };