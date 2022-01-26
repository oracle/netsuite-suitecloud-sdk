/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import { COMMAND, LIST_FILES } from '../service/TranslationKeys';
import { actionResultStatus } from '../util/ExtensionUtil';

import BaseAction from './BaseAction';
import ListFilesService from '../service/ListFilesService';

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
		const listFilesService = new ListFilesService(this.messageService, this.translationService, this.rootWorkspaceFolder);
		try {
			let fileCabinetFolders: string[] | undefined = await listFilesService.getAccountFileCabinetFolders();
			if (!fileCabinetFolders) {
				return;
			}
			if (fileCabinetFolders.length === 0) {
				throw this.translationService.getMessage(LIST_FILES.ERROR.NO_FOLDERS_FOUND);
			}
			const selectedFolder = await listFilesService.selectFolder(
				fileCabinetFolders,
				this.translationService.getMessage(LIST_FILES.SELECT_FOLDER)
			);
			if (selectedFolder) {
				await this._listFiles(selectedFolder.label);
			}
		} catch (e: any) {
			this.vsConsoleLogger.error(e);
			this.messageService.showCommandError();
		}
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
