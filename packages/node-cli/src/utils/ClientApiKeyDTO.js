/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const NodeTranslationService = require('../services/NodeTranslationService');
const { UTILS: { CLIENT_API_KEY_UTILS }, } = require('../services/TranslationKeys');

const PROXY_KEY_ID = 'PROXY_KEY';
const PROXY_KEY_CREATION_DATE_ID = 'creationDate'
const PROXY_KEY_API_KEY_ID = 'proxyAPIKey';

/**
 *
 * DTO class that represents the contents of 'client_api_key.p12'
 * 	The expected 'client_api_key.p12' file content/format goes as follows:
 *		{
 *		 	"PROXY_KEY": {
 *		 	    "creationDate": "2026-04-13T12:46:52.577Z",
 *		 	    "proxyApiKey": "3d3dfe3ec58eb9b9826f4546de20f96f99f6b7ed1fcdcaaa5f3c252eb69dce56"
 *		 	}
 *		}
 *
 *
 */

class ClientApiKeyDTO {
	constructor(data = {}) {
		this.data = data;
	}

	getProxyAPIKey() {
		return this.data[PROXY_KEY_ID][PROXY_KEY_API_KEY_ID];
	}

	toCommandlineCompatibleString() {
		return '"' + JSON.stringify(this.data).replaceAll('"', String.raw`\"`) + '"';
	}

	static get Builder() {
		return new ClientApiKeyDTOBuilder();
	}
};


class ClientApiKeyDTOBuilder {
	constructor() {
	}

	fromRawString(stringifiedData) {
		try {
			this.data = !stringifiedData
				? {}
				: JSON.parse(stringifiedData);
		} catch (error) {
			throw NodeTranslationService.getMessage(CLIENT_API_KEY_UTILS.ERRORS.INVALID_FILE_CONTENTS);
			// TODO: we do not want to show the content of the file
			// Therefore, we dont want to show the contents of the caughtError (due to the risk of it sharing unwanted info)
		}

		return this;
	}

	withNewProxyKey(proxyAPIKey, creationDate = new Date().toISOString()) {
		this.data[PROXY_KEY_ID] = {
			[PROXY_KEY_CREATION_DATE_ID] : creationDate,
			[PROXY_KEY_API_KEY_ID] : proxyAPIKey,
		};
		return this;
	}

	build() {
		return new ClientApiKeyDTO(this.data);
	}
}

module.exports = ClientApiKeyDTO;