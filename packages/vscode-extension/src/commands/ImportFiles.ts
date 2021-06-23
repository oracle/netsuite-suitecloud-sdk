/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as path from 'path';
import { QuickPickItem, window } from 'vscode';
import ImportFileService from '../service/ImportFileService';
import ListFilesService from '../service/ListFilesService';
import { ANSWERS, ERRORS, IMPORT_FILES } from '../service/TranslationKeys';
import { FolderItem } from '../types/FolderItem';
import { actionResultStatus } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';

const COMMAND_NAME = 'importfiles';

export default class ImportFiles extends BaseAction {
	private importFileService: ImportFileService;
	private listFilesService: ListFilesService;

	constructor() {
		super(COMMAND_NAME);
		this.importFileService = new ImportFileService(this.messageService);
		this.listFilesService = new ListFilesService(this.messageService, this.translationService);
	}

	protected init(fsPath?: string) {
		super.init(fsPath);
		this.importFileService.setVsConsoleLogger(this.vsConsoleLogger);
		this.listFilesService.setVsConsoleLogger(this.vsConsoleLogger);
	}

	protected async execute() {
		if (!this.activeFile) {
			// Already checked in validate
			return;
		}

		const fileName = path.basename(this.activeFile, '.xml');
		let selectedFilesPaths: string[] | undefined;
		try {
			selectedFilesPaths = await this.getSelectedFiles();
		} catch(e) {
			this.messageService.showErrorMessage(e);
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

		const destinationFolder = this.executionPath ? this.getProjectFolderPath() : path.dirname(this.activeFile);

		const statusBarMessage = this.translationService.getMessage(IMPORT_FILES.IMPORTING_FILE);
		const actionResult = await this.importFileService.importFiles(
			selectedFilesPaths,
			destinationFolder,
			statusBarMessage,
			this.executionPath,
			excludeProperties === this.translationService.getMessage(ANSWERS.YES)
		);

		this.showOutput(actionResult);
	}

	private async getSelectedFiles(): Promise<string[] | undefined> {
		if (!this.isFileSelected) {
			const fileCabinetFolders: FolderItem[] = await this.listFilesService.getListFolders();
			const selectedFolder: QuickPickItem | undefined = await this.listFilesService.selectFolder(fileCabinetFolders);
			if (!selectedFolder) {
				return;
			}
			const files = await this.listFilesService.listFiles(selectedFolder.label);
			if (!files || files.length === 0) {
				throw Error('Empty folder');
			}
			const selectedFiles: QuickPickItem[] | undefined = await this.listFilesService.selectFiles(files);

			if (!selectedFiles) {
				this.messageService.showInformationMessage(this.translationService.getMessage(IMPORT_FILES.PROCESS_CANCELED));
				return;
			}
			return selectedFiles.map((file) => file.label.replace(/\\/g, '/'));
		} else {
			if (this.activeFile) {
				const filePath = this.executionPath
					? this.activeFile.split(this.getProjectFolderPath() + '\\FileCabinet')[1].replace(/\\/g, '/')
					: this.activeFile;
				return [filePath];
			}
			return;
		}
	}

	private showOutput(actionResult: any) {
		if (actionResult.status === actionResultStatus.SUCCESS && actionResult.data) {
			this.messageService.showCommandInfo(this.translationService.getMessage(IMPORT_FILES.FINISHED));
		} else {
			this.messageService.showCommandError();
		}
	}

	protected validate(): { valid: false; message: string } | { valid: true } {
		if (!this.activeFile) {
			return {
				valid: false,
				message: this.translationService.getMessage(ERRORS.NO_ACTIVE_FILE),
			};
		} else if (!this.executionPath) {
			return {
				valid: false,
				message: this.translationService.getMessage(ERRORS.NO_ACTIVE_WORKSPACE),
			};
		} else {
			return {
				valid: true,
			};
		}
	}
}
