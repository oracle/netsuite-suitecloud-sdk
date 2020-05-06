/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { window } from 'vscode';
import { Output } from '../extension';
import { COMMAND, SEE_DETAILS } from './TranslationKeys';
import { VSTranslationService } from './VSTranslationService';

export default class MessageService {
	private commandName?: string;
	private readonly translationService = new VSTranslationService();

	constructor() {}

	forCommand(commandName: string) {
		this.commandName = commandName;
		return this;
	}

	showInformationMessage(infoMessage: string, promise?: Promise<any>, statusBarMessage?: string) {
		window.showInformationMessage(infoMessage);

		if (statusBarMessage && promise) {
			this.showStatusBarMessage(statusBarMessage, promise);
		}
	}

	showWarningMessage(infoMessage: string) {
		window.showWarningMessage(infoMessage);
	}

	showErrorMessage(errorMessage: string) {
		window.showErrorMessage(errorMessage);
	}

	showStatusBarMessage(message: string, promise: Promise<any>) {
		window.setStatusBarMessage(message, promise);
	}

	showCommandInfo(successMessage?: string) {
		if (!this.commandName) throw 'Command not defined';
		const message = successMessage ? successMessage : this.translationService.getMessage(COMMAND.SUCCESS, this.commandName);
		window.showInformationMessage(message, this.translationService.getMessage(SEE_DETAILS)).then(this.showOutputIfClicked);
	}

	showCommandError(errorMessage?: string) {
		if (!this.commandName) throw 'Command not defined';
		const message = errorMessage ? errorMessage : this.translationService.getMessage(COMMAND.ERROR, this.commandName);
		window.showErrorMessage(message, this.translationService.getMessage(SEE_DETAILS)).then(this.showOutputIfClicked);
	}

	private showOutputIfClicked(message?: string) {
		if (message) {
			Output.show();
		}
	}
}
