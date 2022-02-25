/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as fs from 'fs';
import * as path from 'path';
import { window } from 'vscode';
import VsErrorConsoleLogger from '../loggers/VsErrorConsoleLogger';
import CustomObjectService from '../service/ImportObjectService';
import { ANSWERS, IMPORT_OBJECTS } from '../service/TranslationKeys';
import {
	ApplicationConstants,
	FileSystemService,
	InteractiveAnswersValidator,
	ProjectInfoService,
	actionResultStatus,
	objectTypes,
} from '../util/ExtensionUtil';

const SRC_FOLDER_NAME = 'src';

import BaseAction from './BaseAction';

const COMMAND_NAME = 'importobjects';

export default class ImportObjects extends BaseAction {
	private customObjectService: CustomObjectService;

	constructor() {
		super(COMMAND_NAME);
		this.customObjectService = new CustomObjectService(this.messageService, this.translationService);
	}

	protected async execute() {
		if (!this.activeFile || !this.rootWorkspaceFolder) {
			//already  checked in validate. Should not throw
			throw 'Unexpected error at list objects';
		}
		const projectInfoService = new ProjectInfoService(this.getProjectFolderPath());

		let relativeDestinationFolder;
		if (this.isSelectedFromContextMenu) {
			relativeDestinationFolder = this.getDestinationFolderRelativePathFromContextMenuSelection(this.activeFile);
		} else {
			relativeDestinationFolder = await this.getDestinationFolderRelativePathFromCommandPalette(this.rootWorkspaceFolder);
		}

		if (!relativeDestinationFolder) {
			return;
		}

		let appId: string = '';
		if (projectInfoService.isSuiteAppProject()) {
			const filterAppId = await this.promptFilterAppId();
			if (!filterAppId) {
				return;
			}

			if (filterAppId === this.translationService.getMessage(ANSWERS.YES)) {
				let questionAppId = await this.promptAppId(projectInfoService);
				if (questionAppId === undefined) {
					return;
				}
				appId = questionAppId;
			}
		}

		const selectedObjectTypes = await this.promptObjectTypes();
		if (!selectedObjectTypes) {
			return;
		}

		const scriptIdFilter = await this.promptScriptIdFilter();
		if (scriptIdFilter === undefined) {
			return;
		}

		const listObjectsResult = await this.customObjectService.listObjects(
			appId,
			selectedObjectTypes,
			scriptIdFilter,
			this.rootWorkspaceFolder,
			new VsErrorConsoleLogger(true, this.rootWorkspaceFolder)
		);
		if (listObjectsResult.status !== 'SUCCESS' || !listObjectsResult.data || listObjectsResult.data.length === 0) {
			this.showOutput(listObjectsResult);
			return;
		}

		const selectedScriptIds = await this.promptObjects(listObjectsResult.data);
		if (!selectedScriptIds) {
			return;
		}

		let includeReferencedFiles: string | undefined = this.translationService.getMessage(ANSWERS.NO);
		if (projectInfoService.isAccountCustomizationProject()) {
			includeReferencedFiles = await this.promptIncludeReferencedFiles();
			if (!includeReferencedFiles) {
				return;
			}
		}

		const overwrite = await this.promptOverwrite(includeReferencedFiles);
		if (!overwrite) {
			return;
		}
		if (overwrite === this.translationService.getMessage(ANSWERS.CANCEL)) {
			this.messageService.showInformationMessage(this.translationService.getMessage(IMPORT_OBJECTS.PROCESS_CANCELED));
			return;
		}

		const actionResult = await this.customObjectService.importObjects(
			relativeDestinationFolder,
			appId,
			selectedScriptIds,
			includeReferencedFiles === this.translationService.getMessage(ANSWERS.YES),
			this.rootWorkspaceFolder,
			this.vsConsoleLogger
		);

		this.showOutput(actionResult);
		return actionResult;
	}

	private async getDestinationFolderRelativePathFromCommandPalette(rootWorkspaceFolder: string): Promise<string> {
		let relativeDestinationFolder;
		const fileSystemService = new FileSystemService();
		const objectsFolderAbsolutePaths = fileSystemService.getFoldersFromDirectoryRecursively(
			path.join(rootWorkspaceFolder, SRC_FOLDER_NAME, ApplicationConstants.FOLDERS.OBJECTS)
		);

		if (objectsFolderAbsolutePaths.length > 0) {
			const srcFolderAbsolutePath = path.join(rootWorkspaceFolder, SRC_FOLDER_NAME);
			const transformAbsolutePathsToRelativePathsFunc = (absolutePath: string) =>
				absolutePath.replace(srcFolderAbsolutePath, '').replace(/\\/g, '/');
			const objectsFolderRelativePaths = objectsFolderAbsolutePaths.map(transformAbsolutePathsToRelativePathsFunc);
			objectsFolderRelativePaths.splice(0, 0, ApplicationConstants.FOLDERS.OBJECTS);
			relativeDestinationFolder = await this.promptSelectDestinationFolder(objectsFolderRelativePaths);
		} else {
			relativeDestinationFolder = ApplicationConstants.FOLDERS.OBJECTS;
		}

		return relativeDestinationFolder;
	}

	private async promptSelectDestinationFolder(directories: string[]): Promise<string | undefined> {
		return window.showQuickPick(directories, {
			canPickMany: false,
			placeHolder: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.SELECT_DESTINATION_FOLDER),
		});
	}

	private getDestinationFolderRelativePathFromContextMenuSelection(pathDir: string) {
		const isDirectory = fs.lstatSync(pathDir).isDirectory();
		const directoryName = isDirectory ? pathDir : path.dirname(pathDir);
		return directoryName.split(this.getProjectFolderPath())[1].replace(/\\/gi, '/');
	}

	private async promptFilterAppId() {
		return window.showQuickPick([this.translationService.getMessage(ANSWERS.YES), this.translationService.getMessage(ANSWERS.NO)], {
			placeHolder: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.FILTER_APP_ID),
			canPickMany: false,
		});
	}

	private async promptAppId(projectInfoService: { getApplicationId: () => string }): Promise<string | undefined> {
		const defaultAppId = projectInfoService.getApplicationId();
		let appId = await window.showInputBox({
			ignoreFocusOut: true,
			placeHolder: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.APP_ID, defaultAppId),
			validateInput: (fieldValue) => {
				if (fieldValue === '') {
					return null; //In this case empty field is valid
				}
				let validationResult = InteractiveAnswersValidator.showValidationResults(fieldValue, InteractiveAnswersValidator.validateSuiteApp);
				return typeof validationResult === 'string' ? validationResult : null;
			},
		});
		if (appId === undefined) {
			return;
		}

		if (appId === '') {
			appId = defaultAppId;
		}
		return appId;
	}

	private async promptScriptIdFilter() {
		return window.showInputBox({
			ignoreFocusOut: true,
			placeHolder: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.SCRIPT_ID),
			validateInput: (fieldValue) => {
				if (fieldValue === '') {
					return null; //In this case empty field is valid
				}
				let validationResult = InteractiveAnswersValidator.showValidationResults(fieldValue, InteractiveAnswersValidator.validateScriptId);
				return typeof validationResult === 'string' ? validationResult : null;
			},
		});
	}

	private async promptObjectTypes(): Promise<string[] | undefined> {
		return window.showQuickPick(
			objectTypes.map((objectType) => objectType.value.type),
			{
				placeHolder: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.SELECT_TYPES),
				canPickMany: true,
			}
		);
	}

	private async promptObjects(objectList: any[]): Promise<string[] | undefined> {
		let selectedObjects: string[] | undefined = [];

		while (selectedObjects.length === 0) {
			selectedObjects = await window.showQuickPick(
				objectList.map((object: { scriptId: string }) => object.scriptId),
				{
					placeHolder: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.SELECT_OBJECTS),
					canPickMany: true,
				}
			);
			if (selectedObjects === undefined) {
				return;
			}
		}
		return selectedObjects;
	}

	private async promptIncludeReferencedFiles() {
		return window.showQuickPick([this.translationService.getMessage(ANSWERS.YES), this.translationService.getMessage(ANSWERS.NO)], {
			placeHolder: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.REFERENCED_FILES),
			canPickMany: false,
		});
	}

	private async promptOverwrite(includeReferencedFiles: string) {
		return window.showQuickPick([this.translationService.getMessage(ANSWERS.CONTINUE), this.translationService.getMessage(ANSWERS.CANCEL)], {
			placeHolder:
				includeReferencedFiles === this.translationService.getMessage(ANSWERS.YES)
					? this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.OVERWRITE_WITH_REFERENCED)
					: this.translationService.getMessage(IMPORT_OBJECTS.QUESTIONS.OVERWRITE),
			canPickMany: false,
		});
	}

	private showOutput(actionResult: any) {
		if (actionResult.status === actionResultStatus.SUCCESS && actionResult.data) {
			if (actionResult.data.length === 0) {
				this.messageService.showErrorMessage(this.translationService.getMessage(IMPORT_OBJECTS.ERROR.EMPTY_LIST_SEARCH));
				return;
			}

			const data = actionResult.data;
			if (
				data.successfulImports.length === 0 ||
				(data.successfulImports.length > 0 && (data.failedImports.length > 0 || data.errorImports.length > 0))
			) {
				this.messageService.showCommandWarning();
			} else {
				this.messageService.showCommandInfo();
			}
		} else {
			this.messageService.showCommandError();
		}
	}
}
