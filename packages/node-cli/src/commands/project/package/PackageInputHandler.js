/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { prompt } = require('inquirer');
const CommandUtils = require('../../../utils/CommandUtils');
const ProjectInfoService = require('../../../services/ProjectInfoService');
const { PROJECT_ACP } = require('../../../ApplicationConstants');
const BaseInputHandler = require('../../base/BaseInputHandler');
const { ACCOUNT_SPECIFIC_VALUES_OPTIONS, ACCOUNT_SPECIFIC_VALUES } = require('../../../utils/AccountSpecificValuesUtils');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const {
	COMMAND_PACKAGE: { QUESTIONS, QUESTION_CHOICES },
} = require('../../../services/TranslationKeys');

module.exports = class PackageInputHandler extends BaseInputHandler {
	constructor(options) {
		super(options);
		this._projectType = new ProjectInfoService(this._projectFolder).getProjectType();
	}

	async getParameters(params) {

		if (this._projectType === PROJECT_ACP) {
			return await prompt([
				{
					type: CommandUtils.INQUIRER_TYPES.LIST,
					name: ACCOUNT_SPECIFIC_VALUES,
					message: NodeTranslationService.getMessage(QUESTIONS.ACP_VALUES),
					default: ACCOUNT_SPECIFIC_VALUES_OPTIONS.WARNING,
					choices: [
						{
							name: NodeTranslationService.getMessage(QUESTION_CHOICES.ERROR),
							value: ACCOUNT_SPECIFIC_VALUES_OPTIONS.ERROR,
						},
						{
							name: NodeTranslationService.getMessage(QUESTION_CHOICES.WARNING),
							value: ACCOUNT_SPECIFIC_VALUES_OPTIONS.WARNING,
						},
					]
				}
			]);
		}
		else {
			return params;
		}
	}
};
