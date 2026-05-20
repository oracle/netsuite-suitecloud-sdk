/*
 ** Copyright (c) 2022 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const https = require('node:https');
const NodeTranslationService = require('./NodeTranslationService');
const {
	PROXY_AGENT_SERVICE,
} = require('./TranslationKeys');

const {
	ENV_VARS: {
		SUITECLOUD_PROXY,
	},
} = require('../ApplicationConstants');

class ProxyAgentService {
	static getProxyAgent(configuredProxyUri) {

		if (!configuredProxyUri) {
			return undefined;
		}

		this._validateUriProxy(configuredProxyUri);

		return new https.Agent({
			proxyEnv: {
				HTTP_PROXY: configuredProxyUri,
				HTTPS_PROXY: configuredProxyUri,
			},
		});
	}

	static _validateUriProxy(configuredProxyUri) {
		try {
			new URL(configuredProxyUri);
		} catch (error) {
			const proxyError = new Error(
				NodeTranslationService.getMessage(
					PROXY_AGENT_SERVICE.INVALID_PROXY_CONFIGURATION,
					SUITECLOUD_PROXY,
					configuredProxyUri,
				),
			);
			proxyError.code = error.code;
			throw proxyError;
		}
	}
}

module.exports = ProxyAgentService;