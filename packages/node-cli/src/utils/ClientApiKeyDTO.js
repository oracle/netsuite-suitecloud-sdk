/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const NodeTranslationService = require('../services/NodeTranslationService');
const { UTILS: { CLIENT_API_KEY_UTILS }, } = require('../services/TranslationKeys');

const PROXY_KEY = 'PROXY_KEY';

class ClientApiKeyDTO {
	constructor(data = {}) {
		this.data = data;
	}

	toNormalizedString() {
		return JSON.stringify(this.data).replaceAll('"', String.raw`\"`);
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
			throw [NodeTranslationService.getMessage(CLIENT_API_KEY_UTILS.ERRORS.INVALID_FILE_CONTENTS), error];
		}

		return this;
	}

	withNewProxyKey(apiKey, creationDate = new Date().toISOString()) {
		this.data = {
			[PROXY_KEY]: {
				creationDate,
				apiKey,
			},
		};
		return this;
	}

	build() {
		return new ClientApiKeyDTO(this.data);
	}
}

module.exports = ClientApiKeyDTO;