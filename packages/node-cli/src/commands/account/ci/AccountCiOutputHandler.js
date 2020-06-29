/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const BaseOutputHandler = require('../../base/BaseOutputHandler');
const NodeTranslationService = require('../../../services/NodeTranslationService');

const { COMMAND_ACCOUNTCI } = require('../../../services/TranslationKeys');

module.exports = class SetupOutputHandler extends BaseOutputHandler {
	constructor(options) {
		super(options);
	}

	parse(actionResult) {
		const resultMessage = NodeTranslationService.getMessage(
            COMMAND_ACCOUNTCI.OUTPUT.NEW_SAVED_TOKEN,
            actionResult.accountInfo.companyName,
            actionResult.accountInfo.roleName,
            actionResult.authId
        );

		this._log.result(resultMessage);
		this._log.result(NodeTranslationService.getMessage(COMMAND_ACCOUNTCI.OUTPUT.SUCCESS));
		return actionResult;
	}
};
