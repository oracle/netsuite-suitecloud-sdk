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
	PROJECT_COMMAND: { MESSAGES },
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
		this._executionPath = options.executionPath;
	}

	parse(actionResult) {
		if (isRawOutputRequested(actionResult)) {
			logRawOutput(this._log, actionResult.data, false);
			return actionResult;
		}

		this._showInstallationPreferencesMessage(actionResult);
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

		this._showInstallationPreferencesMessage(actionResult);
		logCommandErrors(this._log, actionResult.errorMessages);
		return actionResult;
	}

	_showInstallationPreferencesMessage(actionResult) {
		if (actionResult.projectType !== PROJECT_SUITEAPP) {
			return;
		}
		const messageKey = actionResult.appliedInstallationPreferences
			? MESSAGES.INSTALLATION_PREFERENCES_SELECTED
			: MESSAGES.INSTALLATION_PREFERENCES_NOT_SELECTED;
		this._log.info(NodeTranslationService.getMessage(messageKey, this._executionPath || actionResult.projectFolder));
	}
};
