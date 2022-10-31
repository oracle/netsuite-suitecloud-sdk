import * as vscode from 'vscode';
import { FILES } from '../ApplicationConstants';

/**
 * Create the status bar item used to display the current suitecloud-project
 *
 * @returns {vscode.StatusBarItem} The status bar item
 */
export function createSuiteCloudProjectStatusBar(): vscode.StatusBarItem {
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
export function createAuthIDStatusBar(): vscode.StatusBarItem {
	const authIDStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10);
	authIDStatusBar.tooltip = 'Select authID for current suitecloud project';
	authIDStatusBar.command = 'suitecloud.setupaccount';
	authIDStatusBar.hide();

	return authIDStatusBar;
}

/**
 * Update the active project and used authID if the active editor changes to a different project
 *
 * @param {vscode.TextEditor|undefined} editor
 * @param {vscode.StatusBarItem} suitecloudProjectStatusBar
 * @param {vscode.StatusBarItem} authIDStatusBar
 */
export async function updateStatusBars(
	editor: vscode.TextEditor | undefined,
	suitecloudProjectStatusBar: vscode.StatusBarItem,
	authIDStatusBar: vscode.StatusBarItem
) {
	const activeTextEditor = editor;
	const activeWorkspaceFolder = activeTextEditor ? vscode.workspace.getWorkspaceFolder(activeTextEditor.document.uri) : undefined;

	if (activeWorkspaceFolder && (await isSuiteCloudProjectFolder(activeWorkspaceFolder))) {
		updateSuiteCloudProjectStatusBar(suitecloudProjectStatusBar, activeWorkspaceFolder.name);

		const defaultAuthId = await getDefaultAuthIdForProject(activeWorkspaceFolder);
		updateAuthIDStatusBar(authIDStatusBar, defaultAuthId);
		return;
	}

	setTimeout(async () => {
		const activeTextEditor = vscode.window.activeTextEditor;
		const activeWorkspaceFolder = activeTextEditor ? vscode.workspace.getWorkspaceFolder(activeTextEditor.document.uri) : undefined;
		if (!activeWorkspaceFolder || (activeWorkspaceFolder && !(await isSuiteCloudProjectFolder(activeWorkspaceFolder)))) {
			suitecloudProjectStatusBar.hide();
			authIDStatusBar.hide();
		}
	}, 100);

	return;
}

async function isSuiteCloudProjectFolder(workspaceFolder: vscode.WorkspaceFolder): Promise<boolean> {
	// check if the activeWorkspace folder has a suitecloud.config.js or manifest and deploy files
	const suitecloudConfigPattern = new vscode.RelativePattern(workspaceFolder, FILES.SUITECLOUD_CONFIG_JS);
	const suitecloduConfigFoundFiles = await vscode.workspace.findFiles(suitecloudConfigPattern);
	if (suitecloduConfigFoundFiles.length > 0) {
		return true;
	}
	const deployAndManifestPattern = new vscode.RelativePattern(workspaceFolder, `{${FILES.DEPLOY_XML},${FILES.MANIFEST_XML}}`);
	const deployAndManifestFoundFiles = await vscode.workspace.findFiles(deployAndManifestPattern);
	if (deployAndManifestFoundFiles.length > 1) {
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

async function updateAuthIDStatusBar(authIDStatusBar: vscode.StatusBarItem, defaultAuthId: string) {
	if (defaultAuthId === '') {
		authIDStatusBar.text = `$(key) Set Up Account`;
		authIDStatusBar.show();
		return;
	}

	authIDStatusBar.text = `$(key) ${defaultAuthId}`;
	authIDStatusBar.show();
}

export async function updateAuthIDStatusBarIfNeeded(event: vscode.Uri, authIDStatusBar: vscode.StatusBarItem) {
	// check if the changed project.json belongs to the same workspace folder as the activeTextEditor
	const activeTextEditor = vscode.window.activeTextEditor;
	if (activeTextEditor && vscode.workspace.getWorkspaceFolder(activeTextEditor.document.uri) === vscode.workspace.getWorkspaceFolder(event)) {
		const workspaceFolder = vscode.workspace.getWorkspaceFolder(activeTextEditor.document.uri);
		const defaultAuthId = workspaceFolder ? await getDefaultAuthIdForProject(workspaceFolder) : '';
		updateAuthIDStatusBar(authIDStatusBar, defaultAuthId);
	}
}

function updateSuiteCloudProjectStatusBar(suitecloudProjectStatusBar: vscode.StatusBarItem, activeWorkspaceFolderName: string) {
	suitecloudProjectStatusBar.text = `$(file-directory) ${activeWorkspaceFolderName}`;
	suitecloudProjectStatusBar.show();
}
