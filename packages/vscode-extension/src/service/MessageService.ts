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

	showTriggeredActionInfo() {
		window.showInformationMessage(this.translationService.getMessage(COMMAND.TRIGGERED, [this.commandName]));
	}

	showTriggeredActionError() {
		window.showErrorMessage(this.translationService.getMessage(COMMAND.ROOT_FOLDER_NOT_FOUND, [this.commandName]));
	}

	showCompletedActionInfo(successMessage?: string) {
		const message = successMessage ? successMessage : this.translationService.getMessage(COMMAND.SUCCESS, [this.commandName]);
		window.showInformationMessage(message, this.translationService.getMessage(SEE_DETAILS)).then(this.showOutputIfClicked);
	}

	showCompletedActionError(errorMessage?: string) {
		const message = errorMessage ? errorMessage : this.translationService.getMessage(COMMAND.ERROR, [this.commandName]);
		window.showErrorMessage(message, this.translationService.getMessage(SEE_DETAILS)).then(this.showOutputIfClicked);
	}

	showInformationMessage(infoMessage: string) {
		window.showInformationMessage(infoMessage);
	}

	showErrorMessage(errorMessage?: string) {
		const message = errorMessage ? errorMessage : this.translationService.getMessage(COMMAND.ERROR, [this.commandName]);
		window.showErrorMessage(message);
	}

	private showOutputIfClicked(message?: string) {
		if (message) {
			Output.show();
		}
	}
}
