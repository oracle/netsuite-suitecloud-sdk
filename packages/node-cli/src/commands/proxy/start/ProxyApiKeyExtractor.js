/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const NodeTranslationService = require('../../../services/NodeTranslationService');
const { COMMAND_PROXY_START } = require('../../../services/TranslationKeys');

const PROXY_KEY_ROOT = 'PROXY_KEY';
const API_KEY_PROPERTY = 'apiKey';

module.exports = class ProxyApiKeyExtractor {
	static extractApiKey(rawProxyKeyPayload) {
		if (rawProxyKeyPayload === undefined || rawProxyKeyPayload === null) {
			throw NodeTranslationService.getMessage(COMMAND_PROXY_START.ERRORS.MISSING_API_KEY);
		}

		if (typeof rawProxyKeyPayload === 'string' && !rawProxyKeyPayload.trim()) {
			throw NodeTranslationService.getMessage(COMMAND_PROXY_START.ERRORS.MISSING_API_KEY);
		}

		const parsedPayload = this._parsePayload(rawProxyKeyPayload);
		if (!parsedPayload || typeof parsedPayload !== 'object') {
			throw NodeTranslationService.getMessage(COMMAND_PROXY_START.ERRORS.INVALID_PROXY_KEY_PAYLOAD);
		}

		const apiKey = parsedPayload?.[PROXY_KEY_ROOT]?.[API_KEY_PROPERTY];
		if (typeof apiKey !== 'string' || !apiKey.trim()) {
			throw NodeTranslationService.getMessage(COMMAND_PROXY_START.ERRORS.MISSING_API_KEY);
		}

		return {
			apiKey,
		};
	}

	static _parsePayload(rawProxyKeyPayload) {
		if (typeof rawProxyKeyPayload === 'string') {
			try {
				return JSON.parse(rawProxyKeyPayload);
			} catch (e) {
				throw NodeTranslationService.getMessage(COMMAND_PROXY_START.ERRORS.INVALID_PROXY_KEY_PAYLOAD);
			}
		}

		return rawProxyKeyPayload;
	}
};
