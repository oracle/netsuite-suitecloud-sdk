/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { window } from 'vscode';
import { scloudOutput } from '../extension';
import OperationResult from '../OperationResult';
import * as TranslationKeys from '../service/TranslationKeys';
import { TranslationService } from '../service/TranslationService';
import { NodeUtils, unwrapExceptionMessage, unwrapInformationMessage } from '../util/ExtensionUtil';

export class MessageService {

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
		let SEE_DETAILS = this.translationService.getMessage(TranslationKeys.SEE_DETAILS);
		window.showInformationMessage(this.translationService.getMessage(TranslationKeys.COMMAND.SUCCESS, [this.commandName]), SEE_DETAILS)
			.then(this.showOutputIfClicked);
	}

	showCompletedActionError() {
		let SEE_DETAILS = this.translationService.getMessage(TranslationKeys.SEE_DETAILS);
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

export class VSCommandOutputHandler {
	static showSuccessResult(actionResult: any, formatOutputFunction?: (arg0: any) => void) {
		if (!formatOutputFunction) {
			this._defaultSuccessOutputFormat(actionResult);
		} else {
			formatOutputFunction(actionResult);
		}
	}

	static showErrorResult(actionResult: any, formatOutputFunction?: (arg0: any) => void) {
		if (!formatOutputFunction) {
			this._defaultErrorOutputFormat(actionResult);
		} else {
			formatOutputFunction(actionResult);
		}
	}

	static _defaultSuccessOutputFormat(actionResult: OperationResult) {
		NodeUtils.println(actionResult, NodeUtils.COLORS.RESULT);
		scloudOutput.appendLine(actionResult.resultMessage);
		actionResult.data.forEach((element: any) => {
			scloudOutput.appendLine(element);
		});
	}

	static _defaultErrorOutputFormat(actionResult: OperationResult) {
		NodeUtils.println(actionResult, NodeUtils.COLORS.ERROR);
		scloudOutput.appendLine(actionResult.resultMessage);
		if (Array.isArray(actionResult.errorMessages)) {
			actionResult.errorMessages.forEach(error => {
				NodeUtils.println(unwrapExceptionMessage(error), NodeUtils.COLORS.ERROR);
				scloudOutput.appendLine(error);
				const informativeMessage = unwrapInformationMessage(error);

				if (informativeMessage) {
					NodeUtils.println(`${NodeUtils.lineBreak}${informativeMessage}`, NodeUtils.COLORS.INFO);
					scloudOutput.appendLine(informativeMessage);
				}
			});
		}
	}
};