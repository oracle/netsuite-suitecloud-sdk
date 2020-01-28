/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const { DEFAULT_MESSAGES_FILE } = require('../ApplicationConstants');
const MESSAGES = require(DEFAULT_MESSAGES_FILE);

class TranslationService {
	_injectParameters(message, params) {
		return message.replace(/{(\d+)}/g, function(match, number) {
			return typeof params[number] !== 'undefined' ? params[number] : match;
		});
	}

	getMessage(key, ...params) {
		let message = MESSAGES[key];
		if (params && params.length > 0) {
			return this._injectParameters(message, params);
		}

		return message;
	}
}

module.exports = new TranslationService();
