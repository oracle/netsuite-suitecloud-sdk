/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as path from 'path';
import * as vscode from 'vscode';
import { VSCODE_PLATFORM } from '../ApplicationConstants';
import { getSdkPath } from '../core/sdksetup/SdkProperties';
import { AccountFileCabinetService, actionResultStatus, AuthenticationUtils, ExecutionEnvironmentContext } from '../util/ExtensionUtil';
import MessageService from './MessageService';
import { IMPORT_FILES, LIST_FILES } from './TranslationKeys';
import { VSTranslationService } from './VSTranslationService';
import { showSetupAccountWarningMessage } from '../startup/ShowSetupAccountWarning';

export default class ListFilesService {
	private readonly translationService: VSTranslationService;
	private rootProjectFolder?: string;
	private readonly messageService: MessageService;
	private readonly executionEnvironmentContext = new ExecutionEnvironmentContext({
		platform: VSCODE_PLATFORM,
		platformVersion: vscode.version,
	});

	constructor(messageService: MessageService, translationService: VSTranslationService, rootProjectFolder: string | undefined) {
		this.messageService = messageService;
		this.translationService = translationService;
		this.rootProjectFolder = rootProjectFolder;
	}

	public async getAccountFileCabinetFolders(): Promise<string[] | undefined> {
		const defaultAuthId = this.getDefaultAuthId();
		if (!defaultAuthId) {
			showSetupAccountWarningMessage();
			return;
		}

		const accountFileCabinetService = new AccountFileCabinetService(getSdkPath(), this.executionEnvironmentContext, defaultAuthId);
		const listFoldersPromise = accountFileCabinetService.getAccountFileCabinetFolders();
		const statusBarMessage = this.translationService.getMessage(LIST_FILES.LOADING_FOLDERS);
		this.messageService.showStatusBarMessage(statusBarMessage, true, listFoldersPromise);

		return await listFoldersPromise;
	}

	public async selectFolder(folderPaths: string[], placeHolderMessage: string): Promise<vscode.QuickPickItem | undefined> {
		return vscode.window.showQuickPick(
			folderPaths.map((folderPath: string) => {
				return { label: folderPath, description: '', detail: path.basename(folderPath) };
			}),
			{
				ignoreFocusOut: true,
				placeHolder: placeHolderMessage,
				canPickMany: false,
				onDidSelectItem: (item: vscode.QuickPickItem) => vscode.window.setStatusBarMessage(item.label, 5000),
			}
		);
	}

	public async selectFiles(files: string[]): Promise<vscode.QuickPickItem[] | undefined> {
		let finish: boolean = false;
		let message = this.translationService.getMessage(IMPORT_FILES.QUESTIONS.SELECT_FILES);
		const filesChoices = files.map((file) => ({ label: file, detail: path.basename(file) }));
		while (!finish) {
			const selectedFiles = await vscode.window.showQuickPick(filesChoices, {
				ignoreFocusOut: true,
				placeHolder: message,
				canPickMany: true,
				onDidSelectItem: (item: vscode.QuickPickItem) => vscode.window.setStatusBarMessage(item.label, 5000),
			});
			if (!selectedFiles || selectedFiles.length > 0) {
				finish = true;
				return selectedFiles;
			}
			message = this.translationService.getMessage(IMPORT_FILES.QUESTIONS.CHOOSE_OPTION);
		}

		return;
	}

	public async getFilesFromSelectedAccountFileCabinetFolder(selectedFolder: string) {
		const defaultAuthId = this.getDefaultAuthId();
		if (!defaultAuthId) {
			showSetupAccountWarningMessage();
			return;
		}

		const accountFileCabinetService = new AccountFileCabinetService(getSdkPath(), this.executionEnvironmentContext, defaultAuthId);
		const listFilesPromise = accountFileCabinetService.listFiles(selectedFolder);
		const statusBarMessage = this.translationService.getMessage(LIST_FILES.LISTING);
		this.messageService.showStatusBarMessage(statusBarMessage, true, listFilesPromise);

		const actionResult = await listFilesPromise;
		if (actionResult.status === actionResultStatus.SUCCESS) {
			return actionResult.data;
		} else {
			throw actionResult.errorMessages;
		}
	}

	private getDefaultAuthId(): string | undefined {
		let defaultAuthId: string | undefined;
		try {
			defaultAuthId = AuthenticationUtils.getProjectDefaultAuthId(this.rootProjectFolder);
		} catch (error) {
			defaultAuthId = undefined;
		}

		return defaultAuthId;
	}
}
