/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import AddDependencies from './commands/AddDependencies';
import Deploy from './commands/Deploy';
import ListObjects from './commands/ListObjects';
import UploadFile from './commands/UploadFile';
import ManageAccounts from './commands/ManageAccounts';
import { installIfNeeded } from './core/sdksetup/SdkServices';
import BaseAction from './commands/BaseAction';
import UpdateObject from './commands/UpdateObject';

const SCLOUD_OUTPUT_CHANNEL_NAME = 'NetSuite SuiteCloud';

function register<T extends BaseAction>(command: string, action: T) {
	return vscode.commands.registerCommand(command, () => action.run());
}

export const Output: vscode.OutputChannel = vscode.window.createOutputChannel(SCLOUD_OUTPUT_CHANNEL_NAME);

// this method is called when SuiteCloud extension is activated
// the extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	await installIfNeeded();

	context.subscriptions.push(
		register('suitecloud.adddependencies', new AddDependencies()),
		register('suitecloud.deploy', new Deploy()),
		register('suitecloud.listobjects', new ListObjects()),
		register('suitecloud.uploadfile', new UploadFile()),
		register('suitecloud.setupaccount', new ManageAccounts()),
		register('suitecloud.updateobject', new UpdateObject())
	);

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log("Let's rock it, NetSuite SuiteCloud VSCode Extension has been activated!");
}

// this method is called when SuiteCloud extension is deactivated
export function deactivate() {}
