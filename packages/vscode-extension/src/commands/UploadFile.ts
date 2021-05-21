/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as path from 'path';
import { window } from 'vscode';
import { COMMAND, UPLOAD_FILE, ERRORS, ANSWERS } from '../service/TranslationKeys';
import { ApplicationConstants, CLIConfigurationService, FileCabinetService, ProjectInfoServive, actionResultStatus } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';

const COMMAND_NAME = 'uploadfile';

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

		const relativePath = activeFile.path;
		const fileName = path.basename(activeFile.fsPath, '.xml');

		const continueMessage = this.translationService.getMessage(ANSWERS.CONTINUE);
		const cancelMessage = this.translationService.getMessage(ANSWERS.CANCEL);
		const override = await window.showQuickPick([continueMessage, cancelMessage], {
			placeHolder: this.translationService.getMessage(UPLOAD_FILE.OVERWRITE_QUESTION, fileName),
			canPickMany: false,
		});

		if (!override || override ===  this.translationService.getMessage(ANSWERS.CANCEL)) {
			this.messageService.showInformationMessage(this.translationService.getMessage(UPLOAD_FILE.PROCESS_CANCELED));
			return;
		}

		const commandMessage = this.translationService.getMessage(COMMAND.TRIGGERED, this.vscodeCommandName);
		const statusBarMessage = this.translationService.getMessage(UPLOAD_FILE.UPLOADING);

		const commandActionPromise = this.runSuiteCloudCommand({ paths: [relativePath] });
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
			const projectFolderPath = this.getProjectFolderPath();
			const projectInfoService = new ProjectInfoServive(projectFolderPath);
			try {
				if (projectInfoService.isAccountCustomizationProject() || projectInfoService.isSuiteAppProject()) {
					const fileCabinetService = new FileCabinetService(path.join(projectFolderPath, ApplicationConstants.FOLDERS.FILE_CABINET));
					if (!fileCabinetService.isUnrestrictedPath(fileCabinetService.getFileCabinetRelativePath(activeFile.fsPath))) {
						return {
							valid: false,
							message: this.translationService.getMessage(UPLOAD_FILE.ERROR.UPLOAD_FILE_FOLDER_RESTRICTION),
						};
					}
				}

				return {
					valid: true,
				};
			} catch (e) {
				return {
					valid: false,
					message: e.getErrorMessage(),
				};
			}
		}
	}
}
