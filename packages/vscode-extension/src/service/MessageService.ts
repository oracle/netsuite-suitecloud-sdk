/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { window } from 'vscode';
import { scloudOutput } from '../extension';
import * as TranslationKeys from '../service/TranslationKeys';
import { TranslationService } from '../service/TranslationService';

export default class MessageService {

	private commandName: string;
	private translationService: TranslationService;

	constructor(commandName: string) {
		this.commandName = commandName;
		this.translationService = new TranslationService();
	}

	showTriggeredActionInfo() {
		window.showInformationMessage(this.translationService.getMessage(TranslationKeys.COMMAND.TRIGGERED, [this.commandName]));
	}

	showTriggeredActionError() {
		window.showErrorMessage(this.translationService.getMessage(TranslationKeys.COMMAND.ROOT_FOLDER_NOT_FOUND, [this.commandName]));
	}

	showCompletedActionInfo() {
		const SEE_DETAILS = this.translationService.getMessage(TranslationKeys.SEE_DETAILS);
		window.showInformationMessage(this.translationService.getMessage(TranslationKeys.COMMAND.SUCCESS, [this.commandName]), SEE_DETAILS)
			.then(this.showOutputIfClicked);
	}

	showCompletedActionError() {
		const SEE_DETAILS = this.translationService.getMessage(TranslationKeys.SEE_DETAILS);
		window.showErrorMessage(this.translationService.getMessage(TranslationKeys.COMMAND.ERROR, [this.commandName]), SEE_DETAILS)
			.then(this.showOutputIfClicked);
	}

	showErrorMessage(message: string) {
		window.showErrorMessage(this.translationService.getMessage(TranslationKeys.COMMAND.ERROR, [this.commandName]));
	}

	private showOutputIfClicked(message?: string) {
		if (message) {
			scloudOutput.show();
		}
	}
}