/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const BaseOutputHandler = require('../../base/BaseOutputHandler');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const ActionResultUtils = require('../../../utils/ActionResultUtils');

const { PROJECT_SUITEAPP } = require('../../../ApplicationConstants');
const {
	COMMAND_VALIDATE: { MESSAGES, OUTPUT },
} = require('../../../services/TranslationKeys');

module.exports = class ValidateOutputHandler extends BaseOutputHandler {
	constructor(options) {
		super(options);
	}

	parse(actionResult) {
		if (actionResult.isServerValidation && Array.isArray(actionResult.data)) {
			actionResult.data.forEach((resultLine) => {
				this._log.result(resultLine);
			});
		} else if (!actionResult.isServerValidation) {
			this._showApplyContentProtectionOptionMessage(
				actionResult.appliedContentProtection,
				actionResult.projectType,
				actionResult.projectFolder
			);
			this._showLocalValidationResultData(actionResult.data);
		}
		ActionResultUtils.logResultMessage(actionResult, this._log);
		return actionResult;
	}

	_showApplyContentProtectionOptionMessage(isAppliedContentProtection, projectType, projectFolder) {
		if (projectType === PROJECT_SUITEAPP) {
			if (isAppliedContentProtection) {
				this._log.info(NodeTranslationService.getMessage(MESSAGES.APPLYING_CONTENT_PROTECTION, projectFolder));
			} else {
				this._log.info(NodeTranslationService.getMessage(MESSAGES.NOT_APPLYING_CONTENT_PROTECTION, projectFolder));
			}
		}
	}

	_showLocalValidationResultData(data) {
		this._logValidationEntries(data.warnings, NodeTranslationService.getMessage(OUTPUT.HEADING_LABEL_WARNING), this._log.warning.bind(this._log));
		this._logValidationEntries(data.errors, NodeTranslationService.getMessage(OUTPUT.HEADING_LABEL_ERROR), this._log.error.bind(this._log));
	}

	_logValidationEntries(entries, headingLabel, log) {
		const files = [];
		entries.forEach((entry) => {
			if (!files.includes(entry.filePath)) {
				files.push(entry.filePath);
			}
		});

		if (entries.length > 0) {
			log(`${headingLabel}:`);
		}

		files.forEach((file) => {
			const fileString = `    ${file}`;
			log(fileString);
			entries
				.filter((entry) => entry.filePath === file)
				.forEach((entry) => {
					log(NodeTranslationService.getMessage(OUTPUT.VALIDATION_OUTPUT_MESSAGE, entry.lineNumber, entry.message));
				});
		});
	}
};
