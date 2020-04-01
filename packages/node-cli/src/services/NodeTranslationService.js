/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const TranslationService = require('./TranslationService');
const { DEFAULT_MESSAGES_FILE } = require('../ApplicationConstants');

class NodeTranslationService extends TranslationService {
	constructor() {
		super(DEFAULT_MESSAGES_FILE);
	}
}

module.exports = new NodeTranslationService();
