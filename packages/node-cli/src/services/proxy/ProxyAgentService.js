/*
 ** Copyright (c) 2022 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const https = require('node:https');
const ProxyEnvironmentUtils = require('./ProxyEnvironmentUtils');

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