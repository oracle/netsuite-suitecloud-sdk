/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const TranslationService = require('./TranslationService');
const messages = require('../../messages.json');

class NodeTranslationService extends TranslationService {
	constructor() {
		super();
		this._MESSAGES = messages;
	}
}

module.exports = new NodeTranslationService();
