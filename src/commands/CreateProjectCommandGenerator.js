'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const SDKExecutionContext = require('../SDKExecutionContext');
const executeWithSpinner = require('../ui/CliSpinner').executeWithSpinner;
const TemplateKeys = require('../templates/TemplateKeys');
const FileSystemService = require('../services/FileSystemService');
const CommandUtils = require('../utils/CommandUtils');
const TranslationService = require('../services/TranslationService');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const NodeUtils = require('../utils/NodeUtils');
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

const COMMAND_QUESTIONS_NAMES = {
	OVERWRITE: 'overwrite',
	PROJECT_ID: 'projectid',
	PROJECT_NAME: 'projectname',
	PROJECT_VERSION: 'projectversion',
	PUBLISHER_ID: 'publisherid',
	TYPE: 'type',
};

const {
	validateFieldIsNotEmpty,
	showValidationResults,
	validateFieldHasNoSpaces,
	validateFieldIsLowerCase,
	validatePublisherId,
	validateProjectVersion,
} = require('../validation/InteractiveAnswersValidator');

module.exports = class CreateProjectCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._fileSystemService = new FileSystemService();
	}

	_getCommandQuestions(prompt) {
		return prompt([
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND_QUESTIONS_NAMES.TYPE,
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
				name: COMMAND_QUESTIONS_NAMES.PROJECT_NAME,
				message: TranslationService.getMessage(QUESTIONS.ENTER_PROJECT_NAME),
				validate: fieldValue => showValidationResults(fieldValue, validateFieldIsNotEmpty),
			},
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: COMMAND_QUESTIONS_NAMES.OVERWRITE,
				message: TranslationService.getMessage(QUESTIONS.OVERWRITE_PROJECT),
				default: 0,
				choices: [
					{ name: TranslationService.getMessage(NO), value: false },
					{ name: TranslationService.getMessage(YES), value: true },
				],
			},
			{
				when: function(response) {
					return response.type === ApplicationConstants.PROJECT_SUITEAPP;
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: COMMAND_QUESTIONS_NAMES.PUBLISHER_ID,
				message: TranslationService.getMessage(QUESTIONS.ENTER_PUBLISHER_ID),
				validate: fieldValue => showValidationResults(fieldValue, validatePublisherId),
			},
			{
				when: function(response) {
					return response.type === ApplicationConstants.PROJECT_SUITEAPP;
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: COMMAND_QUESTIONS_NAMES.PROJECT_ID,
				message: TranslationService.getMessage(QUESTIONS.ENTER_PROJECT_ID),
				validate: fieldValue => showValidationResults(fieldValue, validateFieldIsNotEmpty, validateFieldHasNoSpaces, validateFieldIsLowerCase)
			},
			{
				when: function(response) {
					return response.type === ApplicationConstants.PROJECT_SUITEAPP;
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: COMMAND_QUESTIONS_NAMES.PROJECT_VERSION,
				message: TranslationService.getMessage(QUESTIONS.ENTER_PROJECT_VERSION),
				validate: fieldValue => showValidationResults(fieldValue, validateProjectVersion),
			},
		]);
	}

	_preExecuteAction(args) {
		args.parentdirectory = process.cwd();
		return args;
	}

	_executeAction(args) {
		const fullyQualifiedProjectId = args.publisherid + '.' + args.projectid;
		const projectName =
			args.type === ApplicationConstants.PROJECT_SUITEAPP
				? fullyQualifiedProjectId
				: args.projectname;
		const projectDirectory = path.join(args.parentdirectory, projectName);
		const manifestFilePath = path.join(
			projectDirectory,
			SOURCE_FOLDER,
			ApplicationConstants.MANIFEST_XML
		);

		const params = {
			//Enclose in double quotes to also support project names with spaces
			parentdirectory: '\"' + projectDirectory + '\"',
			type: args.type,
			projectname: SOURCE_FOLDER,
			...(args.overwrite && { overwrite: '' }),
			...(args.type === ApplicationConstants.PROJECT_SUITEAPP && {
				publisherid: args.publisherid,
			}),
			...(args.type === ApplicationConstants.PROJECT_SUITEAPP && {
				projectid: args.projectid,
			}),
			...(args.type === ApplicationConstants.PROJECT_SUITEAPP && {
				projectversion: args.projectversion,
			}),
		};

		//Since Node CLI renames project folders, check existence here instead of relying on Java CLI
		if (
			this._fileSystemService.folderExists(projectDirectory) &&
			!this._fileSystemService.isFolderEmpty(projectDirectory) &&
			!args.overwrite
		) {
			return new Promise((resolve, reject) => {
				reject(TranslationService.getMessage(MESSAGES.PROJECT_EXISTS, path.join(args.parentdirectory, projectName)));
			});
		}

		this._fileSystemService.createFolder(args.parentdirectory, projectName);

		const actionCreateProject = new Promise((resolve, reject) => {
			const executionContext = new SDKExecutionContext({
				command: this._commandMetadata.name,
				params: params,
			});
			return this._sdkExecutor
				.execute(executionContext)
				.then(operationResult => {
					if (SDKOperationResultUtils.hasErrors(operationResult)) {
						resolve({
							operationResult: operationResult,
							projectType: args.type,
							projectDirectory: path.join(args.parentdirectory, projectName),
						});
						return;
					}

					if (args.type === ApplicationConstants.PROJECT_SUITEAPP) {
						let oldPath = path.join(projectDirectory, projectName);
						let newPath = path.join(projectDirectory, SOURCE_FOLDER);
						this._fileSystemService.deleteFolderRecursive(newPath);
						this._fileSystemService.renameFolder(oldPath, newPath);
					}
					this._fileSystemService.replaceStringInFile(
						manifestFilePath,
						SOURCE_FOLDER,
						args.projectname
					);

					this._fileSystemService
						.createFileFromTemplate({
							template: TemplateKeys.PROJECTCONFIGS[CLI_CONFIG_TEMPLATE_KEY],
							destinationFolder: projectDirectory,
							fileName: CLI_CONFIG_FILENAME,
							fileExtension: CLI_CONFIG_EXTENSION,
						})
						.then(() => {
							resolve({
								operationResult: operationResult,
								projectType: args.type,
								projectDirectory: path.join(args.parentdirectory, projectName),
							});
						})
						.catch(error => {
							reject(error);
						});
				})
				.catch(error => {
					reject(error);
				});
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
			SDKOperationResultUtils.logErrors(result.operationResult);
			return;
		}

		SDKOperationResultUtils.logMessages(result.operationResult);
		const projectTypeText =
			result.projectType === ApplicationConstants.PROJECT_SUITEAPP
				? SUITEAPP_PROJECT_TYPE_DISPLAY
				: ACCOUNT_CUSTOMIZATION_DISPLAY;
		const message = TranslationService.getMessage(
			MESSAGES.PROJECT_CREATED,
			projectTypeText,
			result.projectDirectory
		);
		NodeUtils.println(message, NodeUtils.COLORS.RESULT);
	}
};
