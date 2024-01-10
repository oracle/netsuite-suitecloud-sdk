/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const ApplicationConstants = require('../ApplicationConstants');
const FileUtils = require('../utils/FileUtils');
const path = require('path');
let MESSAGES;

class UnitTestTranslationService {
	constructor() {
		const filePath = path.join(__dirname, ApplicationConstants.DEFAULT_MESSAGES_FILE);
		MESSAGES = FileUtils.readAsJson(filePath);
	}

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

module.exports = new UnitTestTranslationService();
