/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
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
const {
	isRawOutputRequested,
	logCommandOutput,
	logCommandErrors,
	logRawOutput,
} = require('../ProjectCommandOutputFormatter');

module.exports = class ValidateOutputHandler extends BaseOutputHandler {
	constructor(options) {
		super(options);
	}

	parse(actionResult) {
		if (isRawOutputRequested(actionResult)) {
			logRawOutput(this._log, actionResult.data, false);
			return actionResult;
		}

		if (actionResult.isServerValidation && Array.isArray(actionResult.data)) {
			logCommandOutput(this._log, actionResult.data);
		} else if (!actionResult.isServerValidation) {
			this._showApplyInstallationPreferencesOptionMessage(
				actionResult.appliedInstallationPreferences,
				actionResult.projectType,
				actionResult.projectFolder
			);
			this._showLocalValidationResultData(actionResult.data);
		}
		ActionResultUtils.logResultMessage(actionResult, this._log);
		return actionResult;
	}

	parseError(actionResult) {
		if (isRawOutputRequested(actionResult)) {
			const rawErrorPayload = Array.isArray(actionResult.errorMessages) && actionResult.errorMessages.length === 1
				? actionResult.errorMessages[0]
				: actionResult.errorMessages;
			logRawOutput(this._log, rawErrorPayload, true);
			return actionResult;
		}

		logCommandErrors(this._log, actionResult.errorMessages);
		return actionResult;
	}

	_showApplyInstallationPreferencesOptionMessage(isAppliedInstallationPreferences, projectType, projectFolder) {
		if (projectType === PROJECT_SUITEAPP) {
			if (isAppliedInstallationPreferences) {
				this._log.info(NodeTranslationService.getMessage(MESSAGES.APPLYING_INSTALLATION_PREFERENCES, projectFolder));
			} else {
				this._log.info(NodeTranslationService.getMessage(MESSAGES.NOT_APPLYING_INSTALLATION_PREFERENCES, projectFolder));
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
