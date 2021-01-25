/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as path from 'path';
import { window } from 'vscode';
import { COMMAND, UPLOAD_FILE, ERRORS, YES, NO } from '../service/TranslationKeys';
import { actionResultStatus, CLIConfigurationService, ApplicationConstants } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';

const COMMAND_NAME = 'uploadfile'

export default class UploadFile extends BaseAction {
	constructor() {
		super(COMMAND_NAME);
	}

	protected async execute() {
		const activeFile = window.activeTextEditor?.document.uri;
		if (!activeFile) {
			// Already checked in validate
			return;
		}

		const cliConfigurationService = new CLIConfigurationService();
		cliConfigurationService.initialize(this.executionPath);
		const projectFolder = cliConfigurationService.getProjectFolder(this.cliCommandName);

		const fileCabinetFolder = path.join(projectFolder, ApplicationConstants.FOLDERS.FILE_CABINET);
		const relativePath = activeFile.fsPath.replace(fileCabinetFolder, '');

		const override = await window.showQuickPick([YES, NO], {
			placeHolder: this.translationService.getMessage(UPLOAD_FILE.OVERWRITE_QUESTION, relativePath),
			canPickMany: false,
		});

		if (!override || override === NO) {
			this.messageService.showInformationMessage(this.translationService.getMessage(UPLOAD_FILE.PROCESS_CANCELED));
			return;
		}

		const commandMessage = this.translationService.getMessage(COMMAND.TRIGGERED, this.vscodeCommandName);
		const statusBarMessage = this.translationService.getMessage(UPLOAD_FILE.UPLOADING);

		const commandActionPromise = this.runSuiteCloudCommand({ paths: relativePath });
		this.messageService.showInformationMessage(commandMessage, statusBarMessage, commandActionPromise);

		const actionResult = await commandActionPromise;
		if (actionResult.status === actionResultStatus.SUCCESS) {
			this.messageService.showCommandInfo();
		} else {
			this.messageService.showCommandError();
		}
		return;
	}

	protected validate(): { valid: false; message: string } | { valid: true } {
		const activeFile = window.activeTextEditor?.document.uri;
		if (!activeFile) {
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
