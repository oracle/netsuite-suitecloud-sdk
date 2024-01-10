/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as path from 'path';
import { window } from 'vscode';
import { COMMAND, UPLOAD_FILE, ANSWERS } from '../service/TranslationKeys';
import { ApplicationConstants, FileCabinetService, ProjectInfoService, actionResultStatus } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';
import { ValidationResult } from '../types/ActionResult';

const COMMAND_NAME = 'uploadfile';

export default class UploadFile extends BaseAction {
	constructor() {
		super(COMMAND_NAME);
	}

	protected async execute() {
		if (!this.activeFile) {
			// Already checked in validateBeforeExecute
			return;
		}

		const fileCabinetService = new FileCabinetService(path.join(this.getProjectFolderPath(), ApplicationConstants.FOLDERS.FILE_CABINET));
		// fileCabinetService.getFileCabinetRelativePath result already replaces possible '\' for '/'
		// this fact helps to fix https://github.com/oracle/netsuite-suitecloud-sdk/issues/711
		const relativePath = fileCabinetService.getFileCabinetRelativePath(this.activeFile);
		const fileName = path.basename(this.activeFile);

		const continueMessage = this.translationService.getMessage(ANSWERS.CONTINUE);
		const cancelMessage = this.translationService.getMessage(ANSWERS.CANCEL);
		const override = await window.showQuickPick([continueMessage, cancelMessage], {
			placeHolder: this.translationService.getMessage(UPLOAD_FILE.OVERWRITE_QUESTION, fileName),
			canPickMany: false,
		});

		if (!override || override === this.translationService.getMessage(ANSWERS.CANCEL)) {
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

	protected validateBeforeExecute(): ValidationResult {
		const superValidation = super.validateBeforeExecute();
		if (!superValidation.valid) {
			return superValidation;
		}
		const projectFolderPath = this.getProjectFolderPath();
		const projectInfoService = new ProjectInfoService(projectFolderPath);
		try {
			if (projectInfoService.isAccountCustomizationProject() || projectInfoService.isSuiteAppProject()) {
				const fileCabinetService = new FileCabinetService(path.join(projectFolderPath, ApplicationConstants.FOLDERS.FILE_CABINET));
				if (!fileCabinetService.isUnrestrictedPath(fileCabinetService.getFileCabinetRelativePath(this.activeFile))) {
					return this.unsuccessfulValidation(this.translationService.getMessage(UPLOAD_FILE.ERROR.UPLOAD_FILE_FOLDER_RESTRICTION));
				}
			}

			return this.successfulValidation();
		} catch (e: any) {
			return this.unsuccessfulValidation(e.getErrorMessage());
		}
	}
}
