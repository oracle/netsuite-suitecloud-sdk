/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as path from 'path';
import * as vscode from 'vscode';
import { VSCODE_PLATFORM } from '../ApplicationConstants';
import { getSdkPath } from '../core/sdksetup/SdkProperties';
import { FolderItem } from '../types/FolderItem';
import {
	AccountFileCabinetService,
	actionResultStatus,
	AuthenticationUtils,
	ExecutionEnvironmentContext,
} from '../util/ExtensionUtil';
import MessageService from './MessageService';
import { EXTENSION_INSTALLATION, IMPORT_FILES, LIST_FILES } from './TranslationKeys';
import { VSTranslationService } from './VSTranslationService';
import { commandsInfoMap } from '../commandsMap';

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

	public async getAccountFileCabinetFolders(): Promise<FolderItem[] | undefined> {
		const defaultAuthId = this.getDefaultAuthId();
		if (!defaultAuthId) {
			return;
		}

		const accountFileCabinetService = new AccountFileCabinetService(getSdkPath(), this.executionEnvironmentContext, defaultAuthId);
		const listFoldersPromise = accountFileCabinetService.getAccountFileCabinetFolders();
		const statusBarMessage = this.translationService.getMessage(LIST_FILES.LOADING_FOLDERS);
		this.messageService.showStatusBarMessage(statusBarMessage, listFoldersPromise);

		const fileCabinetFolders = await listFoldersPromise;

		return this._sortFolders(fileCabinetFolders);
	}

	private _sortFolders(fileCabinetFolders: FolderItem[]) {
		fileCabinetFolders = fileCabinetFolders.sort((folder1, folder2) => {
			if (folder1.isRestricted && !folder2.isRestricted) {
				return 1;
			}

			if (!folder1.isRestricted && folder2.isRestricted) {
				return -1;
			}

			return 0;
		});
		return fileCabinetFolders;
	}

	public async selectFolder(folders: FolderItem[]): Promise<vscode.QuickPickItem | undefined> {
		return vscode.window.showQuickPick(
			folders.map((folder: FolderItem) => {
				const description = folder.isRestricted ? this.translationService.getMessage(LIST_FILES.RESTRICTED_FOLDER) : '';
				return { label: folder.path, description, detail: path.basename(folder.path) };
			}),
			{
				ignoreFocusOut: true,
				placeHolder: this.translationService.getMessage(LIST_FILES.SELECT_FOLDER),
				canPickMany: false,
				onDidSelectItem: (item: vscode.QuickPickItem) => vscode.window.setStatusBarMessage(item.label, 5000),
			}
		);
	}

	public async selectFiles(files: string[]): Promise<vscode.QuickPickItem[] | undefined> {
		let finish: boolean = false;
		let message = this.translationService.getMessage(LIST_FILES.SELECT_FOLDER);
		while (!finish) {
			const selectedFiles = await vscode.window.showQuickPick(
				files.map((file: string) => {
					const description = file ? this.translationService.getMessage(IMPORT_FILES.QUESTIONS.SELECT_FILES) : '';
					return { label: file, description };
				}),
				{
					ignoreFocusOut: true,
					placeHolder: message,
					canPickMany: true,
				}
			);
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
			return;
		}

		const accountFileCabinetService = new AccountFileCabinetService(getSdkPath(), this.executionEnvironmentContext, defaultAuthId);
		const listFilesPromise = accountFileCabinetService.listFiles(selectedFolder);
		const statusBarMessage = this.translationService.getMessage(LIST_FILES.LISTING);
		this.messageService.showStatusBarMessage(statusBarMessage, listFilesPromise);

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

		if (!defaultAuthId) {
			const runSetupAccountMessage = this.translationService.getMessage(
				EXTENSION_INSTALLATION.PROJECT_STARTUP.BUTTONS.RUN_SUITECLOUD_SETUP_ACCOUNT
			);

			vscode.window
				.showWarningMessage(
					this.translationService.getMessage(EXTENSION_INSTALLATION.PROJECT_STARTUP.MESSAGES.PROJECT_NEEDS_SETUP_ACCOUNT),
					runSetupAccountMessage
				)
				.then((result) => {
					if (result === runSetupAccountMessage) {
						vscode.commands.executeCommand(commandsInfoMap.setupaccount.vscodeCommandId);
					}
				});

			return;
		}

		return defaultAuthId;
	}
}
