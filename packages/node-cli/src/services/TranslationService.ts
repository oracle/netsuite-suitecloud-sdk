/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

export default abstract class TranslationService {

	abstract _MESSAGES: any;

	private injectParameters(message: string, params: any) {
		return message.replace(/{(\d+)}/g, function(match, number) {
			return typeof params[number] !== 'undefined' ? params[number] : match;
		});
	}

	getMessage(key: string, ...params: any) {
		let message = this._MESSAGES[key];
		if (params && params.length > 0) {
			return this.injectParameters(message, params);
		}

		return message;
	}
}

