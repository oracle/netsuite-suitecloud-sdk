/*
 ** Copyright (c) 2022 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { HttpsProxyAgent } = require('hpagent');
const NodeTranslationService = require('./NodeTranslationService');
const {
	ENV_VARS,
	SUITECLOUD_PROXY_SERVICE: { SUPPORTED_PROTOCOLS },
} = require('../ApplicationConstants');
const { SUITECLOUD_AUTH_PROXY_SERVICE } = require('./TranslationKeys');

const SUPPORTED_PROXY_PROTOCOLS = new Set(SUPPORTED_PROTOCOLS);


class ProxyService {
	getProxyAgent() {
		const proxyURL = this.getConfiguredProxy();
		if (proxyURL) {
			return this.createProxyAgent(proxyURL);
		}
		return undefined;
	}

	createProxyAgent(proxyURL) {
		const proxyAgentOptions = {
			keepAlive: true,
			keepAliveMsecs: 1000,
			maxSockets: 256,
			maxFreeSockets: 256,
			scheduling: 'lifo',
			proxy: proxyURL,
		};

		return this.createHttpsProxyAgent(proxyAgentOptions);
	}

	createHttpsProxyAgent(options) {
		return new HttpsProxyAgent(options);
	}


	getConfiguredProxy() {
		const proxyValue = this.getConfiguredProxyValue();
		if (!proxyValue) {
			return undefined;
		}

		let proxyURL;
		try {
			proxyURL = new URL(proxyValue);
		} catch (error) {
			throw NodeTranslationService.getMessage(
				SUITECLOUD_AUTH_PROXY_SERVICE.INVALID_PROXY_CONFIGURATION,
				ENV_VARS.SUITECLOUD_PROXY,
				proxyValue
			);
		}

		if (!SUPPORTED_PROXY_PROTOCOLS.has(proxyURL.protocol)) {
			throw NodeTranslationService.getMessage(
				SUITECLOUD_AUTH_PROXY_SERVICE.UNSUPPORTED_PROXY_PROTOCOL
			);
		}

		return proxyURL;
	}

	getConfiguredProxyValue() {
		return process.env[ENV_VARS.SUITECLOUD_PROXY];
	}
}

module.exports = ProxyService;