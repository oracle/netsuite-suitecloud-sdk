/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const {
	SUITECLOUD_PROXY_SERVICE: {
		REGEX_SYSTEM_URL,
		REGEX_ACCOUNT_SPECIFIC_URL,
		REGEX_SUITETALK_API_PRODUCTION_URL,
	}, ENV_VARS,
} = require('../ApplicationConstants');

class UriUtils {
	static isProductionUrl(url) {
		return (
			REGEX_SYSTEM_URL.test(url) ||
			REGEX_ACCOUNT_SPECIFIC_URL.test(url) ||
			REGEX_SUITETALK_API_PRODUCTION_URL.test(url)
		);
	}

	static getSuiteCloudProxyValueFromEnvVariables() {
		return process.env[ENV_VARS.SUITECLOUD_PROXY];
	}

	static shouldBypassProxy(targetHost) {
		const noProxyValue = process.env.NO_PROXY || process.env.no_proxy;

		if (!targetHost || !noProxyValue) {
			return false;
		}

		const normalizedTargetHost = targetHost.toLowerCase();
		return noProxyValue
			.split(',')
			.map((entry) => entry.trim().toLowerCase())
			.filter(Boolean)
			.some((entry) => UriUtils._matchesNoProxyEntry(normalizedTargetHost, entry));
	}

	static _matchesNoProxyEntry(targetHost, noProxyEntry) {
		if (noProxyEntry === '*') {
			return true;
		}

		const normalizedEntry = noProxyEntry.startsWith('.') ? noProxyEntry.slice(1) : noProxyEntry;
		return targetHost === normalizedEntry || targetHost.endsWith(`.${normalizedEntry}`);
	}
}

module.exports = UriUtils;