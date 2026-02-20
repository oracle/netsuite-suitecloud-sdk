/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const BaseOutputHandler = require('../../base/BaseOutputHandler');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const {
	COMMAND_SETUPACCOUNTCI: { OUTPUT: { SELECT_DEFAULT_ACCOUNT, NEW_OAUTH } },
	UTILS,
} = require('../../../services/TranslationKeys');

const { COMMANDS: { AUTHENTICATE: { MODES: { REUSE } } } } = require('../../../utils/AuthenticationUtils');

module.exports = class AccountSetupCiOutputHandler extends BaseOutputHandler {
	constructor(options) {
		super(options);
	}

	parse(actionResult) {

		if (actionResult.mode === REUSE) {
			//SELECT mode
			this._log.result(NodeTranslationService.getMessage(
				SELECT_DEFAULT_ACCOUNT,
				actionResult.authId,
			));
		} else {
			//SETUP mode
			this._log.result(NodeTranslationService.getMessage(
				NEW_OAUTH,
				actionResult.accountInfo.companyName,
				actionResult.accountInfo.roleName,
				actionResult.authId,
			));
			this._log.result(NodeTranslationService.getMessage(UTILS.AUTHENTICATION.SUCCESS_SETUP));
		}
		return actionResult;
	}
};
