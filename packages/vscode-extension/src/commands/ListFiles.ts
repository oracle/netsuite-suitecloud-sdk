/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import { window } from 'vscode';
import { COMMAND, LIST_FILES } from '../service/TranslationKeys';
import { actionResultStatus, FolderUtils } from '../util/ExtensionUtil';

import BaseAction from './BaseAction';
import { FolderType } from './FolderType';

const COMMAND_NAME = 'listfiles';

const LIST_FILES_COMMAND = {
	OPTIONS: {
		FOLDER: 'folder',
	},
};

export default class ListFiles extends BaseAction {
	constructor() {
		super(COMMAND_NAME);
	}

	protected async execute(): Promise<void> {
		const fileCabinetFolders = await this._getListFolders();
		const filteredFolders = this.filterDisabledFolders(fileCabinetFolders);
		if (filteredFolders === undefined) {
			return;
		}

		const selectedFolder = await this._selectFolder(filteredFolders);

		if (selectedFolder === undefined) {
			return;
		}

		await this._listFiles(selectedFolder);
	}

	protected async _getListFolders() {
		const listFoldersPromise = FolderUtils.getFileCabinetFolders(this.executionPath, COMMAND_NAME);
		const statusBarMessage = this.translationService.getMessage(LIST_FILES.LOADING_FOLDERS);
		this.messageService.showStatusBarMessage(statusBarMessage, listFoldersPromise);

		return listFoldersPromise;
	}

	private filterDisabledFolders(fileCabinetFolders: any) {
		return fileCabinetFolders.filter((folder: FolderType) => folder.disabled === '');
	}

	// protected async _selectFolder(filteredFolders: { map: (key: (folder: FolderType) => string | undefined) => string[] }): Promise<string | undefined> {
	protected async _selectFolder(filteredFolders: {
		map: (arg0: (folder: FolderType) => string | undefined) => string[];
	}): Promise<string | undefined> {
		return window.showQuickPick(
			filteredFolders.map((folder: FolderType) => folder.value),
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
