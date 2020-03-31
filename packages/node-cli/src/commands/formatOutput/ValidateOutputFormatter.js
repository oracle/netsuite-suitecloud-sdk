/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const { ActionResult } = require('../actionresult/ActionResult');
const OutputFormatter = require('./OutputFormatter');
const TranslationService = require('../../services/TranslationService');
const ActionResultUtils = require('../../utils/ActionResultUtils');

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

	formatOutput(actionResult) {
		if (actionResult.status === ActionResult.ERROR) {
			this.consoleLogger.logErrors(actionResult.errorMessages);
		} else if (actionResult.isServerValidation && Array.isArray(actionResult.data)) {
			actionResult.data.forEach(resultLine => {
				this.consoleLogger.println(resultLine, this.consoleLogger.COLORS.RESULT);
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

	_showLocalValidationResultData(data) {
		this._logValidationEntries(data.warnings, TranslationService.getMessage(OUTPUT.HEADING_LABEL_WARNING), this.consoleLogger.COLORS.WARNING);
		this._logValidationEntries(data.errors, TranslationService.getMessage(OUTPUT.HEADING_LABEL_ERROR), this.consoleLogger.COLORS.ERROR);
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
						TranslationService.getMessage(OUTPUT.VALIDATION_OUTPUT_MESSAGE, entry.lineNumber, entry.message),
						color
					);
				});
		});
	}
}

module.exports = ValidateOutputFormatter;
