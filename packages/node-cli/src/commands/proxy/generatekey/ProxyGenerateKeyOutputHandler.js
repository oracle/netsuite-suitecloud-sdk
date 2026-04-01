/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const BaseOutputHandler = require('../../base/BaseOutputHandler');
const NodeTranslationService = require('../../../services/NodeTranslationService');

const {
	PROXY: { GENERATE_KEY: { SUCCESS_KEY_GENERATED } },
} = require('../../../services/TranslationKeys');

module.exports = class ProxyGenerateKeyOutputHandler extends BaseOutputHandler {
	constructor(options) {
		super(options);
	}

	parse(actionResult) {
		if (actionResult.isSuccess()) {
			this._log.result(NodeTranslationService.getMessage(SUCCESS_KEY_GENERATED, actionResult.data.apiKey));
		} else {
			this.parseError(actionResult);
		}
		return actionResult;
	}
};
