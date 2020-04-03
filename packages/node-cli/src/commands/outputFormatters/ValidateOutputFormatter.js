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
	COMMAND_VALIDATE: { MESSAGES, OUTPUT },
} = require('../../services/TranslationKeys');

class ValidateOutputFormatter extends OutputFormatter {
	constructor(consoleLogger, projectInfoService, projectFolder) {
		super(consoleLogger);
		this._projectInfoService = projectInfoService;
		this._projectFolder = projectFolder;
	}

	formatActionResult(actionResult) {
		if (actionResult.isServerValidation && Array.isArray(actionResult.data)) {
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
				this.consoleLogger.info(NodeTranslationService.getMessage(MESSAGES.APPLYING_CONTENT_PROTECTION, this._projectFolder));
			} else {
				this.consoleLogger.info(NodeTranslationService.getMessage(MESSAGES.NOT_APPLYING_CONTENT_PROTECTION, this._projectFolder));
			}
		}
	}

	_showLocalValidationResultData(data) {
		this._logValidationEntries(data.warnings, NodeTranslationService.getMessage(OUTPUT.HEADING_LABEL_WARNING), this.consoleLogger.warning);
		this._logValidationEntries(data.errors, NodeTranslationService.getMessage(OUTPUT.HEADING_LABEL_ERROR), this.consoleLogger.error);
	}

	_logValidationEntries(entries, headingLabel, log) {
		const files = [];
		entries.forEach(entry => {
			if (!files.includes(entry.filePath)) {
				files.push(entry.filePath);
			}
		});

		if (entries.length > 0) {
			log(`${headingLabel}:`);
		}

		files.forEach(file => {
			const fileString = `    ${file}`;
			log(fileString);
			entries
				.filter(entry => entry.filePath === file)
				.forEach(entry => {
					log(NodeTranslationService.getMessage(OUTPUT.VALIDATION_OUTPUT_MESSAGE, entry.lineNumber, entry.message));
				});
		});
	}
}

module.exports = ValidateOutputFormatter;
