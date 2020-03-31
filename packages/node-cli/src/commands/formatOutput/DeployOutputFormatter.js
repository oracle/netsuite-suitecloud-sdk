/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const { ActionResult } = require('../actionresult/ActionResult');
const OutputFormatter = require('./OutputFormatter');
const TranslationService = require('../../services/TranslationService');
const ActionResultUtils = require('../../utils/ActionResultUtils');

const { PROJECT_SUITEAPP, SDK_TRUE } = require('../../ApplicationConstants');

class DeployOutputFormatter extends OutputFormatter {
	constructor(consoleLogger, projectFolder, projectType) {
		super(consoleLogger);
		this._projectFolder = projectFolder;
		this._projectType = projectType;
	}

	formatOutput(actionResult) {
		if (actionResult.status === ActionResult.ERROR) {
			this.consoleLogger.logErrors(actionResult.errorMessages);
			return;
		}

		this._showApplyContentProtectionOptionMessage(actionResult.withAppliedContentProtection);
		if (actionResult.withServerValidation) {
			this.consoleLogger.println(
				TranslationService.getMessage(MESSAGES.LOCALLY_VALIDATED, this._projectFolder),
				this.consoleLogger.COLORS.INFO
			);
		}
		if (actionResult.resultMessage) {
			ActionResultUtils.logResultMessage(actionResult, this.consoleLogger);
		}
		if (Array.isArray(actionResult.data)) {
			actionResult.data.forEach(message => this.consoleLogger.println(message, this.consoleLogger.COLORS.RESULT));
		}
	}

	_showApplyContentProtectionOptionMessage(isApplyContentProtection) {
		if (this._projectType === PROJECT_SUITEAPP) {
			if (isApplyContentProtection === SDK_TRUE) {
				this.consoleLogger.println(
					TranslationService.getMessage(MESSAGES.APPLYING_CONTENT_PROTECTION, this._projectFolder),
					this.consoleLogger.COLORS.INFO
				);
			} else {
				this.consoleLogger.println(
					TranslationService.getMessage(MESSAGES.NOT_APPLYING_CONTENT_PROTECTION, this._projectFolder),
					this.consoleLogger.COLORS.INFO
				);
			}
		}
	}
}

module.exports = DeployOutputFormatter;
