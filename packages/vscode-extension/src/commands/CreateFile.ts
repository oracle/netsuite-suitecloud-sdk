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

	protected async execute() {
		const activeFile = window.activeTextEditor?.document.uri;
		if (!activeFile) {
			// Already checked in validate
			return;
		}

		const cliConfigurationService = new CLIConfigurationService();
		cliConfigurationService.initialize(this.executionPath);

		const scriptType = await window.showQuickPick(SUITESCRIPT_TYPES.map((scriptType: { name: string; }) => scriptType.name),
			{
				placeHolder: this.translationService.getMessage(CREATE_FILE.QUESTIONS.CHOOSE_SUITESCRIPT_TYPE),
				canPickMany: false,
			},
		);

		const yes = this.translationService.getMessage(ANSWERS.YES);
		const no = this.translationService.getMessage(ANSWERS.NO);

		const answerAddModules = await window.showQuickPick([yes, no],
			{
				placeHolder: this.translationService.getMessage(CREATE_FILE.QUESTIONS.ADD_SUITESCRIPT_MODULES),
				canPickMany: false,
			},
		);

		let modules: string[] | undefined = [];
		if (answerAddModules === yes) {
			modules = await window.showQuickPick(SUITESCRIPT_MODULES.map((module: { id: string; }) => module.id),
				{
					placeHolder: this.translationService.getMessage(CREATE_FILE.QUESTIONS.SELECT_SUITESCRIPT_MODULES),
					canPickMany: true,
				},
			);
		}

		const selectedFolder = await window.showQuickPick(this._getFolderChoices(),
			{
				placeHolder: this.translationService.getMessage(CREATE_FILE.QUESTIONS.SELECT_FOLDER),
				canPickMany: false,
			},
		);

		const fileName = await window.showInputBox(
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

		const args: { [k: string]: string } = {
			'type': scriptType ? SUITESCRIPT_TYPES.find((type: { name: string; }) => type.name === scriptType).id : '',
			'project': this.getProjectFolderPath(),
		};
		if (modules) {
			args.modules = modules?.join(' ');
		}
		if (selectedFolder && fileName) {
			args.path = selectedFolder + fileName;
		}

		const actionResult = await this.runSuiteCloudCommand(args);

		if (actionResult.isSuccess()) {
			const setting: Uri = Uri.file(actionResult.data.path);
			workspace.openTextDocument(setting).then((a: TextDocument) => {
				window.showTextDocument(a);
			}, (error: any) => {
				console.error(error);
				debugger;
			});
		}

	}

	_getFolderChoices() {
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

		const allowedPath = getAllowedPath();

		const isFolderNotRestricted = function(folderRelativePath: string): boolean {
			return folderRelativePath.startsWith(allowedPath);
		};

		const getRelativePath = function(absolutePath: string): string {
			return fileCabinetService.getFileCabinetRelativePath(absolutePath) + '/';
		};

		const allFolders = fileSystemService.getFoldersFromDirectoryRecursively(path.join(projectFolderPath, ApplicationConstants.FOLDERS.FILE_CABINET));
		return allFolders.map(getRelativePath).filter(isFolderNotRestricted);
	}
}