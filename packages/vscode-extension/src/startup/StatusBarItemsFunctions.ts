import * as vscode from 'vscode';
import { FILES } from '../ApplicationConstants';
import { commandsInfoMap } from '../commandsMap';
import { DEVASSIST_SERVICE, STATUS_BARS } from '../service/TranslationKeys';
import { VSTranslationService } from '../service/VSTranslationService';

const translationService = new VSTranslationService();
const STATUS_BAR_PRIORITY: number = 10;

/**
 * Create the status bar item used to display the active suitecloud project
 *
 * @returns {vscode.StatusBarItem} The suitecloud project status bar item
 */
export function createSuiteCloudProjectStatusBar(): vscode.StatusBarItem {
	const suitecloudProjectStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, STATUS_BAR_PRIORITY);
	suitecloudProjectStatusBar.tooltip = translationService.getMessage(STATUS_BARS.SUITECLOUD_PROJECT.TOOLTIP);
	suitecloudProjectStatusBar.hide();

	return suitecloudProjectStatusBar;
}

/**
 * Create the status bar item used to display the current authid used in the active suitecloud project
 *
 * @returns {vscode.StatusBarItem} The authID status bar item
 */
export function createAuthIDStatusBar(): vscode.StatusBarItem {
	const authIDStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, STATUS_BAR_PRIORITY - 1);
	authIDStatusBar.tooltip = translationService.getMessage(STATUS_BARS.AUTH_ID.TOOLTIP);
	authIDStatusBar.command = commandsInfoMap.setupaccount.vscodeCommandId;
	authIDStatusBar.hide();

	return authIDStatusBar;
}

/**
 * Create the status bar item used to display DevAssist service status
 *
 * @returns {vscode.StatusBarItem} The authID status bar item
 */
export function createDevAssistStatusBar(): vscode.StatusBarItem {
	const devAssistStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, STATUS_BAR_PRIORITY - 2);
	devAssistStatusBar.tooltip = translationService.getMessage(DEVASSIST_SERVICE.STATUSBAR_TOOLTIP);
	// this devAssistStatusBar visibility is controlled by DevAssistConfiguration.ts (startDevAssistProxyIfEnabled, devAssistConfigurationChangeHandler)
	// initially hidden because devassist service could be disabled 
	devAssistStatusBar.hide();
	devAssistStatusBar.command ='suitecloud.opensettings';
	return devAssistStatusBar;
}

/**
 * Update the active suitecloud project and used authID based on textEditor
 *
 * @param {vscode.TextEditor|undefined} textEditor
 * @param {vscode.StatusBarItem} suitecloudProjectStatusBar
 * @param {vscode.StatusBarItem} authIDStatusBar
 */
export async function updateStatusBars(
	textEditor: vscode.TextEditor | undefined,
	suitecloudProjectStatusBar: vscode.StatusBarItem,
	authIDStatusBar: vscode.StatusBarItem
) {
	const workspaceFolder = textEditor ? vscode.workspace.getWorkspaceFolder(textEditor.document.uri) : undefined;

	if (workspaceFolder && (await isSuiteCloudProjectFolder(workspaceFolder))) {
		updateSuiteCloudProjectStatusBar(suitecloudProjectStatusBar, workspaceFolder.name);

		const defaultAuthId = await getDefaultAuthIdForWorkspaceFolder(workspaceFolder);
		updateAuthIDStatusBar(authIDStatusBar, defaultAuthId);
		return;
	}

	// checking if the status bars need to be hidden after 100ms
	// the activeTextEditor is undefined in the transition from fileA to fileB
	// this strategy is adopted to avoid status bar blinks when fileA and fileB are in the same workspaceFolder
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

/**
 * Update the AuthID status bar when the given uri is from the same workspaceFolder as the activeTextEditor
 *
 * @param {vscode.Uri} uri
 * @param {vscode.StatusBarItem} authIDStatusBar
 */
export async function updateAuthIDStatusBarIfNeeded(uri: vscode.Uri, authIDStatusBar: vscode.StatusBarItem) {
	// check if the changed project.json belongs to the same workspace folder as the activeTextEditor
	const activeTextEditor = vscode.window.activeTextEditor;
	if (activeTextEditor && vscode.workspace.getWorkspaceFolder(activeTextEditor.document.uri) === vscode.workspace.getWorkspaceFolder(uri)) {
		const workspaceFolder = vscode.workspace.getWorkspaceFolder(activeTextEditor.document.uri);
		const defaultAuthId = workspaceFolder ? await getDefaultAuthIdForWorkspaceFolder(workspaceFolder) : '';
		updateAuthIDStatusBar(authIDStatusBar, defaultAuthId);
	}
}

function updateAuthIDStatusBar(authIDStatusBar: vscode.StatusBarItem, defaultAuthId: string): void {
	if (defaultAuthId === '') {
		authIDStatusBar.text = `$(key) ${translationService.getMessage(STATUS_BARS.AUTH_ID.SET_UP_ACCOUNT)}`;
		authIDStatusBar.show();
		return;
	}

	authIDStatusBar.text = `$(key) ${defaultAuthId}`;
	authIDStatusBar.show();
}

function updateSuiteCloudProjectStatusBar(suitecloudProjectStatusBar: vscode.StatusBarItem, activeWorkspaceFolderName: string) {
	suitecloudProjectStatusBar.text = `$(file-directory) ${activeWorkspaceFolderName}`;
	suitecloudProjectStatusBar.show();
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

async function getDefaultAuthIdForWorkspaceFolder(workspaceFolder: vscode.WorkspaceFolder): Promise<string> {
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
		// unable to read or parse project.json
		return '';
	}
}
