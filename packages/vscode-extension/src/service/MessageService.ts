import { window } from 'vscode';
import { scloudOutput } from '../extension';

export class MessageService {
	private commandName: string;

	constructor(commandName: string) {
		this.commandName = commandName;
	}

	showTriggeredActionInfo() {
		window.showInformationMessage(`The ${this.commandName} command has been triggered.`);
	}

	showTriggeredActionError() {
		window.showErrorMessage(`The ${this.commandName} command cannot be triggered because the root folder could not be found.`);
	}

	showCompletedActionInfo() {
		window
			.showInformationMessage(`The ${this.commandName} command has been successfully executed.`, `See details`)
			.then(this.showOutputIfClicked);
	}

	showCompletedActionError() {
		window.showErrorMessage(`Something went wrong with the ${this.commandName} command`, `See details`).then(this.showOutputIfClicked);
	}

	showErrorMessage(message: string) {
		window.showErrorMessage(`Something went wrong with the ${this.commandName} command.\n${message}`);
	}

	private showOutputIfClicked(message?: string) {
		if (message) {
			scloudOutput.show();
		}
	}
}
