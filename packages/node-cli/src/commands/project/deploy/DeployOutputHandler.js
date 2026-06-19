/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const NodeTranslationService = require('../../../services/NodeTranslationService');
const ActionResultUtils = require('../../../utils/ActionResultUtils');
const BaseOutputHandler = require('../../base/BaseOutputHandler');

const { PROJECT_SUITEAPP } = require('../../../ApplicationConstants');

const {
	COMMAND_DEPLOY: { MESSAGES },
} = require('../../../services/TranslationKeys');
const {
	isRawOutputRequested,
	logCommandOutput,
	logCommandErrors,
	logRawOutput,
} = require('../ProjectCommandOutputFormatter');

module.exports = class DeployOutputHandler extends BaseOutputHandler {
	constructor(options) {
		super(options);
	}

	parse(actionResult) {
		if (isRawOutputRequested(actionResult)) {
			logRawOutput(this._log, actionResult.data, false);
			return actionResult;
		}

		this._showApplyInstallationPreferencesOptionMessage(
			actionResult.projectType,
			actionResult.appliedInstallationPreferences,
			actionResult.projectFolder
		);

		if (actionResult.withServerValidation) {
			this._log.info(NodeTranslationService.getMessage(MESSAGES.LOCALLY_VALIDATED, actionResult.projectFolder));
		}
		if (actionResult.resultMessage) {
			ActionResultUtils.logResultMessage(actionResult, this._log);
		}
		logCommandOutput(this._log, actionResult.data);
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

	_showApplyInstallationPreferencesOptionMessage(projectType, isApplyInstallationPreferences, projectFolder) {
		if (projectType === PROJECT_SUITEAPP) {
			if (isApplyInstallationPreferences) {
				this._log.info(NodeTranslationService.getMessage(MESSAGES.APPLYING_CONTENT_PROTECTION, projectFolder));
			} else {
				this._log.info(NodeTranslationService.getMessage(MESSAGES.NOT_APPLYING_CONTENT_PROTECTION, projectFolder));
			}
		}
	}
};
