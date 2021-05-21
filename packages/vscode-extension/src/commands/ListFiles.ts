/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import { window, QuickPickItem } from 'vscode';
import { COMMAND, LIST_FILES } from '../service/TranslationKeys';
import { actionResultStatus, AccountFileCabinetService, ExecutionEnvironmentContext } from '../util/ExtensionUtil';

import BaseAction from './BaseAction';
import { FolderItem } from '../types/FolderItem';
import { getSdkPath } from '../core/sdksetup/SdkProperties';
import * as vscode from 'vscode';
import { VSCODE_PLATFORM } from '../ApplicationConstants';
import ListFilesService from '../service/ListFilesService';

const COMMAND_NAME = 'listfiles';

const LIST_FILES_COMMAND = {
	OPTIONS: {
		FOLDER: 'folder',
	},
};

export default class ListFiles extends BaseAction {

	private listFilesService: ListFilesService;

	constructor() {
		super(COMMAND_NAME);
		this.listFilesService = new ListFilesService(this.messageService, this.translationService);
	}

	protected async execute(): Promise<void> {
		try {
			let fileCabinetFolders: FolderItem[] = await this._getListFolders();
			fileCabinetFolders = this.sortFolders(fileCabinetFolders);
			const selectedFolder = await this._selectFolder(fileCabinetFolders);
			if (selectedFolder) {
				await this._listFiles(selectedFolder.label);
			}
		} catch (e) {
			this.vsConsoleLogger.error(e);
			this.messageService.showCommandError();
		}
	}

	private sortFolders(fileCabinetFolders: FolderItem[]) {
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

	protected async _getListFolders() {
		const executionEnvironmentContext = new ExecutionEnvironmentContext({
			platform: VSCODE_PLATFORM,
			platformVersion: vscode.version,
		});

		const listFoldersPromise = AccountFileCabinetService.getFileCabinetFolders(
			getSdkPath(),
			executionEnvironmentContext,
			this.executionPath,
			COMMAND_NAME
		);
		const statusBarMessage = this.translationService.getMessage(LIST_FILES.LOADING_FOLDERS);
		this.messageService.showStatusBarMessage(statusBarMessage, listFoldersPromise);

		return listFoldersPromise;
	}

	protected async _selectFolder(folders: FolderItem[]): Promise<QuickPickItem | undefined> {
		return window.showQuickPick(
			folders.map((folder: FolderItem) => {
				const description = folder.isRestricted ? this.translationService.getMessage(LIST_FILES.RESTRICTED_FOLDER) : '';
				return { label: folder.path, description };
			}),
			{
				ignoreFocusOut: true,
				placeHolder: this.translationService.getMessage(LIST_FILES.SELECT_FOLDER),
				canPickMany: false,
			}
		);
	}

	private async _listFiles(selectedFolder: string) {
		const listfilesOptions: { [key: string]: string } = {};
		listfilesOptions[LIST_FILES_COMMAND.OPTIONS.FOLDER] = selectedFolder;

		const commandActionPromise = this.runSuiteCloudCommand(listfilesOptions);
		const commandMessage = this.translationService.getMessage(COMMAND.TRIGGERED, this.vscodeCommandName);
		const statusBarMessage = this.translationService.getMessage(LIST_FILES.LISTING);
		this.messageService.showInformationMessage(commandMessage, statusBarMessage, commandActionPromise);

		const actionResult = await commandActionPromise;
		if (actionResult.status === actionResultStatus.SUCCESS) {
			this.messageService.showCommandInfo();
		} else {
			this.messageService.showCommandError();
		}
	}
}
