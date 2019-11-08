/*
 ** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const executeWithSpinner = require('../ui/CliSpinner').executeWithSpinner;
const TemplateKeys = require('../templates/TemplateKeys');
const FileSystemService = require('../services/FileSystemService');
const CommandUtils = require('../utils/CommandUtils');
const TranslationService = require('../services/TranslationService');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const NodeUtils = require('../utils/NodeUtils');
const SDKExecutionContext = require('../SDKExecutionContext');
const ApplicationConstants = require('../ApplicationConstants');
const {
	COMMAND_CREATEPROJECT: { QUESTIONS, MESSAGES },
	YES,
	NO,
} = require('../services/TranslationKeys');

const path = require('path');

const ACP_PROJECT_TYPE_DISPLAY = 'Account Customization Project';
const SUITEAPP_PROJECT_TYPE_DISPLAY = 'SuiteApp';
const ACCOUNT_CUSTOMIZATION_DISPLAY = 'Account Customization';

const SOURCE_FOLDER = 'src';
const CLI_CONFIG_TEMPLATE_KEY = 'cliconfig';
const CLI_CONFIG_FILENAME = 'cli-config';
const CLI_CONFIG_EXTENSION = 'js';

const COMMAND_OPTIONS = {
	OVERWRITE: 'overwrite',
	PARENT_DIRECTORY: 'parentdirectory',
	PROJECT_ID: 'projectid',
	PROJECT_NAME: 'projectname',
	PROJECT_VERSION: 'projectversion',
	PUBLISHER_ID: 'publisherid',
	TYPE: 'type',
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
				when: function(response) {
					return response[COMMAND_OPTIONS.TYPE] === ApplicationConstants.PROJECT_SUITEAPP;
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: COMMAND_OPTIONS.PUBLISHER_ID,
				message: TranslationService.getMessage(QUESTIONS.ENTER_PUBLISHER_ID),
				validate: fieldValue => showValidationResults(fieldValue, validatePublisherId),
			},
			{
				when: function(response) {
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
				when: function(response) {
					return response.type === ApplicationConstants.PROJECT_SUITEAPP;
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: COMMAND_OPTIONS.PROJECT_VERSION,
				message: TranslationService.getMessage(QUESTIONS.ENTER_PROJECT_VERSION),
				validate: fieldValue => showValidationResults(fieldValue, validateProjectVersion),
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

	_executeAction(answers) {
		const projectFolderName = answers[COMMAND_ANSWERS.PROJECT_FOLDER_NAME];
		const projectAbsolutePath = answers[COMMAND_OPTIONS.PARENT_DIRECTORY];
		const manifestFilePath = path.join(
			projectAbsolutePath,
			SOURCE_FOLDER,
			ApplicationConstants.FILE_NAMES.MANIFEST_XML
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

		const actionCreateProject = new Promise(async (resolve, reject) => {
			try {
				const executionContextCreateProject = new SDKExecutionContext({
					command: this._commandMetadata.name,
					params: params,
				});

				const operationResult = await this._sdkExecutor.execute(
					executionContextCreateProject
				);

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
				this._fileSystemService.replaceStringInFile(
					manifestFilePath,
					SOURCE_FOLDER,
					answers[COMMAND_OPTIONS.PROJECT_NAME]
				);

				await this._fileSystemService.createFileFromTemplate({
					template: TemplateKeys.PROJECTCONFIGS[CLI_CONFIG_TEMPLATE_KEY],
					destinationFolder: projectAbsolutePath,
					fileName: CLI_CONFIG_FILENAME,
					fileExtension: CLI_CONFIG_EXTENSION,
				});

				return resolve({
					operationResult: operationResult,
					projectType: answers[COMMAND_OPTIONS.TYPE],
					projectDirectory: projectAbsolutePath,
				});
			} catch (error) {
				this._fileSystemService.deleteFolderRecursive(
					path.join(this._executionPath, projectFolderName)
				);
				reject(error);
			}
		});

		return executeWithSpinner({
			action: actionCreateProject,
			message: TranslationService.getMessage(MESSAGES.CREATING_PROJECT),
		});
	}

	_formatOutput(result) {
		if (!result) {
			return;
		}
		if (SDKOperationResultUtils.hasErrors(result.operationResult)) {
			NodeUtils.println(
				TranslationService.getMessage(MESSAGES.PROCESS_FAILED),
				NodeUtils.COLORS.ERROR
			);
			SDKOperationResultUtils.logResultMessage(result.operationResult);
			return;
		}

		SDKOperationResultUtils.logResultMessage(result.operationResult);
		const projectTypeText =
			result.projectType === ApplicationConstants.PROJECT_SUITEAPP
				? SUITEAPP_PROJECT_TYPE_DISPLAY
				: ACCOUNT_CUSTOMIZATION_DISPLAY;
		const message = TranslationService.getMessage(
			MESSAGES.PROJECT_CREATED,
			projectTypeText.toLowerCase(),
			result.projectDirectory,
			NodeUtils.lineBreak
		);
		NodeUtils.println(message, NodeUtils.COLORS.RESULT);
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
