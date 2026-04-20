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

class ClientAPIKeyObjectWrapper {

	/**
	 * Creates the Wrapper Object from the stringified contents of the client_api_key.p12 file.
	 * If the file didn't contain any data, it initializes correct the structure from scratch.
	 *
	 * @param {string} jsonString a stringified JSON that follows the defined ClientAPIKeyFile schema.
	 * @returns {ClientAPIKeyObjectWrapper}
	 */
	constructor(jsonString) {

		try {
			this._json = jsonString
				? JSON.parse(jsonString)
				: _createEmptyClientAPIKeyJson();

		} catch (error) {
			throw NodeTranslationService.getMessage(CLIENT_API_KEY_UTILS.ERRORS.INVALID_FILE_CONTENTS);
		}

		if (!this._validateObjectStructure()) {
			throw NodeTranslationService.getMessage(CLIENT_API_KEY_UTILS.ERRORS.INVALID_FILE_CONTENTS);
		}
	}

	/**
	 * Returns the value of the key_id specified within the defaultKey.
	 * @returns {string} corresponding to the key value. Can be empty if the client_api_key.p12 din
	 */
	getDefaultProxyKeyValue() {
		const defaultKeyName = this._json[FILE_FIELDS.DEFAULT_KEY];
		return this._json[FILE_FIELDS.KEYS][defaultKeyName][KEY_FIELDS.VALUE];
	}

	/**
	 * @param {string} proxyAPIKey must be 32 bytes long.
	 * @param {string} creationDate must represent a DateTime string following the ISO standard format "YYYY-MM-DDThh:mm:ss.SSSZ".
	 * @returns {void}
	 */
	setDefaultProxyKey(proxyAPIKey, creationDate = new Date().toISOString()) {

		const defaultKeyName = this._json[FILE_FIELDS.DEFAULT_KEY];
		this._json[FILE_FIELDS.KEYS][defaultKeyName] = {
			[KEY_FIELDS.CREATION_DATE] : creationDate,
			[KEY_FIELDS.VALUE] : proxyAPIKey,
		};
	}

	/**
	 * Returns the raw JSON contents that should be persisted into client_api_key.p12.
	 * Transport-specific escaping (making the string Command-line compatible) belongs at the SDK execution boundary.
	 * @returns {string}
	 */
	toJsonString() {
		return JSON.stringify(this._json);
	}

	_validateObjectStructure() {
		if (!Boolean(this._json[FILE_FIELDS.DEFAULT_KEY]) || !Boolean(this._json[FILE_FIELDS.KEYS])) {
			return false;
		}
		const defaultKeyName = this._json[FILE_FIELDS.DEFAULT_KEY];
		const defaultKeyValue = this._json[FILE_FIELDS.KEYS][defaultKeyName]?.[KEY_FIELDS.VALUE];
		return Boolean(defaultKeyValue) || defaultKeyValue === "";
	}
}

function _createEmptyClientAPIKeyJson() {
	return {
		[FILE_FIELDS.SCHEMA_VERSION] : CURRENT_SCHEMA_VERSION,
		[FILE_FIELDS.DEFAULT_KEY] : DEFAULT_PROXY_KEY_NAME,
		[FILE_FIELDS.KEYS] : {
			[DEFAULT_PROXY_KEY_NAME] : {
				[KEY_FIELDS.CREATION_DATE] : "",
				[KEY_FIELDS.VALUE] : "",
			}
		}
	};
}

module.exports = {
	ClientAPIKeyObjectWrapper: ClientAPIKeyObjectWrapper
};
