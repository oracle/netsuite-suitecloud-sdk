/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { window } from 'vscode';
import { Output } from '../extension';
import { COMMAND, SEE_DETAILS } from './TranslationKeys';
import { VSTranslationService } from './VSTranslationService';

export default class MessageService {
	private commandName: string;
	private translationService: VSTranslationService;

	constructor(commandName: string) {
		this.commandName = commandName;
		this.translationService = new VSTranslationService();
	}

	showTriggeredActionInfo(informationMessage: string, actionPromise?: number, statusBarMessage?: string) {
		window.showInformationMessage(informationMessage);
		if (statusBarMessage && actionPromise) {
			window.setStatusBarMessage(statusBarMessage, actionPromise);
		}
	}

	showCompletedActionInfo(successMessage?: string) {
		const message = successMessage ? successMessage : this.translationService.getMessage(COMMAND.SUCCESS, this.commandName);
		window.showInformationMessage(message, this.translationService.getMessage(SEE_DETAILS)).then(this.showOutputIfClicked);
	}

	showCompletedActionError(errorMessage?: string) {
		const message = errorMessage ? errorMessage : this.translationService.getMessage(COMMAND.ERROR, this.commandName);
		window.showErrorMessage(message, this.translationService.getMessage(SEE_DETAILS)).then(this.showOutputIfClicked);
	}

	showInformationMessage(infoMessage: string) {
		window.showInformationMessage(infoMessage);
	}

	showWarningMessage(infoMessage: string) {
		window.showWarningMessage(infoMessage);
	}

	showErrorMessage(errorMessage?: string) {
		const message = errorMessage ? errorMessage : this.translationService.getMessage(COMMAND.ERROR, this.commandName);
		window.showErrorMessage(message);
	}

	private showOutputIfClicked(message?: string) {
		if (message) {
			Output.show();
		}
	}
}
