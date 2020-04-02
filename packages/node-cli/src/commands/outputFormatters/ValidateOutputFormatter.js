/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const { ActionResult } = require('../actionresult/ActionResult');
const OutputFormatter = require('./OutputFormatter');
const NodeTranslationService = require('../../services/NodeTranslationService');
const ActionResultUtils = require('../../utils/ActionResultUtils');
const { COLORS } = require('../../loggers/LoggerConstants');

const { PROJECT_SUITEAPP } = require('../../ApplicationConstants');
const {
	COMMAND_VALIDATE: { MESSAGES, OUTPUT },
} = require('../../services/TranslationKeys');

class ValidateOutputFormatter extends OutputFormatter {
	constructor(consoleLogger, projectInfoService, projectFolder) {
		super(consoleLogger);
		this._projectInfoService = projectInfoService;
		this._projectFolder = projectFolder;
	}

	formatActionResult(actionResult) {
		if (actionResult.status === ActionResult.ERROR) {
			this.consoleLogger.logErrors(actionResult.errorMessages);
		} else if (actionResult.isServerValidation && Array.isArray(actionResult.data)) {
			actionResult.data.forEach(resultLine => {
				this.consoleLogger.result(resultLine);
			});
		} else if (!actionResult.isServerValidation) {
			this._showApplyContentProtectionOptionMessage(actionResult.withAppliedContentProtection);
			this._showLocalValidationResultData(actionResult.data);
		}
		ActionResultUtils.logResultMessage(actionResult, this.consoleLogger);
	}

	_showApplyContentProtectionOptionMessage(isAppliedContentProtection) {
		if (this._projectInfoService.getProjectType() === PROJECT_SUITEAPP) {
			if (isAppliedContentProtection) {
				this.consoleLogger.info(
					NodeTranslationService.getMessage(MESSAGES.APPLYING_CONTENT_PROTECTION, this._projectFolder)
				);
			} else {
				this.consoleLogger.info(
					NodeTranslationService.getMessage(MESSAGES.NOT_APPLYING_CONTENT_PROTECTION, this._projectFolder)
				);
			}
		}
	}

	_showLocalValidationResultData(data) {
		this._logValidationEntries(data.warnings, NodeTranslationService.getMessage(OUTPUT.HEADING_LABEL_WARNING), COLORS.WARNING);
		this._logValidationEntries(data.errors, NodeTranslationService.getMessage(OUTPUT.HEADING_LABEL_ERROR), COLORS.ERROR);
	}

	_logValidationEntries(entries, headingLabel, color) {
		const files = [];
		entries.forEach(entry => {
			if (!files.includes(entry.filePath)) {
				files.push(entry.filePath);
			}
		});

		if (entries.length > 0) {
			this.consoleLogger.println(`${headingLabel}:`, color);
		}

		files.forEach(file => {
			const fileString = `    ${file}`;
			this.consoleLogger.println(fileString, color);
			entries
				.filter(entry => entry.filePath === file)
				.forEach(entry => {
					this.consoleLogger.println(
						NodeTranslationService.getMessage(OUTPUT.VALIDATION_OUTPUT_MESSAGE, entry.lineNumber, entry.message),
						color
					);
				});
		});
	}
}

module.exports = ValidateOutputFormatter;
