/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const { ActionResult } = require('../actionresult/ActionResult');
const OutputFormatter = require('./OutputFormatter');
const TranslationService = require('../../services/TranslationService');

const ActionResultUtils = require('../../utils/ActionResultUtils');
const {
	COMMAND_CREATEPROJECT: { MESSAGES },
} = require('../../services/TranslationKeys');

class CreateProjectOutputFormatter extends OutputFormatter {
	constructor(consoleLogger) {
		super(consoleLogger);
	}

	formatOutput(actionResult) {
		if (!actionResult) {
			return;
		}
		if (actionResult.status === ActionResult.ERROR) {
			this.consoleLogger.logErrors(actionResult.errorMessages);
			return;
		}
		ActionResultUtils.logResultMessage(actionResult, this.consoleLogger);

		const projectCreatedMessage = TranslationService.getMessage(MESSAGES.PROJECT_CREATED, actionResult.projectName);
		this.consoleLogger.println(projectCreatedMessage, this.consoleLogger.COLORS.RESULT);

		if (actionResult.includeUnitTesting) {
			const sampleUnitTestMessage = TranslationService.getMessage(MESSAGES.SAMPLE_UNIT_TEST_ADDED);
			this.consoleLogger.println(sampleUnitTestMessage, this.consoleLogger.COLORS.RESULT);
			if (!actionResult.npmPackageIntitialized) {
				this.consoleLogger.println(TranslationService.getMessage(MESSAGES.INIT_NPM_DEPENDENCIES_FAILED), this.consoleLogger.COLORS.ERROR);
			}
		}

		const navigateToProjectMessage = TranslationService.getMessage(MESSAGES.NAVIGATE_TO_FOLDER, actionResult.projectDirectory);
		this.consoleLogger.println(navigateToProjectMessage, this.consoleLogger.COLORS.RESULT);
	}
}

module.exports = CreateProjectOutputFormatter;
