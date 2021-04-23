/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import { window, QuickPickItem } from 'vscode';
import { COMMAND, LIST_FILES } from '../service/TranslationKeys';
import { actionResultStatus, AccountFileCabinetService, ExecutionEnvironmentContext } from '../util/ExtensionUtil';

import BaseAction from './BaseAction';
import { FolderType } from './FolderType';
import { getSdkPath } from '../core/sdksetup/SdkProperties';
import * as vscode from 'vscode';
import { VSCODE_PLATFORM } from '../ApplicationConstants';

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
		const selectedFolder = await this._selectFolder(fileCabinetFolders);

		if (selectedFolder === null || selectedFolder === undefined) {
			return;
		}

		await this._listFiles(selectedFolder.label);
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

	protected async _selectFolder(folders: {
		map: (arg0: (folder: FolderType) => QuickPickItem) => QuickPickItem[];
	}): Promise<QuickPickItem | undefined> {
		return window.showQuickPick(
			folders.map((folder: FolderType) => ({ label: folder.value, description: folder.disabled })),
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
