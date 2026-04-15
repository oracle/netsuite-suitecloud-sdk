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
		const defaultKeyName = this.data[FILE_FIELDS.DEFAULT_KEY];
		return this.data[FILE_FIELDS.KEYS][defaultKeyName][KEY_FIELDS.VALUE];
	}

	/**
	 * @param {string} proxyAPIKey must be 32 bytes long.
	 * @param {string} creationDate must represent a DateTime string following the ISO standard format "YYY7-MM-DDThh:mm:ss.SSSZ".
	 * @returns {void}
	 */
	setDefaultProxyKey(proxyAPIKey, creationDate = new Date().toISOString()) {

		const defaultKeyName = this.data[FILE_FIELDS.DEFAULT_KEY];
		this.data[FILE_FIELDS.KEYS][defaultKeyName] = {
			[KEY_FIELDS.CREATION_DATE] : creationDate,
			[KEY_FIELDS.VALUE] : proxyAPIKey,
		};
	}

	/**
	 * Returns the internal structure of a ClientApiKey Object that can be passed as a Commandline argument.
	 * @returns {string} stringified JSON which starts and ends with double_quote and contains no double_quotes in between.
	 */
	toCommandlineCompatibleString() {
		return '"' + JSON.stringify(this.data).replaceAll('"', String.raw`\"`) + '"';
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
