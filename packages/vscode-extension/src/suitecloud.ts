/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { FILES } from './ApplicationConstants';
import { commandsInfoMap } from './commandsMap';
import AddDependencies from './commands/AddDependencies';
import BaseAction from './commands/BaseAction';
import CompareFile from './commands/CompareFile';
import CreateFile from './commands/CreateFile';
import CreateProject from './commands/CreateProject';
import Deploy from './commands/Deploy';
import ImportFiles from './commands/ImportFiles';
import ImportObjects from './commands/ImportObjects';
import ListFiles from './commands/ListFiles';
import ListObjects from './commands/ListObjects';
import ManageAuth from './commands/ManageAuth';
import SetupAccount from './commands/SetupAccount';
import UpdateFile from './commands/UpdateFile';
import UpdateObject from './commands/UpdateObject';
import UploadFile from './commands/UploadFile';
import Validate from './commands/Validate';
import { installIfNeeded } from './core/sdksetup/SdkServices';
import { EXTENSION_INSTALLATION } from './service/TranslationKeys';
import { VSTranslationService } from './service/VSTranslationService';
import { suiteCloudOutputChannel } from './service/SuiteCloudOutputChannel';
import { showSetupAccountWarningMessageIfNeeded } from './startup/ShowSetupAccountWarning';
import { createAuthIDStatusBar, createDevAssistStatusBar, createSuiteCloudProjectStatusBar, updateAuthIDStatusBarIfNeeded, updateStatusBars } from './startup/StatusBarItemsFunctions';
import {
	applyPendingSuiteCloudClineConfig,
	disposeSuiteCloudControlPanel,
	initializeSuiteCloudControlPanel,
	openSuiteCloudControlPanel,
	showSuiteCloudControlPanelWelcomeIfNeeded,
	startSuiteCloudControlPanelProxyIfEnabled,
} from './controlPanel/Controller';


export const output = suiteCloudOutputChannel;

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
	const controlPanelWalkthroughId = `${context.extension.id}#suitecloudControlPanelWalkthrough`;
	context.subscriptions.push(output);

	const sdkDependenciesReady = installIfNeeded().then(() => {
		sdkDependenciesDownloadedAndValidated = true;
		showSetupAccountWarningMessageIfNeeded();
	});

	// initialize status bars
	const devAssistStatusBar = createDevAssistStatusBar();
	const suitecloudProjectStatusBar = createSuiteCloudProjectStatusBar();
	const authIDStatusBar = createAuthIDStatusBar();
	updateStatusBars(vscode.window.activeTextEditor, suitecloudProjectStatusBar, authIDStatusBar);
	initializeSuiteCloudControlPanel(context, devAssistStatusBar, sdkDependenciesReady);
	void sdkDependenciesReady
		.then(async () => {
			await applyPendingSuiteCloudClineConfig();
			void showSuiteCloudControlPanelWelcomeIfNeeded();
			await startSuiteCloudControlPanelProxyIfEnabled();
		})
		.catch(() => undefined);

	// register commands
	context.subscriptions.push(
		register(commandsInfoMap.adddependencies.vscodeCommandId, new AddDependencies()),
		register(commandsInfoMap.comparefile.vscodeCommandId, new CompareFile()),
		register(commandsInfoMap.createfile.vscodeCommandId, new CreateFile()),
		register(commandsInfoMap.createproject.vscodeCommandId, new CreateProject()),
		register(commandsInfoMap.deploy.vscodeCommandId, new Deploy()),
		register(commandsInfoMap.importfiles.vscodeCommandId, new ImportFiles()),
		register(commandsInfoMap.importobjects.vscodeCommandId, new ImportObjects()),
		register(commandsInfoMap.listfiles.vscodeCommandId, new ListFiles()),
		register(commandsInfoMap.listobjects.vscodeCommandId, new ListObjects()),
		register(commandsInfoMap.manageauth.vscodeCommandId, new ManageAuth()),
		register(commandsInfoMap.setupaccount.vscodeCommandId, new SetupAccount()),
		register(commandsInfoMap.updatefile.vscodeCommandId, new UpdateFile()),
		register(commandsInfoMap.updateobject.vscodeCommandId, new UpdateObject()),
		register(commandsInfoMap.uploadfile.vscodeCommandId, new UploadFile()),
		register(commandsInfoMap.validate.vscodeCommandId, new Validate())
	);

	// register more commands
	context.subscriptions.push(
		vscode.commands.registerCommand(commandsInfoMap.opencontrolpanel.vscodeCommandId,
			() => openSuiteCloudControlPanel()
		),
		vscode.commands.registerCommand(commandsInfoMap.opencontrolpanelwalkthrough.vscodeCommandId,
			() => vscode.commands.executeCommand('workbench.action.openWalkthrough', controlPanelWalkthroughId, false)
		)
	);

	// add watchers needed to update the status bars
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor((textEditor) => updateStatusBars(textEditor, suitecloudProjectStatusBar, authIDStatusBar)),
		vscode.workspace.createFileSystemWatcher(`**/${FILES.PROJECT_JSON}`).onDidChange((uri) => updateAuthIDStatusBarIfNeeded(uri, authIDStatusBar))
	);

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('SuiteCloud Extension for Visual Studio Code has been activated.');
}

// this method is called when SuiteCloud extension is deactivated
export function deactivate() {
	return disposeSuiteCloudControlPanel();
}
