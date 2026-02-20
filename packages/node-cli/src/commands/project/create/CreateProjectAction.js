/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const CreateProjectActionResult = require('../../../services/actionresult/CreateProjectActionResult');
const BaseAction = require('../../base/BaseAction');
const TemplateKeys = require('../../../templates/TemplateKeys');
const CommandUtils = require('../../../utils/CommandUtils');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');
const SdkExecutionContext = require('../../../SdkExecutionContext');
const ApplicationConstants = require('../../../ApplicationConstants');
const NpmInstallRunner = require('../../../services/NpmInstallRunner');
const FileSystemService = require('../../../services/FileSystemService');
const { throwValidationException, unwrapExceptionMessage } = require('../../../utils/ExceptionUtils');
const {
	COMMAND_CREATEPROJECT: { MESSAGES },
} = require('../../../services/TranslationKeys');
const path = require('path');

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

const JEST_CONFIG_FILENAME = 'jest.config.js';
const JEST_CONFIG_PROJECT_TYPE_ACP = 'SuiteCloudJestConfiguration.ProjectType.ACP';
const JEST_CONFIG_PROJECT_TYPE_SUITEAPP = 'SuiteCloudJestConfiguration.ProjectType.SUITEAPP';
const JEST_CONFIG_REPLACE_STRING_PROJECT_TYPE = '{{projectType}}';
const PACKAGE_JSON_FILENAME = 'package.json';
const PACKAGE_JSON_DEFAULT_VERSION = '1.0.0';
const PACKAGE_JSON_REPLACE_STRING_VERSION = '{{version}}';

const SOURCE_FOLDER = 'src';
const UNIT_TEST_TEST_FOLDER = '__tests__';

const CLI_CONFIG_TEMPLATE_KEY = 'cliconfig';
const GITIGNORE_TEMPLATE_KEY = 'gitignore';
const CLI_CONFIG_FILENAME = 'suitecloud.config';
const GITIGNORE_FILENAME = '.gitignore';
const CLI_CONFIG_EXTENSION = 'js';
const UNIT_TEST_CLI_CONFIG_TEMPLATE_KEY = 'cliconfig';
const UNIT_TEST_CLI_CONFIG_FILENAME = 'suitecloud.config';
const UNIT_TEST_CLI_CONFIG_EXTENSION = 'js';
const UNIT_TEST_PACKAGE_TEMPLATE_KEY = 'packagejson';
const UNIT_TEST_PACKAGE_FILENAME = 'package';
const UNIT_TEST_PACKAGE_EXTENSION = 'json';
const UNIT_TEST_JEST_CONFIG_TEMPLATE_KEY = 'jestconfig';
const UNIT_TEST_JEST_CONFIG_FILENAME = 'jest.config';
const UNIT_TEST_JEST_CONFIG_EXTENSION = 'js';
const UNIT_TEST_SAMPLE_TEST_KEY = 'sampletest';
const UNIT_TEST_SAMPLE_TEST_FILENAME = 'sample-test';
const UNIT_TEST_SAMPLE_TEST_EXTENSION = 'js';
const UNIT_TEST_JSCONFIG_TEMPLATE_KEY = 'jsconfig';
const UNIT_TEST_JSCONFIG_FILENAME = 'jsconfig';
const UNIT_TEST_JSCONFIG_EXTENSION = 'json';

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
		this._fileSystemService = new FileSystemService();
	}

	preExecute(params) {
		if (!params[COMMAND_OPTIONS.PROJECT_FOLDER_NAME]) {
			params[COMMAND_OPTIONS.PROJECT_FOLDER_NAME] = this._getProjectFolderName(params);
		}
		if (!params[COMMAND_OPTIONS.PARENT_DIRECTORY]) {
			params[COMMAND_OPTIONS.PARENT_DIRECTORY] = path.join(this._executionPath, params[COMMAND_OPTIONS.PROJECT_FOLDER_NAME]);
		}
		return params;
	}

	async execute(params) {
		try {
			const projectFolderName = params[COMMAND_OPTIONS.PROJECT_FOLDER_NAME];
			const projectAbsolutePath = params[COMMAND_OPTIONS.PARENT_DIRECTORY];
			const manifestFilePath = path.join(projectAbsolutePath, SOURCE_FOLDER, ApplicationConstants.FILES.MANIFEST_XML);

			const validationErrors = this._validateParams(params);

			if (validationErrors.length > 0) {
				throwValidationException(validationErrors, false, this._commandMetadata);
			}

			if (this._fileSystemService.folderExists(projectAbsolutePath) && !params[COMMAND_OPTIONS.OVERWRITE]) {
				throw NodeTranslationService.getMessage(MESSAGES.OVERWRITE_ERROR, projectAbsolutePath);
			}

			const projectType = params[COMMAND_OPTIONS.TYPE];

			const createProjectParams = {
				//Enclose in double quotes to also support project names with spaces
				parentdirectory: CommandUtils.quoteString(projectAbsolutePath),
				type: projectType,
				projectname: SOURCE_FOLDER,
				...(params[COMMAND_OPTIONS.OVERWRITE] && { overwrite: '' }),
				...(projectType === ApplicationConstants.PROJECT_SUITEAPP && {
					publisherid: params[COMMAND_OPTIONS.PUBLISHER_ID],
					projectid: params[COMMAND_OPTIONS.PROJECT_ID],
					projectversion: params[COMMAND_OPTIONS.PROJECT_VERSION],
				}),
			};

			this._fileSystemService.createFolderFromAbsolutePath(projectAbsolutePath);

			const executionContextCreateProject = SdkExecutionContext.Builder.forCommand(this._commandMetadata.sdkCommand)
				.integration()
				.addParams(createProjectParams)
				.build();

			const createProjectAction = new Promise(
				this.createProject(executionContextCreateProject, params, projectAbsolutePath, projectFolderName, manifestFilePath)
			);

			const createProjectActionData = await createProjectAction;

			const projectName = params[COMMAND_OPTIONS.PROJECT_NAME];
			const includeUnitTesting = this._getIncludeUnitTestingBoolean(params[COMMAND_OPTIONS.INCLUDE_UNIT_TESTING]);
			//fixing project name for not interactive output before building results
			const commandParameters = { ...createProjectParams, [`${COMMAND_OPTIONS.PROJECT_NAME}`]: params[COMMAND_OPTIONS.PROJECT_NAME] };

			return createProjectActionData.operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
				? CreateProjectActionResult.Builder.withData(createProjectActionData.operationResult.data)
					.withResultMessage(createProjectActionData.operationResult.resultMessage)
					.withProjectType(projectType)
					.withProjectName(projectName)
					.withProjectDirectory(createProjectActionData.projectDirectory)
					.withUnitTesting(includeUnitTesting)
					.withNpmPackageInitialized(createProjectActionData.npmInstallSuccess)
					.withCommandParameters(commandParameters)
					.build()
				: CreateProjectActionResult.Builder.withErrors(createProjectActionData.operationResult.errorMessages)
					.withCommandParameters(commandParameters)
					.build();
		} catch (error) {
			return CreateProjectActionResult.Builder.withErrors([unwrapExceptionMessage(error)]).build();
		}
	}

	createProject(executionContextCreateProject, params, projectAbsolutePath, projectFolderName, manifestFilePath) {
		return async (resolve, reject) => {
			try {
				await this._log.info(NodeTranslationService.getMessage(MESSAGES.CREATING_PROJECT_STRUCTURE));
				if (params[COMMAND_OPTIONS.OVERWRITE]) {
					this._fileSystemService.emptyFolderRecursive(projectAbsolutePath);
				}

				const operationResult = await this._sdkExecutor.execute(executionContextCreateProject);

				if (operationResult.status === SdkOperationResultUtils.STATUS.ERROR) {
					resolve({
						operationResult: operationResult,
						projectType: params[COMMAND_OPTIONS.TYPE],
						projectDirectory: projectAbsolutePath,
					});
					return;
				}
				if (params[COMMAND_OPTIONS.TYPE] === ApplicationConstants.PROJECT_SUITEAPP) {
					const oldPath = path.join(projectAbsolutePath, projectFolderName);
					const newPath = path.join(projectAbsolutePath, SOURCE_FOLDER);
					this._fileSystemService.deleteFolderRecursive(newPath);
					this._fileSystemService.renameFolder(oldPath, newPath);
				}
				this._fileSystemService.replaceStringInFile(manifestFilePath, SOURCE_FOLDER, params[COMMAND_OPTIONS.PROJECT_NAME]);
				let npmInstallSuccess;
				let includeUnitTesting = this._getIncludeUnitTestingBoolean(params[COMMAND_OPTIONS.INCLUDE_UNIT_TESTING]);
				if (includeUnitTesting) {
					await this._log.info(NodeTranslationService.getMessage(MESSAGES.SETUP_TEST_ENV));
					await this._createUnitTestFiles(
						params[COMMAND_OPTIONS.TYPE],
						params[COMMAND_OPTIONS.PROJECT_NAME],
						params[COMMAND_OPTIONS.PROJECT_VERSION],
						projectAbsolutePath
					);

					await this._log.info(NodeTranslationService.getMessage(MESSAGES.INIT_NPM_DEPENDENCIES));
					npmInstallSuccess = await this._runNpmInstall(projectAbsolutePath);
				} else {
					await this._createDefaultSuiteCloudConfigFile(projectAbsolutePath);
				}

				await this._createGitignoreFile(projectAbsolutePath);

				return resolve({
					operationResult: operationResult,
					projectDirectory: projectAbsolutePath,
					npmInstallSuccess: npmInstallSuccess,
				});
			} catch (error) {
				this._fileSystemService.deleteFolderRecursive(path.join(projectAbsolutePath, projectFolderName));
				reject(error);
			}
		};
	}

	_getIncludeUnitTestingBoolean(includeUnitTestingParam) {
		let includeUnitTesting = includeUnitTestingParam;
		if (typeof includeUnitTesting === 'string') {
			includeUnitTesting = includeUnitTesting === 'true';
		}

		return includeUnitTesting;
	}

	_getProjectFolderName(params) {
		switch (params[COMMAND_OPTIONS.TYPE]) {
			case ApplicationConstants.PROJECT_SUITEAPP:
				return params[COMMAND_OPTIONS.PUBLISHER_ID] && params[COMMAND_OPTIONS.PROJECT_ID]
					? params[COMMAND_OPTIONS.PUBLISHER_ID] + '.' + params[COMMAND_OPTIONS.PROJECT_ID]
					: 'not_specified';
			case ApplicationConstants.PROJECT_ACP:
				return params[COMMAND_OPTIONS.PROJECT_NAME] ? params[COMMAND_OPTIONS.PROJECT_NAME] : 'not_specified';
			default:
				// if --type parameter isn't correct, it doesn't matter the project folder name. It will throw a validation error later
				return 'not_specified';
		}
	}

	async _createUnitTestFiles(type, projectName, projectVersion, projectAbsolutePath) {
		await this._createUnitTestCliConfigFile(projectAbsolutePath);
		await this._createUnitTestPackageJsonFile(type, projectName, projectVersion, projectAbsolutePath);
		await this._createJestConfigFile(type, projectAbsolutePath);
		await this._createSampleUnitTestFile(projectAbsolutePath);
		await this._createJsConfigFile(projectAbsolutePath);
	}

	async _createGitignoreFile(projectAbsolutePath) {
		await this._fileSystemService.createFileFromTemplate({
			template: TemplateKeys.PROJECTCONFIGS[GITIGNORE_TEMPLATE_KEY],
			destinationFolder: projectAbsolutePath,
			fileName: GITIGNORE_FILENAME,
		});
	}

	async _createDefaultSuiteCloudConfigFile(projectAbsolutePath) {
		await this._fileSystemService.createFileFromTemplate({
			template: TemplateKeys.PROJECTCONFIGS[CLI_CONFIG_TEMPLATE_KEY],
			destinationFolder: projectAbsolutePath,
			fileName: CLI_CONFIG_FILENAME,
			fileExtension: CLI_CONFIG_EXTENSION,
		});
	}

	async _createUnitTestCliConfigFile(projectAbsolutePath) {
		await this._fileSystemService.createFileFromTemplate({
			template: TemplateKeys.UNIT_TEST[UNIT_TEST_CLI_CONFIG_TEMPLATE_KEY],
			destinationFolder: projectAbsolutePath,
			fileName: UNIT_TEST_CLI_CONFIG_FILENAME,
			fileExtension: UNIT_TEST_CLI_CONFIG_EXTENSION,
		});
	}

	async _createUnitTestPackageJsonFile(type, projectName, projectVersion, projectAbsolutePath) {
		await this._fileSystemService.createFileFromTemplate({
			template: TemplateKeys.UNIT_TEST[UNIT_TEST_PACKAGE_TEMPLATE_KEY],
			destinationFolder: projectAbsolutePath,
			fileName: UNIT_TEST_PACKAGE_FILENAME,
			fileExtension: UNIT_TEST_PACKAGE_EXTENSION,
		});

		let packageJsonAbsolutePath = path.join(projectAbsolutePath, PACKAGE_JSON_FILENAME);

		let version = PACKAGE_JSON_DEFAULT_VERSION;
		if (type === ApplicationConstants.PROJECT_SUITEAPP) {
			version = projectVersion;
		}
		await this._fileSystemService.replaceStringInFile(packageJsonAbsolutePath, PACKAGE_JSON_REPLACE_STRING_VERSION, version);
	}

	async _createJestConfigFile(type, projectAbsolutePath) {
		await this._fileSystemService.createFileFromTemplate({
			template: TemplateKeys.UNIT_TEST[UNIT_TEST_JEST_CONFIG_TEMPLATE_KEY],
			destinationFolder: projectAbsolutePath,
			fileName: UNIT_TEST_JEST_CONFIG_FILENAME,
			fileExtension: UNIT_TEST_JEST_CONFIG_EXTENSION,
		});

		let jestConfigProjectType = JEST_CONFIG_PROJECT_TYPE_ACP;
		if (type === ApplicationConstants.PROJECT_SUITEAPP) {
			jestConfigProjectType = JEST_CONFIG_PROJECT_TYPE_SUITEAPP;
		}
		let jestConfigAbsolutePath = path.join(projectAbsolutePath, JEST_CONFIG_FILENAME);
		await this._fileSystemService.replaceStringInFile(jestConfigAbsolutePath, JEST_CONFIG_REPLACE_STRING_PROJECT_TYPE, jestConfigProjectType);
	}

	async _createSampleUnitTestFile(projectAbsolutePath) {
		let testsFolderAbsolutePath = this._fileSystemService.createFolder(projectAbsolutePath, UNIT_TEST_TEST_FOLDER);
		await this._fileSystemService.createFileFromTemplate({
			template: TemplateKeys.UNIT_TEST[UNIT_TEST_SAMPLE_TEST_KEY],
			destinationFolder: testsFolderAbsolutePath,
			fileName: UNIT_TEST_SAMPLE_TEST_FILENAME,
			fileExtension: UNIT_TEST_SAMPLE_TEST_EXTENSION,
		});
	}

	async _createJsConfigFile(projectAbsolutePath) {
		await this._fileSystemService.createFileFromTemplate({
			template: TemplateKeys.UNIT_TEST[UNIT_TEST_JSCONFIG_TEMPLATE_KEY],
			destinationFolder: projectAbsolutePath,
			fileName: UNIT_TEST_JSCONFIG_FILENAME,
			fileExtension: UNIT_TEST_JSCONFIG_EXTENSION,
		});
	}

	async _runNpmInstall(projectAbsolutePath) {
		try {
			await NpmInstallRunner.run(projectAbsolutePath);
			return true;
		} catch (error) {
			return false;
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
