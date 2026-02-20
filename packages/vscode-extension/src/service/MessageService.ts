/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { window } from 'vscode';
import { output } from '../suitecloud';
import { BUTTONS, COMMAND } from './TranslationKeys';
import { VSTranslationService } from './VSTranslationService';

const DEFAULT_TIMEOUT = 5000;
const COMMAND_NOT_DEFINED = 'Command not defined';

export default class MessageService {
	private vscodeCommandName?: string;
	private readonly translationService = new VSTranslationService();
	private _executionPath?: string;

	constructor(commandName?: string) {
		this.vscodeCommandName = commandName;
	}

	set executionPath(excutionPath: string | undefined) {
		this._executionPath = excutionPath;
	}

	private addProjectNameToMessage(message: string): string {
		if (this._executionPath) {
			const executionPathParts = this._executionPath.replace(/\\/g, '/').split('/');
			const projectFolderName: string = executionPathParts[executionPathParts.length - 1];
			// window.showInformationMessage removes new line characters do not try to add them here
			message = `${projectFolderName}: ${message}`;
		}
		return message;
	}

	showInformationMessage(infoMessage: string, statusBarMessage?: string, promise?: Promise<any>, spin = true, includeProjectName: boolean = true) {
		if (includeProjectName) {
			window.showInformationMessage(this.addProjectNameToMessage(infoMessage));
		} else {
			window.showInformationMessage(infoMessage);
		}

		if (statusBarMessage && promise) {
			this.showStatusBarMessage(statusBarMessage, spin, promise);
		}
	}

	showWarningMessage(warningMessage: string, includeProjectName = true) {
		window.showWarningMessage(
			includeProjectName ? this.addProjectNameToMessage(warningMessage) : warningMessage
		);
	}

	showWarningMessageWithOk(warningMessage: string, includeProjectName = true) {
		window.showWarningMessage(
			includeProjectName ? this.addProjectNameToMessage(warningMessage) : warningMessage,
			this.translationService.getMessage(BUTTONS.OK));
	}

	showErrorMessage(errorMessage: string) {
		window.showErrorMessage(this.addProjectNameToMessage(errorMessage));
	}

	showStatusBarMessage(message: string, spin?: boolean, promise?: Promise<any>) {
		const messageToShow = spin ? `$(sync~spin) ${message}` : message;
		if (!promise) {
			window.setStatusBarMessage(messageToShow, DEFAULT_TIMEOUT);
		} else {
			window.setStatusBarMessage(messageToShow, promise);
		}
	}

	showCommandInfo(successMessage?: string, includeProjectName = true) {
		if (!this.vscodeCommandName) {
			throw COMMAND_NOT_DEFINED;
		}
		const message = successMessage ? successMessage : this.translationService.getMessage(COMMAND.SUCCESS, this.vscodeCommandName);
		window
			.showInformationMessage(
				includeProjectName ? this.addProjectNameToMessage(message) : message,
				this.translationService.getMessage(BUTTONS.SEE_DETAILS)
			)
			.then(this.showOutputIfClicked);
	}

	showCommandWarning(warningMessage?: string, includeProjectName = true) {
		if (!this.vscodeCommandName) {
			throw COMMAND_NOT_DEFINED;
		}
		const message = warningMessage ? warningMessage : this.translationService.getMessage(COMMAND.WARNING, this.vscodeCommandName);
		window
			.showWarningMessage(
				includeProjectName ? this.addProjectNameToMessage(message) : message,
				this.translationService.getMessage(BUTTONS.SEE_DETAILS)
			)
			.then(this.showOutputIfClicked);
	}

	showCommandError(errorMessage?: string, includeProjectName: boolean = true) {
		if (!this.vscodeCommandName) {
			throw COMMAND_NOT_DEFINED;
		}
		const message = errorMessage ? errorMessage : this.translationService.getMessage(COMMAND.ERROR, this.vscodeCommandName);
		window
			.showErrorMessage(
				includeProjectName ? this.addProjectNameToMessage(message) : message,
				this.translationService.getMessage(BUTTONS.SEE_DETAILS)
			)
			.then(this.showOutputIfClicked);
	}

	showCommandInfoWithSpecificButtonsAndActions(infoMessage: string, buttonsAndActions: { buttonMessage: string, buttonAction: () => void }[]) {
		window
			.showInformationMessage(
				infoMessage,
				...buttonsAndActions.map(button => button.buttonMessage)
			)
			.then((selectedButton?: string) => {
				if (selectedButton) {
					buttonsAndActions.find(button => button.buttonMessage === selectedButton)?.buttonAction();
				}
			})
	}

	showCommandErrorWithSpecificButtonsAndActions(errorMessage: string, buttonsAndActions: { buttonMessage: string, buttonAction: () => void }[]) {
		window
			.showErrorMessage(
				errorMessage,
				...buttonsAndActions.map(button => button.buttonMessage)
			)
			.then((selectedButton?: string) => {
				if (selectedButton) {
					buttonsAndActions.find(button => button.buttonMessage === selectedButton)?.buttonAction();
				}
			})
	}

	private showOutputIfClicked = (message?: string) => {
		if (message) {
			this.showOutput();
		}
	}

	public showOutput = () => {
		output.show();
	}

}
