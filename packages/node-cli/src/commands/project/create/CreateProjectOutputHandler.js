/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const BaseOutputHandler = require('../../base/BaseOutputHandler');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const ActionResultUtils = require('../../../utils/ActionResultUtils');
const {
	COMMAND_CREATEPROJECT: { MESSAGES },
} = require('../../../services/TranslationKeys');

module.exports = class CreateProjectOutputHandler extends BaseOutputHandler {
	constructor(options) {
		super(options);
	}

	parse(actionResult) {
		ActionResultUtils.logResultMessage(actionResult, this._log);

		const projectCreatedMessage = NodeTranslationService.getMessage(MESSAGES.PROJECT_CREATED, actionResult.projectName);
		this._log.result(projectCreatedMessage);

		if (actionResult.includeUnitTesting) {
			const sampleUnitTestMessage = NodeTranslationService.getMessage(MESSAGES.SAMPLE_UNIT_TEST_ADDED);
			this._log.result(sampleUnitTestMessage);
			if (!actionResult.npmPackageInitialized) {
				this._log.error(NodeTranslationService.getMessage(MESSAGES.INIT_NPM_DEPENDENCIES_FAILED));
			}
		}

		const navigateToProjectMessage = NodeTranslationService.getMessage(MESSAGES.NAVIGATE_TO_FOLDER, actionResult.projectDirectory);
		this._log.result(navigateToProjectMessage);
		return actionResult;
	}
};
