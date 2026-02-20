/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const path = require('path');
const TranslationService = require('./TranslationService');
const { DEFAULT_MESSAGES_FILE } = require('../ApplicationConstants');
const FileUtils = require('../utils/FileUtils');

class NodeTranslationService extends TranslationService {
	constructor() {
		super();
		const filePath = path.join(__dirname, DEFAULT_MESSAGES_FILE);
		// TODO refactor: use node require instead of FileUtils.readAsJson the initialize this._MESSAGES.
		// Once the refactor is done FileUtils will be able to use NodeTranslationService again without a circular dependency.
		this._MESSAGES = FileUtils.readAsJson(filePath);
	}
}

module.exports = new NodeTranslationService();
