/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as path from 'path';
import { window } from 'vscode';
import SuiteCloudRunner from '../core/SuiteCloudRunner';
import MessageService from '../service/MessageService';
import { COMMAND, UPLOAD_FILE, YES, NO } from '../service/TranslationKeys';
import { actionResultStatus, CLIConfigurationService, ApplicationConstants, getRootProjectFolder } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';

export default class UploadFile extends BaseAction {
	readonly commandName: string = 'file:upload';

	async execute(opts: { suiteCloudRunner: SuiteCloudRunner; messageService: MessageService }) {
		const activeFile = window.activeTextEditor?.document.uri;
		const workspaceFolder = getRootProjectFolder();
		if (!activeFile) {
			// Already checked in ActionExecutor
			return;
		}
		if (!workspaceFolder) {
			// Already checked in ActionExecutor
			return;
		}

		const cliConfigurationService = new CLIConfigurationService();
		cliConfigurationService.initialize(workspaceFolder);
		const projectFolder = cliConfigurationService.getProjectFolder(this.commandName);

		const fileCabinetFolder = path.join(projectFolder, ApplicationConstants.FOLDERS.FILE_CABINET);
		const relativePath = activeFile.fsPath.replace(fileCabinetFolder, '');

		const override = await window.showQuickPick([YES, NO], {
			placeHolder: this.translationService.getMessage(UPLOAD_FILE.OVERWRITE_QUESTION, relativePath),
			canPickMany: false,
		});

		if (!override || override === NO) {
			opts.messageService.showInformationMessage(this.translationService.getMessage(UPLOAD_FILE.PROCESS_CANCELED));
			return;
		}

		const commandMessage = this.translationService.getMessage(COMMAND.TRIGGERED, this.translationService.getMessage(UPLOAD_FILE.COMMAND));
		const statusBarMessage = this.translationService.getMessage(UPLOAD_FILE.UPLOADING);

		const commandActionPromise = opts.suiteCloudRunner.run({
			commandName: this.commandName,
			arguments: {
				paths: relativePath,
			},
		});
		opts.messageService.showInformationMessage(commandMessage, statusBarMessage, commandActionPromise);

		const actionResult = await commandActionPromise;
		if (actionResult.status === actionResultStatus.SUCCESS) {
			opts.messageService.showCommandInfo();
		} else {
			opts.messageService.showCommandError();
		}
		return;
	}
}
