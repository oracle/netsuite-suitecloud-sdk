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

export default class ListFiles extends BaseAction {
	constructor() {
		super(COMMAND_NAME);
	}

	protected async execute() {
		const fileCabinetFolders = await FolderUtils.getFileCabinetFolders(this.executionPath, COMMAND_NAME);

		const selectedFolder = await window.showQuickPick(
			fileCabinetFolders.map((folder: FolderType) => folder.value),
			{
				ignoreFocusOut: true,
				placeHolder: this.translationService.getMessage(LIST_FILES.SELECT_FOLDER),
				canPickMany: false,
			}
		);

		if (selectedFolder === undefined) {
			return;
		}

		const commandActionPromise = this.runSuiteCloudCommand({ folder: selectedFolder });
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
