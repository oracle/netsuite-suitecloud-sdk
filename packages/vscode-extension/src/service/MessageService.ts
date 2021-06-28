/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { window } from 'vscode';
import { output } from '../suitecloud';
import { COMMAND, SEE_DETAILS } from './TranslationKeys';
import { VSTranslationService } from './VSTranslationService';

const DEFAULT_TIMEOUT = 5000;

export default class MessageService {
	private vscodeCommandName?: string;
	private readonly translationService = new VSTranslationService();
	private _executionPath?: string;

	constructor(commandName?: string) {
		this.vscodeCommandName = commandName;
	}

	set executionPath(excutionPath: string|undefined) {
		this._executionPath = excutionPath;
	}

	private addProjectNameToMessage(message: string): string {
		if (this._executionPath) {
			const executionPathParts = this._executionPath.replace(/\\/g, "/").split("/")
			const projectFolderName: string = executionPathParts[executionPathParts.length - 1];
			// window.showInformationMessage removes new line characters do not try to add them here
			message = `${projectFolderName}: ${message}`
		}
		return message;
	}

	showInformationMessage(infoMessage: string, statusBarMessage?: string, promise?: Promise<any>, spin = true) {
		window.showInformationMessage(this.addProjectNameToMessage(infoMessage));

		if (statusBarMessage && promise) {
			this.showStatusBarMessage(statusBarMessage, spin, promise);
		}
	}

	showWarningMessage(infoMessage: string) {
		window.showWarningMessage(this.addProjectNameToMessage(infoMessage));
	}

	showErrorMessage(errorMessage: string) {
		window.showErrorMessage(this.addProjectNameToMessage(errorMessage));
	}

	showStatusBarMessage(message: string, spin?: boolean, promise?: Promise<any>) {
		const messageToShow = spin ? `$(sync~spin) ${message}` : message;
		if (!promise) {
			window.setStatusBarMessage(messageToShow, DEFAULT_TIMEOUT);
		}
		else {
			window.setStatusBarMessage(messageToShow, promise);
		}
	}

	showCommandInfo(successMessage?: string) {
		if (!this.vscodeCommandName) throw 'Command not defined';
		const message = successMessage ? successMessage : this.translationService.getMessage(COMMAND.SUCCESS, this.vscodeCommandName);
		window.showInformationMessage(this.addProjectNameToMessage(message), this.translationService.getMessage(SEE_DETAILS)).then(this.showOutputIfClicked);
	}

	showCommandError(errorMessage?: string) {
		if (!this.vscodeCommandName) throw 'Command not defined';
		const message = errorMessage ? errorMessage : this.translationService.getMessage(COMMAND.ERROR, this.vscodeCommandName);
		window.showErrorMessage(this.addProjectNameToMessage(message), this.translationService.getMessage(SEE_DETAILS)).then(this.showOutputIfClicked);
	}

	private showOutputIfClicked(message?: string) {
		if (message) {
			output.show();
		}
	}
}
