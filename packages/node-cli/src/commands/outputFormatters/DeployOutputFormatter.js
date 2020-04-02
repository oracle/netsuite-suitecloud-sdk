/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const { ActionResult } = require('../actionresult/ActionResult');
const OutputFormatter = require('./OutputFormatter');
const NodeTranslationService = require('../../services/NodeTranslationService');
const ActionResultUtils = require('../../utils/ActionResultUtils');

const { PROJECT_SUITEAPP, SDK_TRUE } = require('../../ApplicationConstants');

class DeployOutputFormatter extends OutputFormatter {
	constructor(consoleLogger, projectFolder, projectType) {
		super(consoleLogger);
		this._projectFolder = projectFolder;
		this._projectType = projectType;
	}

	formatActionResult(actionResult) {
		if (actionResult.status === ActionResult.ERROR) {
			this.consoleLogger.logErrors(actionResult.errorMessages);
			return;
		}

		this._showApplyContentProtectionOptionMessage(actionResult.withAppliedContentProtection);
		if (actionResult.withServerValidation) {
			this.consoleLogger.info(NodeTranslationService.getMessage(MESSAGES.LOCALLY_VALIDATED, this._projectFolder));
		}
		if (actionResult.resultMessage) {
			ActionResultUtils.logResultMessage(actionResult, this.consoleLogger);
		}
		if (Array.isArray(actionResult.data)) {
			actionResult.data.forEach(message => this.consoleLogger.result(message));
		}
	}

	_showApplyContentProtectionOptionMessage(isApplyContentProtection) {
		if (this._projectType === PROJECT_SUITEAPP) {
			if (isApplyContentProtection === SDK_TRUE) {
				this.consoleLogger.info(NodeTranslationService.getMessage(MESSAGES.APPLYING_CONTENT_PROTECTION, this._projectFolder));
			} else {
				this.consoleLogger.info(
					NodeTranslationService.getMessage(MESSAGES.NOT_APPLYING_CONTENT_PROTECTION, this._projectFolder)
				);
			}
		}
	}
}

module.exports = DeployOutputFormatter;
