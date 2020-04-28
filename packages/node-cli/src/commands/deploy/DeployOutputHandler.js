/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const NodeTranslationService = require('../../services/NodeTranslationService');
const ActionResultUtils = require('../../utils/ActionResultUtils');
const BaseOutputHandler = require('../basecommand/BaseOutputHandler');

const { PROJECT_SUITEAPP, SDK_TRUE } = require('../../ApplicationConstants');

const {
	COMMAND_DEPLOY: { MESSAGES },
} = require('../../services/TranslationKeys');

module.exports = class DeployOutputHandler extends BaseOutputHandler {
	constructor(options) {
		super(options);
	}

	formatActionResult(actionResult) {
		this._showApplyContentProtectionOptionMessage(
			actionResult.projectType,
			actionResult.withAppliedContentProtection,
			actionResult.projectFolder
		);

		if (actionResult.withServerValidation) {
			this._log.info(NodeTranslationService.getMessage(MESSAGES.LOCALLY_VALIDATED, actionResult.projectFolder));
		}
		if (actionResult.resultMessage) {
			ActionResultUtils.logResultMessage(actionResult, this._log);
		}
		if (Array.isArray(actionResult.data)) {
			actionResult.data.forEach(message => this._log.result(message));
		}
	}

	_showApplyContentProtectionOptionMessage(projectType, isApplyContentProtection, projectFolder) {
		if (projectType === PROJECT_SUITEAPP) {
			if (isApplyContentProtection === SDK_TRUE) {
				this._log.info(NodeTranslationService.getMessage(MESSAGES.APPLYING_CONTENT_PROTECTION, projectFolder));
			} else {
				this._log.info(NodeTranslationService.getMessage(MESSAGES.NOT_APPLYING_CONTENT_PROTECTION, projectFolder));
			}
		}
	}
}
