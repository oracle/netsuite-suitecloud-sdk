/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const OutputFormatter = require('./OutputFormatter');
const NodeTranslationService = require('../../services/NodeTranslationService');
const ActionResultUtils = require('../../utils/ActionResultUtils');

const { PROJECT_SUITEAPP } = require('../../ApplicationConstants');

const {
	COMMAND_DEPLOY: { MESSAGES },
} = require('../../services/TranslationKeys');

class DeployOutputFormatter extends OutputFormatter {
	constructor(consoleLogger) {
		super(consoleLogger);
	}

	formatActionResult(actionResult) {
		this._showApplyContentProtectionOptionMessage(
			actionResult.projectType,
			actionResult.appliedContentProtection,
			actionResult.projectFolder
		);

		if (actionResult.withServerValidation) {
			this.consoleLogger.info(NodeTranslationService.getMessage(MESSAGES.LOCALLY_VALIDATED, actionResult.projectFolder));
		}
		if (actionResult.resultMessage) {
			ActionResultUtils.logResultMessage(actionResult, this.consoleLogger);
		}
		if (Array.isArray(actionResult.data)) {
			actionResult.data.forEach(message => this.consoleLogger.result(message));
		}
	}

	_showApplyContentProtectionOptionMessage(projectType, isApplyContentProtection, projectFolder) {
		if (projectType === PROJECT_SUITEAPP) {
			if (isApplyContentProtection) {
				this.consoleLogger.info(NodeTranslationService.getMessage(MESSAGES.APPLYING_CONTENT_PROTECTION, projectFolder));
			} else {
				this.consoleLogger.info(NodeTranslationService.getMessage(MESSAGES.NOT_APPLYING_CONTENT_PROTECTION, projectFolder));
			}
		}
	}
}

module.exports = DeployOutputFormatter;
