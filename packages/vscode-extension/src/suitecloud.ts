/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import AddDependencies from './commands/AddDependencies';
import BaseAction from './commands/BaseAction';
import CreateFile from './commands/CreateFile';
import CreateProject from './commands/CreateProject';
import Deploy from './commands/Deploy';
import ImportFiles from './commands/ImportFiles';
import ImportObjects from './commands/ImportObjects';
import ListFiles from './commands/ListFiles';
import ListObjects from './commands/ListObjects';
import SetupAccount from './commands/SetupAccount';
import UpdateFile from './commands/UpdateFile';
import UpdateObject from './commands/UpdateObject';
import UploadFile from './commands/UploadFile';
import Validate from './commands/Validate';
import { installIfNeeded } from './core/sdksetup/SdkServices';
import { VSTranslationService } from './service/VSTranslationService';
import { showSetupAccountWarningMessageIfNeeded } from './startup/ShowSetupAccountWarning';
import { EXTENSION_INSTALLATION } from './service/TranslationKeys';

const SCLOUD_OUTPUT_CHANNEL_NAME = 'SuiteCloud';
export const output: vscode.OutputChannel = vscode.window.createOutputChannel(SCLOUD_OUTPUT_CHANNEL_NAME);

const translationService = new VSTranslationService();

function register<T extends BaseAction>(command: string, action: T) {
	return vscode.commands.registerCommand(command, (uri?: vscode.Uri) => {
		if (!sdkDependenciesDownloadedAndValidated) {
			vscode.window.showWarningMessage(translationService.getMessage(EXTENSION_INSTALLATION.WARNING.VALIDATING_SDK_DEPENDENCIES));
			return;
		}
		// Called from a context menu, we receive uri info related to the selected file.
		action.run(uri);
	});
}

let sdkDependenciesDownloadedAndValidated = false;
// this method is called when SuiteCloud extension is activated
// the extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	installIfNeeded().then(() => {
		sdkDependenciesDownloadedAndValidated = true;
		showSetupAccountWarningMessageIfNeeded();
	});

	context.subscriptions.push(
		register('suitecloud.adddependencies', new AddDependencies()),
		register('suitecloud.createfile', new CreateFile()),
		register('suitecloud.createproject', new CreateProject()),
		register('suitecloud.deploy', new Deploy()),
		register('suitecloud.importfiles', new ImportFiles()),
		register('suitecloud.importobjects', new ImportObjects()),
		register('suitecloud.listfiles', new ListFiles()),
		register('suitecloud.listobjects', new ListObjects()),
		register('suitecloud.setupaccount', new SetupAccount()),
		register('suitecloud.updatefile', new UpdateFile()),
		register('suitecloud.updateobject', new UpdateObject()),
		register('suitecloud.uploadfile', new UploadFile()),
		register('suitecloud.validate', new Validate()),
	);

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('SuiteCloud Extension for Visual Studio Code has been activated.');
}

// this method is called when SuiteCloud extension is deactivated
export function deactivate() {}
