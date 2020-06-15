/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { window } from 'vscode';
import { Output } from '../suitecloud';
import { COMMAND, SEE_DETAILS } from './TranslationKeys';
import { VSTranslationService } from './VSTranslationService';

const DEFAULT_TIMEOUT = 5000;

export default class MessageService {
	private commandName?: string;
	private readonly translationService = new VSTranslationService();

	constructor(commandName?: string) {
		this.commandName = commandName;
	}

	showInformationMessage(infoMessage: string, statusBarMessage?: string, promise?: Promise<any>, spin = true) {
		window.showInformationMessage(infoMessage);

		if (statusBarMessage && promise) {
			this.showStatusBarMessage(statusBarMessage, spin, promise);
		}
	}

	showWarningMessage(infoMessage: string) {
		window.showWarningMessage(infoMessage);
	}

	showErrorMessage(errorMessage: string) {
		window.showErrorMessage(errorMessage);
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
