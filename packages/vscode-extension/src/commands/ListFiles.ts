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
			let fileCabinetFolders = await this.listFilesService.getListFolders(COMMAND_NAME);
			const selectedFolder = await this._selectFolder(fileCabinetFolders);
			if (selectedFolder) {
				await this._listFiles(selectedFolder.label);
			}
		} catch (e) {
			this.vsConsoleLogger.error(e);
			this.messageService.showCommandError();
		}
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
