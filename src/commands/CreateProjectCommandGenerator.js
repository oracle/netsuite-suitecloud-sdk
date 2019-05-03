'use strict';

const {	existsSync } = require('fs');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const SDKExecutionContext = require('../SDKExecutionContext');
const executeWithSpinner = require('../ui/CliSpinner').executeWithSpinner;
const TemplateKeys = require('../templates/TemplateKeys');
const FileSystemService = require('../services/FileSystemService');
const CommandUtils = require('../utils/CommandUtils');
const TranslationService = require('../services/TranslationService');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const NodeUtils = require('../utils/NodeUtils');
const {	COMMAND_CREATEPROJECT: { QUESTIONS, MESSAGES }, 
	YES,
	NO,
} = require('../services/TranslationKeys');

const { join } = require('path');

const ACP_PROJECT_TYPE = 'ACCOUNTCUSTOMIZATION';
const SUITEAPP_PROJECT_TYPE = 'SUITEAPP';

const ACP_PROJECT_TYPE_DISPLAY = 'Account Customization Project';
const SUITEAPP_PROJECT_TYPE_DISPLAY = 'SuiteApp';
const ACCOUNT_CUSTOMIZATION_DISPLAY = 'Account Customization';

const SOURCE_FOLDER = 'src';
const MANIFEST_FILENAME = '/manifest.xml';
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
						value: ACP_PROJECT_TYPE,
					},
					{
						name: SUITEAPP_PROJECT_TYPE_DISPLAY,
						value: SUITEAPP_PROJECT_TYPE,
					},
				],
			},
			{
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: COMMAND_QUESTIONS_NAMES.PROJECT_NAME,
				message: TranslationService.getMessage(QUESTIONS.ENTER_PROJECT_NAME),
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
					return response.type === SUITEAPP_PROJECT_TYPE;
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: COMMAND_QUESTIONS_NAMES.PUBLISHER_ID,
				message: TranslationService.getMessage(QUESTIONS.ENTER_PUBLISHER_ID),
			},
			{
				when: function(response) {
					return response.type === SUITEAPP_PROJECT_TYPE;
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: COMMAND_QUESTIONS_NAMES.PROJECT_ID,
				message: TranslationService.getMessage(QUESTIONS.ENTER_PROJECT_ID),
			},
			{
				when: function(response) {
					return response.type === SUITEAPP_PROJECT_TYPE;
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: COMMAND_QUESTIONS_NAMES.PROJECT_VERSION,
				message: TranslationService.getMessage(QUESTIONS.ENTER_PROJECT_VERSION),
			},
		]);
	}

	_preExecuteAction(args) {
		args.parentdirectory = process.cwd() + '\\';
		return args;
	}

	_executeAction(args) {
		let fullyQualifiedProjectId = args.publisherid + '.' + args.projectid;
		let projectName = args.type === SUITEAPP_PROJECT_TYPE ? fullyQualifiedProjectId : args.projectname;
		let projectDirectory = join(args.parentdirectory, projectName, '/');
		let manifestFilePath = join(projectDirectory, SOURCE_FOLDER, MANIFEST_FILENAME);

		let params = {
			parentdirectory: projectDirectory,
			type: args.type,
			projectname: SOURCE_FOLDER,
			...(args.overwrite && { overwrite: '' }),
			...(args.type === SUITEAPP_PROJECT_TYPE && {
				publisherid: args.publisherid,
			}),
			...(args.type === SUITEAPP_PROJECT_TYPE && {
				projectid: args.projectid,
			}),
			...(args.type === SUITEAPP_PROJECT_TYPE && {
				projectversion: args.projectversion,
			}),
		};

		//Since Node CLI renames project folders, check existence here instead of relying on Java CLI
		if (this._fileSystemService.folderExistsAndNotEmpty(projectDirectory)) {
			return new Promise((resolve) => {
				NodeUtils.println(TranslationService.getMessage(MESSAGES.PROJECT_EXISTS), NodeUtils.COLORS.ERROR);
				resolve();
			});
		}

		let executionContext = new SDKExecutionContext({
			command: this._commandMetadata.name,
			params: params,
		});

		this._fileSystemService.createFolder(args.parentdirectory, projectName);

		const renameProjectFolderPromise = () => {
			return new Promise(resolve => {
				if (args.type === SUITEAPP_PROJECT_TYPE) {
					let oldPath = join(projectDirectory, projectName);
					let newPath = join(projectDirectory, SOURCE_FOLDER);
					this._fileSystemService.deleteFolderRecursive(newPath);
					this._fileSystemService.renameFolder(oldPath, newPath);
				}
				resolve();
			});
		};

		const actionCreateProject = new Promise((resolve) => {
			return this._sdkExecutor.execute(executionContext).then(operationResult => {
				if (SDKOperationResultUtils.hasErrors(operationResult)) {
					NodeUtils.println(TranslationService.getMessage(MESSAGES.PROCESS_FAILED), NodeUtils.COLORS.ERROR);
					resolve({
						operationResult: operationResult,
						projectType: args.type,
						projectDirectory: join(args.parentdirectory, projectName)
					});
					return ;
				}

				Promise.all([
					renameProjectFolderPromise().then(() => {
						this._fileSystemService.replaceStringInFile(manifestFilePath, SOURCE_FOLDER, args.projectname);
					}),
					this._fileSystemService.createFileFromTemplate({
						template: TemplateKeys.PROJECTCONFIGS[CLI_CONFIG_TEMPLATE_KEY],
						destinationFolder: projectDirectory,
						fileName: CLI_CONFIG_FILENAME,
						fileExtension: CLI_CONFIG_EXTENSION,
					}),
				]).then(() => {
					resolve({
						operationResult: operationResult,
						projectType: args.type,
						projectDirectory: join(args.parentdirectory, projectName)
					});
				});

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
			SDKOperationResultUtils.logErrors(result.operationResult)
			return;
		}

		SDKOperationResultUtils.logMessages(result.operationResult);
		let projectTypeText = result.projectType == SUITEAPP_PROJECT_TYPE 
				? SUITEAPP_PROJECT_TYPE_DISPLAY 
				: ACCOUNT_CUSTOMIZATION_DISPLAY;
		NodeUtils.println(TranslationService.getMessage(MESSAGES.PROJECT_CREATED, projectTypeText, result.projectDirectory), NodeUtils.COLORS.RESULT);
	}
};
