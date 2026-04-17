/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const NodeTranslationService = require('../services/NodeTranslationService');
const { UTILS: { CLIENT_API_KEY_UTILS }, } = require('../services/TranslationKeys');

const FILE_FIELDS = {
	SCHEMA_VERSION: 'schemaVersion',
	DEFAULT_KEY: 'defaultKey',
	KEYS: 'keys',
};

const KEY_FIELDS = {
	CREATION_DATE: 'creationDate',
	VALUE: 'value',
};

const CURRENT_SCHEMA_VERSION = 1;
const DEFAULT_PROXY_KEY_NAME = 'proxyKey';

/**
 *
 * Class that represents the contents of 'client_api_key.p12'
 * The expected 'client_api_key.p12' file content/format goes as follows:
 *		{
 *			"schemaVersion": 1,
 *			"defaultKey": "proxyKey",
 *			"keys": {
 *				"proxyKey": {
 *					"creationDate": "2026-04-13T12:46:52.577Z",
 *					"value": "3d3dfe3ec58eb9b9826f4546de20f96f99f6b7ed1fcdcaaa5f3c252eb69dce56"
 *				}
 *			}
 *		}
 *
 */

class ClientAPIKeyFileContent {
	constructor(data = {}) {
		this.data = data;
	}

	getDefaultProxyKeyValue() {
		if (!this._containsDefaultProxyKeyValue()) {
			return "";
		}

		const defaultKeyName = this.data[FILE_FIELDS.DEFAULT_KEY];
		return this.data[FILE_FIELDS.KEYS][defaultKeyName][KEY_FIELDS.VALUE];
	}

	/**
	 * @param {string} proxyAPIKey must be 32 bytes long.
	 * @param {string} creationDate must represent a DateTime string following the ISO standard format "YYYY-MM-DDThh:mm:ss.SSSZ".
	 * @returns {void}
	 */
	setDefaultProxyKey(proxyAPIKey, creationDate = new Date().toISOString()) {
		if (!this._containsValidRequiredFields()) {
			throw NodeTranslationService.getMessage(CLIENT_API_KEY_UTILS.ERRORS.INVALID_FILE_CONTENTS);
		}

		const defaultKeyName = this.data[FILE_FIELDS.DEFAULT_KEY];
		this.data[FILE_FIELDS.KEYS][defaultKeyName] = {
			[KEY_FIELDS.CREATION_DATE] : creationDate,
			[KEY_FIELDS.VALUE] : proxyAPIKey,
		};
	}

	/**
	 * Returns the raw JSON contents that should be persisted into client_api_key.p12.
	 * Transport-specific escaping belongs at the SDK execution boundary.
	 * @returns {string}
	 */
	toJsonString() {
		return JSON.stringify(this.data);
	}

	_containsValidRequiredFields() {
		return Boolean(this.data[FILE_FIELDS.DEFAULT_KEY])
			&& Boolean(this.data[FILE_FIELDS.KEYS]);
	}

	_containsDefaultProxyKeyValue() {
		if (this._containsValidRequiredFields()) {
			return false;
		}
		const defaultKeyName = this.data[FILE_FIELDS.DEFAULT_KEY];
		return Boolean(this.data[FILE_FIELDS.KEYS][defaultKeyName]?.[KEY_FIELDS.VALUE]);
	}
}

/**
 * Parses the stringified contents of the client_api_key.p12 file into a ClientAPIKeyFileContent object.
 *
 * @param {string} stringifiedData a stringified JSON that follows the defined ClientAPIKeyFile schema.
 * @returns {ClientAPIKeyFileContent}
 */
function parseClientApiKeyContent(stringifiedData) {
	try {
		const data = !stringifiedData
			? createEmptyClientApiKeyContentData()
			: JSON.parse(stringifiedData);

		return new ClientAPIKeyFileContent(data);
	} catch (error) {
		throw NodeTranslationService.getMessage(CLIENT_API_KEY_UTILS.ERRORS.INVALID_FILE_CONTENTS);
	}
}

function createEmptyClientApiKeyContentData() {
	return {
		[FILE_FIELDS.SCHEMA_VERSION]: CURRENT_SCHEMA_VERSION,
		[FILE_FIELDS.DEFAULT_KEY]: DEFAULT_PROXY_KEY_NAME,
		[FILE_FIELDS.KEYS]: {},
	};
}

module.exports = {
	ClientAPIKeyFileContent,
	parseClientApiKeyContent,
};
