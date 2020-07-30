/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as path from 'path';
import { window } from 'vscode';
import { ERRORS, YES, NO, UPDATE_OBJECT } from '../service/TranslationKeys';
import { STATUS } from '@oracle/suitecloud-cli/dist/services/actionresult/ActionResult';
import BaseAction from './BaseAction';

const COMMAND_NAME = 'object:update';
const PARTIAL_STATUS = {
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

		const statusBarMessage = this.translationService.getMessage(UPDATE_OBJECT.UPDATING);

		const commandActionPromise = this.runSuiteCloudCommand({ scriptid: scriptId });
		this.messageService.showStatusBarMessage(statusBarMessage, true, commandActionPromise);

		const actionResult = await commandActionPromise;
		if (actionResult.status === STATUS.SUCCESS && actionResult.data.length === 1 && actionResult.data[0].type === PARTIAL_STATUS.SUCCESS) {
			this.messageService.showInformationMessage(this.translationService.getMessage(UPDATE_OBJECT.SUCCESS));
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
