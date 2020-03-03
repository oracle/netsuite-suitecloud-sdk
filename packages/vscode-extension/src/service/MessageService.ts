import * as vscode from 'vscode';
import { scloudOutput } from '../extension';

export class MessageService {
	_commandName: string;
	constructor(commandName: string) {
		this._commandName = commandName;
	}

	showTriggeredActionInfo() {
		vscode.window.showInformationMessage(`The ${this._commandName} command has been triggered.`);
	}

	showTriggeredActionError() {
		vscode.window.showErrorMessage(`The ${this._commandName} command cannot be triggered because the root folder could not be found.`);
	}

	showCompletedActionInfo() {
		vscode.window
			.showInformationMessage(`The ${this._commandName} command has been successfully executed.`, `See details`)
			.then(this._showOutputIfClicked);
	}

	showCompletedActionError() {
		vscode.window
			.showErrorMessage(`Something went wrong with the ${this._commandName} command`, `See details`)
			.then(this._showOutputIfClicked);
    }
    
    showErrorMessage(message: string) {
        vscode.window.showErrorMessage(`Something went wrong with the ${this._commandName} command.\n${message}`);
    }

	_showOutputIfClicked(message: string | undefined) {
		if (message) {
			scloudOutput.show();
		}
	}
}
