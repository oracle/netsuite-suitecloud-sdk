// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import AddDependencies from './commands/AddDependencies';
import BaseAction from './commands/BaseAction';
import Deploy from './commands/Deploy';
import ListObjects from './commands/ListObjects';
import { NodeUtils, unwrapExceptionMessage, unwrapInformationMessage } from './util/ExtensionUtil';
// import  NodeUtils from '@oracle/netsuite-suitecloud-nodejs-cli/src/utils/NodeUtils';
// import * as NodeUtils from '../../node-cli/src/utils/NodeUtils.js'
const SCLOUD_OUTPUT_CHANNEL_NAME = 'Netsuite SuiteCloud';

export const scloudOutput: vscode.OutputChannel = vscode.window.createOutputChannel(SCLOUD_OUTPUT_CHANNEL_NAME);

// HANDLES EXECUTION OF ACTIONS - CENTRAL POINT
class ActionExecutor {
	constructor() {
	}

	execute<T extends BaseAction>(action: T) {
		//validations..
		action.execute();
	}
}

class VSCommandOutputHandler {
	showSuccessResult(actionResult: any, formatOutputFunction: (arg0: any) => void) {
		if (!formatOutputFunction) {
			this._defaultSuccessOutputFormat(actionResult);
		} else {
			formatOutputFunction(actionResult);
		}
	}

	showErrorResult(error: any) {
		NodeUtils.println(unwrapExceptionMessage(error), NodeUtils.COLORS.ERROR);

		const informativeMessage = unwrapInformationMessage(error);

		if (informativeMessage) {
			NodeUtils.println(`${NodeUtils.lineBreak}${informativeMessage}`, NodeUtils.COLORS.INFO);
		}
	}

	_defaultSuccessOutputFormat(actionResult: any) {
		NodeUtils.println(actionResult, NodeUtils.COLORS.RESULT);
	}
};


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Let\'s rock it, Netsuite SuiteCloud VSCode Extension has been activated!');

	const actionExecutor = new ActionExecutor();
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let addDependenciesDisposable = vscode.commands.registerCommand('extension.adddependencies', () => {
		actionExecutor.execute(new AddDependencies());
		new Deploy().execute();
	});
	context.subscriptions.push(addDependenciesDisposable);
	let deployDisposable = vscode.commands.registerCommand('extension.deploy', () => {
		actionExecutor.execute(new Deploy());
		new Deploy().execute();
	});
	context.subscriptions.push(deployDisposable);

	let listobjectsDisposable = vscode.commands.registerCommand('extension.listobjects', () => {
		actionExecutor.execute(new ListObjects());
	});

	context.subscriptions.push(listobjectsDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }