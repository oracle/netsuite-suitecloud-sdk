/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const path = require('path');
const HOME_PATH = require('os').homedir();
const NodeTranslationService = require('../services/NodeTranslationService');
const { FILES, FOLDERS } = require('../ApplicationConstants');
const { UTILS: { CLIENT_API_KEY_UTILS } } = require('../services/TranslationKeys');

const CLIENT_API_KEY_FILEPATH = path.join(HOME_PATH, FOLDERS.SUITECLOUD_SDK, FILES.CLIENT_API_KEY);

const FILE_FIELDS = {
	SCHEMA_VERSION: 'schemaVersion',
	DEFAULT_KEY: 'defaultKey',
	KEYS: 'keys',
};

const KEY_FIELDS = {
	CREATION_DATE: 'creationDate',
	VALUE: 'value',
};

const EMPTY_CLIENT_API_KEY_JSON = `
 	{
		"schemaVersion": 1,
		"defaultKey": "proxyKey",
		"keys": {
			"proxyKey": {
				"creationDate": "",
				"value": ""
			}
		}
	}
`

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
			this._objectData = jsonString
				? JSON.parse(jsonString)
				: JSON.parse(EMPTY_CLIENT_API_KEY_JSON);

			this._validateObjectStructure();

		} catch (error) {
			throw NodeTranslationService.getMessage(CLIENT_API_KEY_UTILS.ERRORS.INVALID_FILE_CONTENTS, CLIENT_API_KEY_FILEPATH);
		}
	}

	_validateObjectStructure() {
		if (!this._objectData.hasOwnProperty(FILE_FIELDS.DEFAULT_KEY)) {
			throw "ClientAPIKey object must contain a 'defaultKey' field.";
		}

		if (!this._objectData.hasOwnProperty(FILE_FIELDS.KEYS)) {
			throw "ClientAPIKey object must contain a 'keys' object.";
		}

		const defaultKeyValue = this._objectData[FILE_FIELDS.DEFAULT_KEY];
		if (!this._objectData[FILE_FIELDS.KEYS].hasOwnProperty(defaultKeyValue)) {
			throw "ClientAPIKey object must contain an inner 'keys.defaultKeyValue' object.";
		}

		if (!this._objectData[FILE_FIELDS.KEYS][defaultKeyValue].hasOwnProperty(KEY_FIELDS.VALUE)) {
			throw "The inner 'keys.defaultKeyValue' object must contain a 'value' field.";
		}
	}

	/**
	 * Returns the proxy_key value specified within the defaultKey.
	 * @returns {string} Can be empty if the client_api_key.p12 was newly generated.
	 */
	getDefaultKeyValue() {
		const defaultKeyName = this._objectData[FILE_FIELDS.DEFAULT_KEY];
		return this._objectData[FILE_FIELDS.KEYS][defaultKeyName][KEY_FIELDS.VALUE];
	}

	/**
	 * @param {string} proxyAPIKey must be 32 bytes long.
	 * @param {string} creationDate must represent a DateTime string following the ISO standard format "YYYY-MM-DDThh:mm:ss.SSSZ".
	 * @returns {void}
	 */
	setDefaultKeyValue(proxyAPIKey, creationDate = new Date().toISOString()) {

		const defaultKeyName = this._objectData[FILE_FIELDS.DEFAULT_KEY];
		this._objectData[FILE_FIELDS.KEYS][defaultKeyName] = {
			[KEY_FIELDS.CREATION_DATE] : creationDate,
			[KEY_FIELDS.VALUE] : proxyAPIKey,
		};
	}

	/**
	 * Returns the raw JSON contents that should be persisted into client_api_key.p12.
	 * Transport-specific escaping (making the string Command-line compatible) belongs at ClientAPIKeyUtils.js.
	 * @returns {string}
	 */
	toJsonString() {
		return JSON.stringify(this._objectData);
	}
}

module.exports = {
	ClientAPIKeyObjectWrapper
};
