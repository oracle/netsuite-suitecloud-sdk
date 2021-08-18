import BaseAction from './BaseAction';
import { TextDocument, Uri, window, workspace, QuickPickItem } from 'vscode';
import * as fs from 'fs';
import { COMMAND, CREATE_FILE } from '../service/TranslationKeys';
import {
	ApplicationConstants,
	FileCabinetService,
	FileSystemService,
	InteractiveAnswersValidator,
	ProjectInfoService,
	SUITESCRIPT_TYPES,
	SUITESCRIPT_MODULES,
} from '../util/ExtensionUtil';
import * as path from 'path';
import { FOLDERS } from '../ApplicationConstants';
import { ValidationResult } from '../types/ActionResult';

interface SuiteScriptTypeItem extends QuickPickItem {
	id: string;
	name: string;
}

const COMMAND_NAME = 'createfile';

export default class CreateFile extends BaseAction {
	constructor() {
		super(COMMAND_NAME);
	}

	protected validateBeforeExecute(): ValidationResult {
		const superValidation = super.validateBeforeExecute();
		if (!superValidation.valid) {
			return superValidation;
		}

		const validFolderChoices = this.getValidFolderChoices();
		if (validFolderChoices.length === 0) {
			return this.unsuccessfulValidation(
				this.translationService.getMessage(
					CREATE_FILE.ERRORS.MISSING_VALID_FOLDER_FOR_SUITECRIPT_FILE,
					this.vscodeCommandName,
					ApplicationConstants.LINKS.INFO.PROJECT_STRUCTURE
				)
			);
		}

		return this.successfulValidation();
	}

	protected async execute(): Promise<void> {
		const commandArgs = await this.getCommandArgs();
		if (commandArgs === undefined) {
			return;
		}

		const commandActionPromise = this.runSuiteCloudCommand(commandArgs);
		const commandMessage = this.translationService.getMessage(COMMAND.TRIGGERED, this.vscodeCommandName);
		const statusBarMessage: string = this.translationService.getMessage(CREATE_FILE.MESSAGES.CREATING_FILE);
		this.messageService.showInformationMessage(commandMessage, statusBarMessage, commandActionPromise);

		const actionResult = await commandActionPromise;
		if (actionResult.isSuccess()) {
			const createdFileUri: Uri = Uri.file(actionResult.data.path);
			workspace.openTextDocument(createdFileUri).then(
				(createdFile: TextDocument) => {
					window.showTextDocument(createdFile);
				},
				(error: any) => {
					this.messageService.showCommandError(error);
				}
			);
		} else {
			this.messageService.showCommandError();
		}
	}

	private async getCommandArgs(): Promise<{ [key: string]: string | string[] } | undefined> {
		const args: { [key: string]: string | string[] } = {
			project: this.getProjectFolderPath(),
		};

		const selectedScriptType = await this.promptScriptTypeQuestion();
		if (selectedScriptType === undefined) {
			return;
		} else {
			args.type = selectedScriptType.id;
		}

		const selectedModules = await this.promptAddModulesQuestion();
		if (selectedModules === undefined) {
			return;
		} else if (Array.isArray(selectedModules) && selectedModules.length > 0) {
			args.module = selectedModules;
		}

		const selectedFolder = await this.promptFolderSelection();
		if (selectedFolder === undefined) {
			return;
		}
		const fileName = await this.promptFileNameInputBox(selectedFolder);
		if (fileName === undefined) {
			return;
		}

		args.path = path.join(selectedFolder, fileName);

		return args;
	}

	private promptScriptTypeQuestion(): Thenable<SuiteScriptTypeItem | undefined> {
		return window.showQuickPick(
			SUITESCRIPT_TYPES.map((element) => <SuiteScriptTypeItem>{ label: element.name, id: element.id, name: element.name }),
			{
				placeHolder: this.translationService.getMessage(CREATE_FILE.QUESTIONS.CHOOSE_SUITESCRIPT_TYPE),
				canPickMany: false,
			}
		);
	}

	private async promptAddModulesQuestion(): Promise<string[] | undefined> {
		return window.showQuickPick(
			SUITESCRIPT_MODULES.map((module) => module.id),
			{
				placeHolder: this.translationService.getMessage(CREATE_FILE.QUESTIONS.SELECT_SUITESCRIPT_MODULES),
				canPickMany: true,
			}
		);
	}

	private async promptFolderSelection(): Promise<string | undefined> {
		const validFolderChoices = this.getValidFolderChoices();

		let fileToCheck = this.activeFile;

		// action orignated from context menu
		if (this.isSelectedFromContextMenu && fileToCheck && fs.existsSync(fileToCheck)) {
			const fileCabinetService = new FileCabinetService(path.join(this.getProjectFolderPath(), ApplicationConstants.FOLDERS.FILE_CABINET));
			if (!fs.lstatSync(fileToCheck).isDirectory()) {
				fileToCheck = path.dirname(fileToCheck);
			}
			// filter folderChoices by the selected folder in the treeview
			const filteredFolderChoices = validFolderChoices.filter((folder) =>
				folder.startsWith(fileCabinetService.getFileCabinetRelativePath(fileToCheck))
			);
			// Autoselect folder when no subfolders in the tree
			if (filteredFolderChoices.length === 1) {
				return filteredFolderChoices[0];
			}
			// could be 0 if the selected directory is not in a valid folder, like /SuiteScripts in a SuiteApp
			if (filteredFolderChoices.length > 1) {
				return window.showQuickPick(filteredFolderChoices, {
					placeHolder: this.translationService.getMessage(CREATE_FILE.QUESTIONS.SELECT_FOLDER),
					canPickMany: false,
				});
			}
		}

		// action not originated from context menu or filteredChoices.length === 0
		return window.showQuickPick(validFolderChoices, {
			placeHolder: this.translationService.getMessage(CREATE_FILE.QUESTIONS.SELECT_FOLDER),
			canPickMany: false,
		});
	}

	private promptFileNameInputBox(parentFolder: string): Thenable<string | undefined> {
		const absoluteParentFolder = path.join(this.getProjectFolderPath(), ApplicationConstants.FOLDERS.FILE_CABINET, parentFolder);
		return window.showInputBox({
			ignoreFocusOut: true,
			placeHolder: this.translationService.getMessage(CREATE_FILE.QUESTIONS.ENTER_NAME),
			validateInput: (fieldValue: string) => {
				let validationResult = InteractiveAnswersValidator.showValidationResults(
					fieldValue,
					InteractiveAnswersValidator.validateFieldIsNotEmpty,
					InteractiveAnswersValidator.validateAlphanumericHyphenUnderscoreExtended,
					(filename: string) => InteractiveAnswersValidator.validateSuiteScriptFileDoesNotExist(absoluteParentFolder, filename)
				);
				return typeof validationResult === 'string' ? validationResult : null;
			},
		});
	}

	private getValidFolderChoices(): string[] {
		const projectFolderPath = this.getProjectFolderPath();
		const projectInfoService = new ProjectInfoService(projectFolderPath);
		const fileSystemService = new FileSystemService();
		const fileCabinetService = new FileCabinetService(path.join(projectFolderPath, ApplicationConstants.FOLDERS.FILE_CABINET));

		const getAllowedPath = ((): string => {
			if (projectInfoService.isAccountCustomizationProject()) {
				return FOLDERS.SUITESCRIPTS;
			} else {
				const applicationSuiteAppFolderAbsolutePath = path.join(
					projectFolderPath,
					ApplicationConstants.FOLDERS.FILE_CABINET,
					FOLDERS.SUITEAPPS,
					projectInfoService.getApplicationId()
				);
				return fileCabinetService.getFileCabinetRelativePath(applicationSuiteAppFolderAbsolutePath);
			}
		})();

		const isFolderNotRestricted = (folderRelativePath: string): boolean => folderRelativePath.startsWith(getAllowedPath);
		const getRelativePath = (absolutePath: string): string => fileCabinetService.getFileCabinetRelativePath(absolutePath);

		const allFolders = fileSystemService.getFoldersFromDirectoryRecursively(
			path.join(projectFolderPath, ApplicationConstants.FOLDERS.FILE_CABINET)
		);
		return allFolders.map(getRelativePath).filter(isFolderNotRestricted);
	}
}
