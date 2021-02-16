/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as path from 'path';
import { window } from 'vscode';
import { ERRORS, YES, NO, UPDATE_OBJECT, COMMAND } from '../service/TranslationKeys';
import { ProjectInfoServive, actionResultStatus } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';
import { OBJECTS_FOLDER } from '../ApplicationConstants';

const COMMAND_NAME = 'updateobject';
const STATUS = {
	SUCCESS: 'SUCCESS',
	ERROR: 'ERROR',
};

export default class UpdateObject extends BaseAction {
	constructor() {
		super(COMMAND_NAME);
	}

	protected async execute() {
		const activeFile = window.activeTextEditor?.document.uri;
		if (!activeFile) {
			// Already checked in validate
			return;
		}

		const scriptId = path.basename(activeFile.fsPath, '.xml');

		const override = await window.showQuickPick([YES, NO], {
			placeHolder: this.translationService.getMessage(UPDATE_OBJECT.OVERRIDE, scriptId),
			canPickMany: false,
		});

		if (!override || override === NO) {
			this.messageService.showInformationMessage(this.translationService.getMessage(UPDATE_OBJECT.PROCESS_CANCELED));
			return;
		}

		const commandMessage = this.translationService.getMessage(COMMAND.TRIGGERED, this.vscodeCommandName);
		const statusBarMessage = this.translationService.getMessage(UPDATE_OBJECT.UPDATING);
		const commandActionPromise = this.runSuiteCloudCommand({ scriptid: scriptId });
		this.messageService.showInformationMessage(commandMessage, statusBarMessage, commandActionPromise);

		const actionResult = await commandActionPromise;
		if (actionResult.status === actionResultStatus.SUCCESS && actionResult.data.length === 1 && actionResult.data[0].type === STATUS.SUCCESS) {
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
					const relativePath = path.relative(projectFolderPath, activeFile.fsPath);
					if (!relativePath.startsWith(OBJECTS_FOLDER + path.sep)) {
						return {
							valid: false,
							message: this.translationService.getMessage(UPDATE_OBJECT.ERROR.SDF_OBJECT_MUST_BE_IN_OBJECTS_FOLDER),
						}
					}
				}

				return {
					valid: true,
				};
			} catch (e) {
				return {
					valid: false,
					message: e.getErrorMessage(),
				}
			}
		}
	}
}
