/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { homedir } from 'os';
import { getSdkPath } from './core/sdksetup/SdkProperties';
import { AuthListData, ActionResult, AuthenticateActionResult } from './types/ActionResult';
import { actionResultStatus, AuthenticationUtils, InteractiveAnswersValidator } from './util/ExtensionUtil';
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
import { showSetupAccountWarningMessageIfNeeded } from './startup/ShowSetupAccountWarning';
import { FILES, FOLDERS } from './ApplicationConstants';

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
let cachedAuthIDs: string[];
// this method is called when SuiteCloud extension is activated
// the extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	installIfNeeded().then(() => {
		sdkDependenciesDownloadedAndValidated = true;
		showSetupAccountWarningMessageIfNeeded();
	});

	context.subscriptions.push(
		register('suitecloud.adddependencies', new AddDependencies()),
		register('suitecloud.comparefile', new CompareFile()),
		register('suitecloud.createfile', new CreateFile()),
		register('suitecloud.createproject', new CreateProject()),
		register('suitecloud.deploy', new Deploy()),
		register('suitecloud.importfiles', new ImportFiles()),
		register('suitecloud.importobjects', new ImportObjects()),
		register('suitecloud.listfiles', new ListFiles()),
		register('suitecloud.listobjects', new ListObjects()),
		register('suitecloud.manageauth', new ManageAuth()),
		register('suitecloud.setupaccount', new SetupAccount()),
		register('suitecloud.updatefile', new UpdateFile()),
		register('suitecloud.updateobject', new UpdateObject()),
		register('suitecloud.uploadfile', new UploadFile()),
		register('suitecloud.validate', new Validate())
	);

	const suitecloudProjectStatusBar = createSuiteCloudProjectStatusBar();
	const authIDStatusBar = createAuthIDStatusBar();
	updateAuthIDs();
	handleChangeActiveTextEditor(vscode.window.activeTextEditor, suitecloudProjectStatusBar, authIDStatusBar);

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor((editor) => handleChangeActiveTextEditor(editor, suitecloudProjectStatusBar, authIDStatusBar))
	);

	const projectJsonWatchPattern = `**/${FILES.PROJECT_JSON}`;
	// const projectJsonWatchPattern = new vscode.RelativePattern(FILES.PROJECT_JSON, '');
	context.subscriptions.push(vscode.workspace.createFileSystemWatcher(projectJsonWatchPattern).onDidChange((e)=> updateAuthIDStatusBarIfNeeded(e, authIDStatusBar)));

	context.subscriptions.push(
		vscode.workspace
			.createFileSystemWatcher(new vscode.RelativePattern(vscode.Uri.file(path.join(homedir(), FOLDERS.SUITECLOUD_SDK)), FILES.CREDENTIALS))
			.onDidChange(updateAuthIDs)
	);

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('SuiteCloud Extension for Visual Studio Code has been activated.');
}

// this method is called when SuiteCloud extension is deactivated
export function deactivate() {}

/**
 * Create the status bar item used to display the current suitecloud-project
 *
 * @returns {vscode.StatusBarItem} The status bar item
 */
function createSuiteCloudProjectStatusBar(): vscode.StatusBarItem {
	const suitecloudProjectStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10);
	suitecloudProjectStatusBar.tooltip = 'Displays current suitecloud project';
	suitecloudProjectStatusBar.hide();

	return suitecloudProjectStatusBar;
}

/**
 * Create the status bar item used to display the current authid used in the suitecloud-project
 *
 * @returns {vscode.StatusBarItem} The status bar item
 */
function createAuthIDStatusBar(): vscode.StatusBarItem {
	const authIDStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10);
	authIDStatusBar.tooltip = 'Select authID for current suitecloud project';
	authIDStatusBar.command = 'suitecloud.setupaccount';
	authIDStatusBar.hide();

	return authIDStatusBar;
}

/**
 * Update the active project if the active editor changes to a different project
 *
 * @param {vscode.TextEditor|undefined} editor
 * @param {vscode.Uri} activeProjectJsonFile
 */
async function handleChangeActiveTextEditor(
	editor: vscode.TextEditor | undefined,
	suitecloudProjectStatusBar: vscode.StatusBarItem,
	authIDStatusBar: vscode.StatusBarItem
) {
	// const activeTextEditor = vscode.window.activeTextEditor;
	const activeTextEditor = editor;
	const activeWorkspaceFolder = activeTextEditor ? vscode.workspace.getWorkspaceFolder(activeTextEditor.document.uri) : undefined;

	if (activeWorkspaceFolder && (await isSuiteCloudProjectFolder(activeWorkspaceFolder))) {
		suitecloudProjectStatusBar.text = `$(file-directory) ${activeWorkspaceFolder.name}`;
		suitecloudProjectStatusBar.show();

		const defaultAuthId = await getDefaultAuthIdForProject(activeWorkspaceFolder);
		updateAuthIDStatusBar(authIDStatusBar, defaultAuthId);
		return;
	}

	suitecloudProjectStatusBar.hide();
	authIDStatusBar.hide();
	return;
}

async function isSuiteCloudProjectFolder(workspaceFolder: vscode.WorkspaceFolder): Promise<boolean> {
	// check if the activeWorkspace folder has a suitecloud.config.js or manifest and deploy files
	const pattern = new vscode.RelativePattern(workspaceFolder, '{suitecloud.config.js,*/manifest.xml}');
	const files = await vscode.workspace.findFiles(pattern);
	if (files.length > 0) {
		return true;
	}

	return false;
}

async function getDefaultAuthIdForProject(workspaceFolder: vscode.WorkspaceFolder): Promise<string> {
	try {
		const projectJsonPattern = new vscode.RelativePattern(workspaceFolder, FILES.PROJECT_JSON);
		const projectJsonFound = await vscode.workspace.findFiles(projectJsonPattern);
		if (projectJsonFound.length === 0) {
			return '';
		}
		const projectJsonContent = (await vscode.workspace.fs.readFile(projectJsonFound[0])).toString();
		const { defaultAuthId } = JSON.parse(projectJsonContent);
		return defaultAuthId ? defaultAuthId : '';
	} catch (error) {
		return '';
	}
}

async function updateAuthIDs() {
	const accountsPromise = AuthenticationUtils.getAuthIds(getSdkPath());
	const accounts = await accountsPromise;
	const accountsData: AuthListData = accounts.isSuccess() ? accounts.data : {};
	cachedAuthIDs = Object.keys(accountsData);
}

async function updateAuthIDStatusBar(authIDStatusBar: vscode.StatusBarItem, defaultAuthId: string) {
	if (defaultAuthId === '') {
		authIDStatusBar.text = '';
		authIDStatusBar.hide();
		return;
	}

	authIDStatusBar.text = `$(key) ${defaultAuthId}`;
	authIDStatusBar.show();
}

async function updateAuthIDStatusBarIfNeeded(event: vscode.Uri, authIDStatusBar: vscode.StatusBarItem) {
	// check if the changed project.json belongs to the same workspace folder as the activeTextEditor
	const activeTextEditor = vscode.window.activeTextEditor;
	if (activeTextEditor && vscode.workspace.getWorkspaceFolder(activeTextEditor.document.uri) === vscode.workspace.getWorkspaceFolder(event)) {
		const workspaceFolder = vscode.workspace.getWorkspaceFolder(activeTextEditor.document.uri);
		const defaultAuthId = workspaceFolder ? await getDefaultAuthIdForProject(workspaceFolder) : '';
		updateAuthIDStatusBar(authIDStatusBar, defaultAuthId);
	}
}
