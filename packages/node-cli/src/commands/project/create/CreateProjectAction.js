/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const CreateProjectActionResult = require('../../../services/actionresult/CreateProjectActionResult');
const BaseAction = require('../../base/BaseAction');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const ApplicationConstants = require('../../../ApplicationConstants');
const { throwValidationException, unwrapExceptionMessage } = require('../../../utils/ExceptionUtils');
const {
	ensureCreateProjectLocation,
	buildCreateProjectSdkParams,
	toIncludeUnitTestingBoolean,
	executeCreateProjectWorkflowCommand,
} = require('@oracle/suitecloud-sdk-core/commands/project/create/CreateProjectHandler');
const {
	COMMAND_CREATEPROJECT: { MESSAGES },
} = require('../../../services/TranslationKeys');

const {
	validateFieldIsNotEmpty,
	showValidationResults,
	validateFieldHasNoSpaces,
	validateFieldIsLowerCase,
	validatePublisherId,
	validateProjectVersion,
	validateXMLCharacters,
	validateNotUndefined,
	validateProjectType,
} = require('../../../validation/InteractiveAnswersValidator');

const SOURCE_FOLDER = 'src';

const COMMAND_OPTIONS = {
	OVERWRITE: 'overwrite',
	PARENT_DIRECTORY: 'parentdirectory',
	PROJECT_ID: 'projectid',
	PROJECT_NAME: 'projectname',
	PROJECT_VERSION: 'projectversion',
	PUBLISHER_ID: 'publisherid',
	TYPE: 'type',
	INCLUDE_UNIT_TESTING: 'includeunittesting',
	PROJECT_FOLDER_NAME: 'projectfoldername',
};

module.exports = class CreateProjectAction extends BaseAction {
	constructor(options) {
		super(options);
	}

	preExecute(params) {
		return ensureCreateProjectLocation(
			params,
			this._executionPath,
			ApplicationConstants.PROJECT_SUITEAPP,
			ApplicationConstants.PROJECT_ACP
		);
	}

	async execute(params) {
		try {
			const validationErrors = this._validateParams(params);
			if (validationErrors.length > 0) {
				throwValidationException(validationErrors, false, this._commandMetadata);
			}

			const projectAbsolutePath = params[COMMAND_OPTIONS.PARENT_DIRECTORY];
			const projectFolderName = params[COMMAND_OPTIONS.PROJECT_FOLDER_NAME];
			const projectType = params[COMMAND_OPTIONS.TYPE];
			const projectName = params[COMMAND_OPTIONS.PROJECT_NAME];
			const includeUnitTesting = toIncludeUnitTestingBoolean(params[COMMAND_OPTIONS.INCLUDE_UNIT_TESTING]);

			const createProjectParams = buildCreateProjectSdkParams(
				params,
				SOURCE_FOLDER,
				ApplicationConstants.PROJECT_SUITEAPP
			);
			const commandParameters = { ...createProjectParams, [COMMAND_OPTIONS.PROJECT_NAME]: projectName };

			await this._log.info(NodeTranslationService.getMessage(MESSAGES.CREATING_PROJECT_STRUCTURE));
			if (includeUnitTesting) {
				await this._log.info(NodeTranslationService.getMessage(MESSAGES.SETUP_TEST_ENV));
				await this._log.info(NodeTranslationService.getMessage(MESSAGES.INIT_NPM_DEPENDENCIES));
			}

			const operationResult = await executeCreateProjectWorkflowCommand({
				createProjectParams,
				projectAbsolutePath,
				projectFolderName,
				projectType,
				projectName,
				projectVersion: params[COMMAND_OPTIONS.PROJECT_VERSION],
				includeUnitTesting,
				projectTypeSuiteApp: ApplicationConstants.PROJECT_SUITEAPP,
			});

			if (operationResult.status === 'SUCCESS') {
				return CreateProjectActionResult.Builder.withData(operationResult.data)
					.withResultMessage(operationResult.resultMessage)
					.withProjectType(projectType)
					.withProjectName(projectName)
					.withProjectDirectory(operationResult.projectDirectory || projectAbsolutePath)
					.withUnitTesting(includeUnitTesting)
					.withNpmPackageInitialized(operationResult.npmInstallSuccess)
					.withCommandParameters(commandParameters)
					.build();
			}

			return CreateProjectActionResult.Builder.withErrors(operationResult.errorMessages)
				.withCommandParameters(commandParameters)
				.build();
		} catch (error) {
			return CreateProjectActionResult.Builder.withErrors([unwrapExceptionMessage(error)]).build();
		}
	}

	_validateParams(answers) {
		const validationErrors = [];
		validationErrors.push(showValidationResults(answers[COMMAND_OPTIONS.PROJECT_NAME], validateFieldIsNotEmpty, validateXMLCharacters));
		validationErrors.push(showValidationResults(answers[COMMAND_OPTIONS.TYPE], validateProjectType));
		if (answers[COMMAND_OPTIONS.TYPE] === ApplicationConstants.PROJECT_SUITEAPP) {
			validationErrors.push(
				showValidationResults(
					answers[COMMAND_OPTIONS.PUBLISHER_ID],
					(optionValue) => validateNotUndefined(optionValue, COMMAND_OPTIONS.PUBLISHER_ID),
					validatePublisherId
				)
			);

			validationErrors.push(
				showValidationResults(
					answers[COMMAND_OPTIONS.PROJECT_VERSION],
					(optionValue) => validateNotUndefined(optionValue, COMMAND_OPTIONS.PROJECT_VERSION),
					validateProjectVersion
				)
			);

			validationErrors.push(
				showValidationResults(
					answers[COMMAND_OPTIONS.PROJECT_ID],
					(optionValue) => validateNotUndefined(optionValue, COMMAND_OPTIONS.PROJECT_ID),
					validateFieldIsNotEmpty,
					validateFieldHasNoSpaces,
					(optionValue) => validateFieldIsLowerCase(COMMAND_OPTIONS.PROJECT_ID, optionValue)
				)
			);
		}

		return validationErrors.filter((item) => item !== true);
	}
};
