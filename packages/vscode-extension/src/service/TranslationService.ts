/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
// const ApplicationConstants = require('../../../node-cli/src/ApplicationConstants');
const ApplicationConstants = require('@oracle/suitecloud-cli/src/ApplicationConstants');
const FileUtils = require('@oracle/suitecloud-cli/src/utils/FileUtils');
const path = require('path');
let MESSAGES: { [x: string]: any; };

export class TranslationService {
	constructor() {
		const filePath = path.join(__dirname, ApplicationConstants.DEFAULT_MESSAGES_FILE);
		MESSAGES = FileUtils.readAsJson(filePath);
	}

	private _injectParameters(message: string, params: string[]) {
		return message.replace(/{(\d+)}/g, function (match: any, number: number) {
			return typeof params[number] !== 'undefined' ? params[number] : match;
		});
	}

	getMessage(key: string | number, params?: string[]) {
		let message = MESSAGES[key];
		if (params) {
			return this._injectParameters(message, params);
		}

		return message;
	}

}