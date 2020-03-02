import * as vscode from 'vscode';
import { scloudOutput } from '../extension';

export class MessageService {
	_commandName: string;
	constructor(commandName: string) {
		this._commandName = commandName;
	}

	showTriggerActionInfo() {
		vscode.window.showInformationMessage(`SuiteCloud: ${this._commandName} command triggered.`);
	}

	showTriggerActionFailed() {
		vscode.window.showErrorMessage(`SuiteCloud: ${this._commandName} command can not be triggered because the root folder could not be found.`);
	}

	showCompletedActionInfo() {
		vscode.window
			.showInformationMessage(`SuiteCloud: ${this._commandName} command executed.`, `check result in ${scloudOutput.name} output channel.`)
			.then(this._showOutputIfClicked);
	}

	showFailedActionInfo() {
		vscode.window
			.showErrorMessage(`SuiteCloud: Something went wrong with the ${this._commandName} command`, `click here to see more details.`)
			.then(this._showOutputIfClicked);
    }
    
    showErrorMessage(message: string) {
        vscode.window.showErrorMessage(`SuiteCloud: Something went wrong with the ${this._commandName} command. ${message}`);
    }

	_showOutputIfClicked(message: string | undefined) {
		if (message) {
			scloudOutput.show();
		}
	}
}
