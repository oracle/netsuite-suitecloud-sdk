import BaseAction from './BaseAction';
import { TextDocument, Uri, window, workspace } from 'vscode';
import { ANSWERS, CREATE_FILE } from '../service/TranslationKeys';
import {
	ApplicationConstants,
	CLIConfigurationService,
	FileCabinetService,
	FileSystemService,
	InteractiveAnswersValidator,
	ProjectInfoServive,
} from '../util/ExtensionUtil';
import * as path from 'path';

const SUITESCRIPT_TYPES = require('@oracle/suitecloud-cli/src/metadata/SuiteScriptTypesMetadata');
const SUITESCRIPT_MODULES = require('@oracle/suitecloud-cli/src/metadata/SuiteScriptModulesMetadata');

const COMMAND_NAME = 'createfile';
const SUITEAPPS_PATH = '/SuiteApps';
const SUITESCRIPTS_PATH = '/SuiteScripts';

export default class CreateFile extends BaseAction {

	constructor() {
		super(COMMAND_NAME);
	}

	protected async execute(): Promise<void> {
		const activeFile = window.activeTextEditor?.document.uri;
		if (!activeFile) {
			// Already checked in validate
			return;
		}

		const commandArgs = await this.getCommandArgs();
		if (Object.keys(commandArgs).length === 0) {
			return;
		}

		const cliConfigurationService = new CLIConfigurationService();
		cliConfigurationService.initialize(this.executionPath);


		const actionResult = await this.runSuiteCloudCommand(commandArgs);

		if (actionResult.isSuccess()) {
			const createdFileUri: Uri = Uri.file(actionResult.data.path);
			workspace.openTextDocument(createdFileUri).then((createdFile: TextDocument) => {
				window.showTextDocument(createdFile);
			}, (error: any) => {
				console.error(error);
				debugger;
			});
		}
	}

	private async getCommandArgs(): Promise<{ [key: string]: any }> {
		const args: { [k: string]: string | string[] } = {
			'project': this.getProjectFolderPath(),
		};

		const selectedScriptType = await this.promptScriptTypeQuestion();
		const selectedModules = await this.promptAddModulesQuestion();
		const selectedFolder = await this.promptFolderSelection();
		const fileName = await this.promptFileNameInputBox();

		args.type = selectedScriptType ? SUITESCRIPT_TYPES.find((type: { name: string; }) => type.name === selectedScriptType).id : '';

		if (selectedModules) {
			args.modules = selectedModules.map(module => `"${module}"`);
		}

		if (selectedFolder && fileName) {
			args.path = selectedFolder + fileName;
		}

		return args;
	}

	private promptScriptTypeQuestion(): Thenable<string | undefined> {
		return window.showQuickPick(
			SUITESCRIPT_TYPES.map((scriptType: { name: string; }) => scriptType.name),
			{
				placeHolder: this.translationService.getMessage(CREATE_FILE.QUESTIONS.CHOOSE_SUITESCRIPT_TYPE),
				canPickMany: false,
			},
		);
	}

	private async promptAddModulesQuestion(): Promise<string[] | undefined> {
		const yes = this.translationService.getMessage(ANSWERS.YES);
		const no = this.translationService.getMessage(ANSWERS.NO);
		const _this = this;
		const answer = await window.showQuickPick(
			[yes, no],
			{
				placeHolder: this.translationService.getMessage(CREATE_FILE.QUESTIONS.ADD_SUITESCRIPT_MODULES),
				canPickMany: false,
			},
		);
		if (answer === yes) {
			return window.showQuickPick(
				SUITESCRIPT_MODULES.map((module: { id: string; }) => module.id),
				{
					placeHolder: _this.translationService.getMessage(CREATE_FILE.QUESTIONS.SELECT_SUITESCRIPT_MODULES),
					canPickMany: true,
				},
			);
		}
	}

	private promptFolderSelection(): Thenable<string | undefined> {
		return window.showQuickPick(this.getFolderChoices(),
			{
				placeHolder: this.translationService.getMessage(CREATE_FILE.QUESTIONS.SELECT_FOLDER),
				canPickMany: false,
			},
		);
	}

	private promptFileNameInputBox(): Thenable<string | undefined> {
		return window.showInputBox(
			{
				ignoreFocusOut: true,
				title: this.translationService.getMessage(CREATE_FILE.QUESTIONS.ENTER_NAME),
				placeHolder: this.translationService.getMessage(CREATE_FILE.QUESTIONS.ENTER_NAME),
				validateInput: (fieldValue: string) => {
					let validationResult = InteractiveAnswersValidator.showValidationResults(
						fieldValue,
						InteractiveAnswersValidator.validateFieldIsNotEmpty,
						InteractiveAnswersValidator.validateAlphanumericHyphenUnderscoreExtended,
					);
					return typeof validationResult === 'string' ? validationResult : null;
				},
			},
		);
	}

	private getFolderChoices(): string[] {
		const projectFolderPath = this.getProjectFolderPath();
		const projectInfoService = new ProjectInfoServive(projectFolderPath);
		const fileSystemService = new FileSystemService();
		const fileCabinetService = new FileCabinetService(path.join(projectFolderPath, ApplicationConstants.FOLDERS.FILE_CABINET));

		const getAllowedPath = function(): string {
			if (projectInfoService.isAccountCustomizationProject()) {
				return SUITESCRIPTS_PATH;
			} else {
				const applicationId = projectInfoService.getApplicationId();
				const applicationSuiteAppFolderAbsolutePath = path.join(projectFolderPath, ApplicationConstants.FOLDERS.FILE_CABINET, SUITEAPPS_PATH, '/', applicationId, '/');
				return fileCabinetService.getFileCabinetRelativePath(applicationSuiteAppFolderAbsolutePath);
			}
		};

		const isFolderNotRestricted = function(folderRelativePath: string): boolean {
			return folderRelativePath.startsWith(getAllowedPath());
		};

		const getRelativePath = function(absolutePath: string): string {
			return fileCabinetService.getFileCabinetRelativePath(absolutePath) + '/';
		};

		const allFolders = fileSystemService.getFoldersFromDirectoryRecursively(path.join(projectFolderPath, ApplicationConstants.FOLDERS.FILE_CABINET));
		return allFolders.map(getRelativePath).filter(isFolderNotRestricted);
	}
}
