/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ActionExecutor } from './ActionExecutor';
import AddDependencies from './commands/AddDependencies';
import Deploy from './commands/Deploy';
import ListObjects from './commands/ListObjects';
import { installIfNeeded } from './core/sdksetup/SdkServices';
import UploadFile from './commands/UploadFile';
const SCLOUD_OUTPUT_CHANNEL_NAME = 'Netsuite SuiteCloud';

export const Output: vscode.OutputChannel = vscode.window.createOutputChannel(SCLOUD_OUTPUT_CHANNEL_NAME);

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	await installIfNeeded();

	const actionExecutor = new ActionExecutor();
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let addDependenciesDisposable = vscode.commands.registerCommand('extension.adddependencies', () => {
		actionExecutor.execute(new AddDependencies());
	});
	context.subscriptions.push(addDependenciesDisposable);
	let deployDisposable = vscode.commands.registerCommand('extension.deploy', () => {
		actionExecutor.execute(new Deploy());
	});
	context.subscriptions.push(deployDisposable);

	let listobjectsDisposable = vscode.commands.registerCommand('extension.listobjects', () => {
		actionExecutor.execute(new ListObjects());
	});
	context.subscriptions.push(listobjectsDisposable);

	let uploadFile = vscode.commands.registerCommand('extension.uploadfile', () => {
		actionExecutor.execute(new UploadFile());
	});
	context.subscriptions.push(uploadFile);

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log("Let's rock it, Netsuite SuiteCloud VSCode Extension has been activated!");
}

// this method is called when your extension is deactivated
export function deactivate() {}
