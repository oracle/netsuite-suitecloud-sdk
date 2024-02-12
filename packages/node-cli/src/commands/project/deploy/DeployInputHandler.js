/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { prompt } = require('inquirer');
const CommandUtils = require('../../../utils/CommandUtils');
const ProjectInfoService = require('../../../services/ProjectInfoService');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const BaseInputHandler = require('../../base/BaseInputHandler');
const { ACCOUNT_SPECIFIC_VALUES_OPTIONS } = require('../../../utils/AccountSpecificValuesUtils');
const { LINKS, PROJECT_ACP, PROJECT_SUITEAPP } = require('../../../ApplicationConstants');

const {
	COMMAND_DEPLOY: { QUESTIONS, QUESTIONS_CHOICES, MESSAGES },
	NO,
	YES,
} = require('../../../services/TranslationKeys');

const COMMAND = {
	OPTIONS: {
		ACCOUNT_SPECIFIC_VALUES: 'accountspecificvalues',
		LOG: 'log',
		PROJECT: 'project',
	},
	FLAGS: {
		NO_PREVIEW: 'no_preview',
		SKIP_WARNING: 'skip_warning',
		VALIDATE: 'validate',
		APPLY_INSTALLATION_PREFERENCES: 'applyinstallprefs',
	},
};

module.exports = class DeployInputHandler extends BaseInputHandler {
	constructor(options) {
		super(options);

		this._projectInfoService = new ProjectInfoService(this._projectFolder);
		this._projectType = this._projectInfoService.getProjectType();
	}

	async getParameters(params) {
		const isSuiteAppProject = this._projectType === PROJECT_SUITEAPP;
		const isACProject = this._projectType === PROJECT_ACP;

		const answers = await prompt([
			{
				when: isSuiteAppProject && this._projectInfoService.hasLockAndHideFiles(),
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND.FLAGS.APPLY_INSTALLATION_PREFERENCES,
				message: NodeTranslationService.getMessage(QUESTIONS.APPLY_INSTALLATION_PREFERENCES),
				default: 1,
				choices: [
					{ name: NodeTranslationService.getMessage(YES), value: true },
					{ name: NodeTranslationService.getMessage(NO), value: false },
				],
			},
			{
				when: isACProject,
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND.OPTIONS.ACCOUNT_SPECIFIC_VALUES,
				message: NodeTranslationService.getMessage(QUESTIONS.ACCOUNT_SPECIFIC_VALUES),
				default: 1,
				choices: [
					{
						name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.ACCOUNT_SPECIFIC_VALUES.DISPLAY_WARNING),
						value: ACCOUNT_SPECIFIC_VALUES_OPTIONS.WARNING,
					},
					{
						name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.ACCOUNT_SPECIFIC_VALUES.CANCEL_PROCESS),
						value: ACCOUNT_SPECIFIC_VALUES_OPTIONS.ERROR,
					},
				],
			},
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND.FLAGS.VALIDATE,
				message: NodeTranslationService.getMessage(QUESTIONS.PERFORM_LOCAL_VALIDATION),
				default: 0,
				choices: [
					{ name: NodeTranslationService.getMessage(YES), value: true },
					{ name: NodeTranslationService.getMessage(NO), value: false },
				],
			},
		]);

		if (isSuiteAppProject && !answers.hasOwnProperty(COMMAND.FLAGS.APPLY_INSTALLATION_PREFERENCES)) {
			this._log.info(
				NodeTranslationService.getMessage(
					MESSAGES.NOT_ASKING_INSTALLATION_PREFERENCES_REASON,
					LINKS.HOW_TO.CREATE_INSTALLATION_PREFERENCES,
				)
			);
		}
		answers[COMMAND.OPTIONS.PROJECT] = this._projectFolder;

		return answers;
	}
};
