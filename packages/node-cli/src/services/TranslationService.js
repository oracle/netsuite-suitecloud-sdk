/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

class TranslationService {
	_injectParameters(message, params) {
		return message.replace(/{(\d+)}/g, function(match, number) {
			return typeof params[number] !== 'undefined' ? params[number] : match;
		});
	}

	/**
	 *
	 * @param key
	 * @param params
	 * @returns string
	 */
	getMessage(key, ...params) {
		let message = this._MESSAGES[key];
		if (params && params.length > 0) {
			return this._injectParameters(message, params);
		}

		return message;
	}
}

module.exports = TranslationService;
