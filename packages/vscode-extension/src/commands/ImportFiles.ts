/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as path from 'path';
import { QuickPickItem, window } from 'vscode';
import ListFilesService from '../service/ListFilesService';
import { ANSWERS, IMPORT_FILES, LIST_FILES } from '../service/TranslationKeys';
import { FolderItem } from '../types/FolderItem';
import { actionResultStatus, ApplicationConstants, ProjectInfoService } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';

const COMMAND_NAME = 'importfiles';

export default class ImportFiles extends BaseAction {
	constructor() {
		super(COMMAND_NAME);
	}

	validateBeforeExecute() {
		const superValidation = super.validateBeforeExecute();
		if (!superValidation.valid) {
			return superValidation;
		}

		const projectInfoService = new ProjectInfoService(this.getProjectFolderPath());
		if (projectInfoService.isSuiteAppProject()) {
			return this.unsuccessfulValidation(this.translationService.getMessage(IMPORT_FILES.ERROR.IMPORT_TO_SUITEAPP_NOT_ALLOWED));
		}
		
		return this.successfulValidation();
	}

	protected async execute() {
		if (!this.activeFile || !this.rootWorkspaceFolder) {
			// Already checked in validateBeforeExecute
			return;
		}

		const fileName = path.basename(this.activeFile, '.xml');
		let selectedFilesPaths: string[] | undefined;
		try {
			if (this.isSelectedFromContextMenu) {
				// this.activeFile value depends on:
				// explorer/content suitecloud.importfile when condition defined in the package.json
				// should be on /FileCabinet... and a file
				const pathToFileCabinetFolder = path.join(this.getProjectFolderPath(), ApplicationConstants.FOLDERS.FILE_CABINET);
				const filePath = this.activeFile.split(pathToFileCabinetFolder)[1]?.replace(/\\/g, '/');
				selectedFilesPaths = [filePath];
			}
			if (!selectedFilesPaths) {
				selectedFilesPaths = await this.getSelectedFiles();
			}
		} catch (error) {
			this.vsConsoleLogger.error(error);
			this.messageService.showCommandError();
		}

		if (!selectedFilesPaths) {
			return;
		}

		const excludeProperties = await window.showQuickPick(
			[this.translationService.getMessage(ANSWERS.YES), this.translationService.getMessage(ANSWERS.NO)],
			{
				placeHolder: this.translationService.getMessage(IMPORT_FILES.QUESTIONS.EXCLUDE_PROPERTIES, fileName),
				canPickMany: false,
			}
		);
		if (!excludeProperties) {
			return;
		}

		const override = await window.showQuickPick(
			[this.translationService.getMessage(ANSWERS.YES), this.translationService.getMessage(ANSWERS.NO)],
			{
				placeHolder:
					selectedFilesPaths.length > 1
						? this.translationService.getMessage(IMPORT_FILES.QUESTIONS.OVERRIDE)
						: this.translationService.getMessage(IMPORT_FILES.QUESTIONS.OVERRIDE_SINGLE, selectedFilesPaths[0]),
				canPickMany: false,
			}
		);

		if (!override || override === this.translationService.getMessage(ANSWERS.NO)) {
			this.messageService.showInformationMessage(this.translationService.getMessage(IMPORT_FILES.PROCESS_CANCELED));
			return;
		}

		const commandArgs = {
			paths: selectedFilesPaths,
			...(excludeProperties === this.translationService.getMessage(ANSWERS.YES) && { excludeProperties: 'true' }),
		};

		const commandActionPromise = this.runSuiteCloudCommand(commandArgs);
		this.messageService.showStatusBarMessage(this.translationService.getMessage(IMPORT_FILES.IMPORTING_FILE), true, commandActionPromise);
		const actionResult = await commandActionPromise;

		this.showOutput(actionResult);
	}

	private async getSelectedFiles(): Promise<string[] | undefined> {
		const listFilesService = new ListFilesService(this.messageService, this.translationService, this.rootWorkspaceFolder);
		const fileCabinetFolders: FolderItem[] | undefined = await listFilesService.getAccountFileCabinetFolders();
		if (!fileCabinetFolders) {
			return;
		}
		const selectedFolder: QuickPickItem | undefined = await listFilesService.selectFolder(fileCabinetFolders);
		if (!selectedFolder) {
			return;
		}
		const files = await listFilesService.getFilesFromSelectedAccountFileCabinetFolder(selectedFolder.label);
		if (!files || files.length === 0) {
			throw this.translationService.getMessage(LIST_FILES.ERROR.NO_FILES_FOUND);
		}
		const selectedFiles: QuickPickItem[] | undefined = await listFilesService.selectFiles(files);

		if (!selectedFiles) {
			return;
		}
		return selectedFiles.map((file) => file.label.replace(/\\/g, '/'));
	}

	private showOutput(actionResult: any) {
		if (actionResult.status === actionResultStatus.SUCCESS && actionResult.data) {
			this.messageService.showCommandInfo(this.translationService.getMessage(IMPORT_FILES.FINISHED));
		} else {
			this.messageService.showCommandError();
		}
	}
}
