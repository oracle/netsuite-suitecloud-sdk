/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const CreateProjectActionResult = require('./actionresult/CreateProjectActionResult');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const TemplateKeys = require('../templates/TemplateKeys');
const FileSystemService = require('../services/FileSystemService');
const CommandUtils = require('../utils/CommandUtils');
const TranslationService = require('../services/TranslationService');
const ActionResultUtils = require('../utils/ActionResultUtils');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const NodeUtils = require('../utils/NodeUtils');
const SDKExecutionContext = require('../SDKExecutionContext');
const ApplicationConstants = require('../ApplicationConstants');
const NpmInstallRunner = require('../services/NpmInstallRunner');
const {
	COMMAND_CREATEPROJECT: { QUESTIONS, MESSAGES },
	YES,
	NO,
} = require('../services/TranslationKeys');

const path = require('path');

const ACP_PROJECT_TYPE_DISPLAY = 'Account Customization Project';
const SUITEAPP_PROJECT_TYPE_DISPLAY = 'SuiteApp';
const ACCOUNT_CUSTOMIZATION_DISPLAY = 'Account Customization';
const DEFAULT_PROJECT_VERSION = '1.0.0';
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
const CLI_CONFIG_FILENAME = 'suitecloud.config';
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

const COMMAND_OPTIONS = {
	OVERWRITE: 'overwrite',
	PARENT_DIRECTORY: 'parentdirectory',
	PROJECT_ID: 'projectid',
	PROJECT_NAME: 'projectname',
	PROJECT_VERSION: 'projectversion',
	PUBLISHER_ID: 'publisherid',
	TYPE: 'type',
	INCLUDE_UNIT_TESTING: 'includeunittesting',
};

const COMMAND_ANSWERS = {
	PROJECT_ABSOLUTE_PATH: 'projectabsolutepath',
	PROJECT_FOLDER_NAME: 'projectfoldername',
};

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
} = require('../validation/InteractiveAnswersValidator');

const { throwValidationException } = require('../utils/ExceptionUtils');

module.exports = class CreateProjectCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._fileSystemService = new FileSystemService();
	}

	async _getCommandQuestions(prompt) {
		const answers = await prompt([
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND_OPTIONS.TYPE,
				message: TranslationService.getMessage(QUESTIONS.CHOOSE_PROJECT_TYPE),
				default: 0,
				choices: [
					{
						name: ACP_PROJECT_TYPE_DISPLAY,
						value: ApplicationConstants.PROJECT_ACP,
					},
					{
						name: SUITEAPP_PROJECT_TYPE_DISPLAY,
						value: ApplicationConstants.PROJECT_SUITEAPP,
					},
				],
			},
			{
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: COMMAND_OPTIONS.PROJECT_NAME,
				message: TranslationService.getMessage(QUESTIONS.ENTER_PROJECT_NAME),
				filter: fieldValue => fieldValue.trim(),
				validate: fieldValue =>
					showValidationResults(
						fieldValue,
						validateFieldIsNotEmpty,
						validateXMLCharacters
					),
			},
			{
				when: function (response) {
					return response[COMMAND_OPTIONS.TYPE] === ApplicationConstants.PROJECT_SUITEAPP;
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: COMMAND_OPTIONS.PUBLISHER_ID,
				message: TranslationService.getMessage(QUESTIONS.ENTER_PUBLISHER_ID),
				validate: fieldValue => showValidationResults(fieldValue, validatePublisherId),
			},
			{
				when: function (response) {
					return response.type === ApplicationConstants.PROJECT_SUITEAPP;
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: COMMAND_OPTIONS.PROJECT_ID,
				message: TranslationService.getMessage(QUESTIONS.ENTER_PROJECT_ID),
				validate: fieldValue =>
					showValidationResults(
						fieldValue,
						validateFieldIsNotEmpty,
						validateFieldHasNoSpaces,
						fieldValue =>
							validateFieldIsLowerCase(COMMAND_OPTIONS.PROJECT_ID, fieldValue)
					),
			},
			{
				when: function (response) {
					return response.type === ApplicationConstants.PROJECT_SUITEAPP;
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: COMMAND_OPTIONS.PROJECT_VERSION,
				message: TranslationService.getMessage(QUESTIONS.ENTER_PROJECT_VERSION),
				default: DEFAULT_PROJECT_VERSION,
				validate: fieldValue => showValidationResults(fieldValue, validateProjectVersion),
			},
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND_OPTIONS.INCLUDE_UNIT_TESTING,
				message: TranslationService.getMessage(QUESTIONS.INCLUDE_UNIT_TESTING),
				default: 0,
				choices: [
					{ name: TranslationService.getMessage(YES), value: true },
					{ name: TranslationService.getMessage(NO), value: false },
				],
			},
		]);

		const projectFolderName = this._getProjectFolderName(answers);
		const projectAbsolutePath = path.join(this._executionPath, projectFolderName);

		if (
			this._fileSystemService.folderExists(projectAbsolutePath) &&
			!this._fileSystemService.isFolderEmpty(projectAbsolutePath)
		) {
			const overwriteAnswer = await prompt([
				{
					type: CommandUtils.INQUIRER_TYPES.LIST,
					name: COMMAND_OPTIONS.OVERWRITE,
					message: TranslationService.getMessage(
						QUESTIONS.OVERWRITE_PROJECT,
						projectAbsolutePath
					),
					default: 0,
					choices: [
						{ name: TranslationService.getMessage(NO), value: false },
						{ name: TranslationService.getMessage(YES), value: true },
					],
				},
			]);
			answers[COMMAND_OPTIONS.OVERWRITE] = overwriteAnswer[COMMAND_OPTIONS.OVERWRITE];
			if (!overwriteAnswer[COMMAND_OPTIONS.OVERWRITE]) {
				throw TranslationService.getMessage(MESSAGES.PROJECT_CREATION_CANCELED);
			}
		}
		return answers;
	}

	_getProjectFolderName(answers) {
		return answers[COMMAND_OPTIONS.TYPE] === ApplicationConstants.PROJECT_SUITEAPP
			? answers[COMMAND_OPTIONS.PUBLISHER_ID] + '.' + answers[COMMAND_OPTIONS.PROJECT_ID]
			: answers[COMMAND_OPTIONS.PROJECT_NAME];
	}

	_preExecuteAction(answers) {
		const projectFolderName = this._getProjectFolderName(answers);
		if (projectFolderName) {
			answers[COMMAND_OPTIONS.PARENT_DIRECTORY] = path.join(
				this._executionPath,
				projectFolderName
			);
			answers[COMMAND_ANSWERS.PROJECT_FOLDER_NAME] = projectFolderName;
		} else {
			// parentdirectory is a mandatory option in javaCLI but it must be computed in the nodeCLI
			answers[COMMAND_OPTIONS.PARENT_DIRECTORY] = 'not_specified';
		}

		return answers;
	}

	async _executeAction(answers) {
		try {
			const projectFolderName = answers[COMMAND_ANSWERS.PROJECT_FOLDER_NAME];
			const projectAbsolutePath = answers[COMMAND_OPTIONS.PARENT_DIRECTORY];
			const manifestFilePath = path.join(
				projectAbsolutePath,
				SOURCE_FOLDER,
				ApplicationConstants.FILES.MANIFEST_XML
			);

			const validationErrors = this._validateParams(answers);

			if (validationErrors.length > 0) {
				throwValidationException(validationErrors, false, this._commandMetadata);
			}

			const params = {
				//Enclose in double quotes to also support project names with spaces
				parentdirectory: CommandUtils.quoteString(projectAbsolutePath),
				type: answers[COMMAND_OPTIONS.TYPE],
				projectname: SOURCE_FOLDER,
				...(answers[COMMAND_OPTIONS.OVERWRITE] && { overwrite: '' }),
				...(answers[COMMAND_OPTIONS.TYPE] === ApplicationConstants.PROJECT_SUITEAPP && {
					publisherid: answers[COMMAND_OPTIONS.PUBLISHER_ID],
					projectid: answers[COMMAND_OPTIONS.PROJECT_ID],
					projectversion: answers[COMMAND_OPTIONS.PROJECT_VERSION],
				}),
			};

			this._fileSystemService.createFolder(this._executionPath, projectFolderName);

			const createProjectAction = new Promise(this.createProject(
				params, answers, projectAbsolutePath, projectFolderName, manifestFilePath));

			const createProjectActionData = await createProjectAction;

			var projectType = answers[COMMAND_OPTIONS.TYPE];
			var projectName = answers[COMMAND_OPTIONS.PROJECT_NAME];
			var includeUnitTesting = answers[COMMAND_OPTIONS.INCLUDE_UNIT_TESTING];


			return createProjectActionData.operationResult.status === SDKOperationResultUtils.SUCCESS
				? CreateProjectActionResult.Builder
					.withData(createProjectActionData.operationResult.data)
					.withResultMessage(createProjectActionData.operationResult.resultMessage)
					.withProjectType(projectType)
					.withProjectName(projectName)
					.withProjectDirectory(createProjectActionData.projectDirectory)
					.withUnitTesting(includeUnitTesting)
					.withNpmPackageInitialized(createProjectActionData.operationResult)
					.build()
				: CreateProjectActionResult.Builder
					.withErrors(ActionResultUtils.collectErrorMessages(createProjectActionData.operationResult))
					.build();
		} catch (error) {
			return CreateProjectActionResult.Builder.withErrors([error]).build();
		}
	}

	createProject(params, answers, projectAbsolutePath, projectFolderName, manifestFilePath) {
		return async (resolve, reject) => {
			try {
				NodeUtils.println(TranslationService.getMessage(MESSAGES.CREATING_PROJECT_STRUCTURE), NodeUtils.COLORS.INFO);
				if (answers[COMMAND_OPTIONS.OVERWRITE]) {
					this._fileSystemService.emptyFolderRecursive(projectAbsolutePath);
				}
				const executionContextCreateProject = new SDKExecutionContext({
					command: this._commandMetadata.sdkCommand,
					params: params,
				});

				const operationResult = await this._sdkExecutor.execute(executionContextCreateProject);

				if (SDKOperationResultUtils.hasErrors(operationResult)) {
					resolve({
						operationResult: operationResult,
						projectType: answers[COMMAND_OPTIONS.TYPE],
						projectDirectory: projectAbsolutePath,
					});
					return;
				}
				if (answers[COMMAND_OPTIONS.TYPE] === ApplicationConstants.PROJECT_SUITEAPP) {
					const oldPath = path.join(projectAbsolutePath, projectFolderName);
					const newPath = path.join(projectAbsolutePath, SOURCE_FOLDER);
					this._fileSystemService.deleteFolderRecursive(newPath);
					this._fileSystemService.renameFolder(oldPath, newPath);
				}
				this._fileSystemService.replaceStringInFile(manifestFilePath, SOURCE_FOLDER, answers[COMMAND_OPTIONS.PROJECT_NAME]);
				let npmInstallSuccess;
				if (answers[COMMAND_OPTIONS.INCLUDE_UNIT_TESTING]) {
					NodeUtils.println(TranslationService.getMessage(MESSAGES.SETUP_TEST_ENV), NodeUtils.COLORS.INFO);
					await this._createUnitTestFiles(
						answers[COMMAND_OPTIONS.TYPE],
						answers[COMMAND_OPTIONS.PROJECT_NAME],
						answers[COMMAND_OPTIONS.PROJECT_VERSION],
						projectAbsolutePath
					);

					NodeUtils.println(TranslationService.getMessage(MESSAGES.INIT_NPM_DEPENDENCIES), NodeUtils.COLORS.INFO);
					npmInstallSuccess = await this._runNpmInstall(projectAbsolutePath);
				} else {
					await this._fileSystemService.createFileFromTemplate({
						template: TemplateKeys.PROJECTCONFIGS[CLI_CONFIG_TEMPLATE_KEY],
						destinationFolder: projectAbsolutePath,
						fileName: CLI_CONFIG_FILENAME,
						fileExtension: CLI_CONFIG_EXTENSION,
					});
				}
				return resolve({
					operationResult: operationResult,
					projectDirectory: projectAbsolutePath,
					npmInstallSuccess: npmInstallSuccess
				});
			}
			catch (error) {
				this._fileSystemService.deleteFolderRecursive(path.join(this._executionPath, projectFolderName));
				reject(error);
			}
		};
	}

	async _createUnitTestFiles(type, projectName, projectVersion, projectAbsolutePath) {
		await this._createUnitTestCliConfigFile(projectAbsolutePath);
		await this._createUnitTestPackageJsonFile(type, projectName, projectVersion, projectAbsolutePath);
		await this._createJestConfigFile(type, projectAbsolutePath);
		await this._createSampleUnitTestFile(projectAbsolutePath);
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
		await this._fileSystemService.replaceStringInFile(
			packageJsonAbsolutePath,
			PACKAGE_JSON_REPLACE_STRING_VERSION,
			version
		);
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
		await this._fileSystemService.replaceStringInFile(
			jestConfigAbsolutePath,
			JEST_CONFIG_REPLACE_STRING_PROJECT_TYPE,
			jestConfigProjectType
		);
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

	async _runNpmInstall(projectAbsolutePath) {
		try {
			await NpmInstallRunner.run(projectAbsolutePath);
			return true;
		} catch (error) {
			return false;
		}
	}

	_formatOutput(actionResult) {
		if (!actionResult) {
			return;
		}
		if (actionResult.status === ActionResult.ERROR) {
			ActionResultUtils.logErrors(actionResult.errorMessages);
			return;
		}
		ActionResultUtils.logResultMessage(actionResult);

		const projectCreatedMessage = TranslationService.getMessage(MESSAGES.PROJECT_CREATED, actionResult.projectName);
		NodeUtils.println(projectCreatedMessage, NodeUtils.COLORS.RESULT);

		if (actionResult.includeUnitTesting) {
			const sampleUnitTestMessage = TranslationService.getMessage(MESSAGES.SAMPLE_UNIT_TEST_ADDED);
			NodeUtils.println(sampleUnitTestMessage, NodeUtils.COLORS.RESULT);
			if (!actionResult.npmPackageIntitialized) {
				NodeUtils.println(TranslationService.getMessage(MESSAGES.INIT_NPM_DEPENDENCIES_FAILED), NodeUtils.COLORS.ERROR);
			}
		}

		const navigateToProjectMessage = TranslationService.getMessage(MESSAGES.NAVIGATE_TO_FOLDER, actionResult.projectDirectory);
		NodeUtils.println(navigateToProjectMessage, NodeUtils.COLORS.RESULT);
	}

	_validateParams(answers) {
		const validationErrors = [];
		validationErrors.push(
			showValidationResults(
				answers[COMMAND_OPTIONS.PROJECT_NAME],
				validateFieldIsNotEmpty,
				validateXMLCharacters
			)
		);
		validationErrors.push(
			showValidationResults(answers[COMMAND_OPTIONS.TYPE], validateProjectType)
		);
		if (answers[COMMAND_OPTIONS.TYPE] === ApplicationConstants.PROJECT_SUITEAPP) {
			validationErrors.push(
				showValidationResults(
					answers[COMMAND_OPTIONS.PUBLISHER_ID],
					optionValue => validateNotUndefined(optionValue, COMMAND_OPTIONS.PUBLISHER_ID),
					validatePublisherId
				)
			);

			validationErrors.push(
				showValidationResults(
					answers[COMMAND_OPTIONS.PROJECT_VERSION],
					optionValue =>
						validateNotUndefined(optionValue, COMMAND_OPTIONS.PROJECT_VERSION),
					validateProjectVersion
				)
			);

			validationErrors.push(
				showValidationResults(
					answers[COMMAND_OPTIONS.PROJECT_ID],
					optionValue => validateNotUndefined(optionValue, COMMAND_OPTIONS.PROJECT_ID),
					validateFieldIsNotEmpty,
					validateFieldHasNoSpaces,
					optionValue => validateFieldIsLowerCase(COMMAND_OPTIONS.PROJECT_ID, optionValue)
				)
			);
		}

		return validationErrors.filter(item => item !== true);
	}
};
