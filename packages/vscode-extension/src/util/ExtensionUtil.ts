import * as vscode from 'vscode';

// returns the root project folder of the active file in the editor
// works fine with workspace with multiple project folders opened
export function getRootProjectFolder() : string | null {
	const activeTextEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
	let activeWorkspaceFolder: string | null;
	if(activeTextEditor) {
		const activeWorkspace = vscode.workspace.getWorkspaceFolder(activeTextEditor.document.uri);
		activeWorkspaceFolder = activeWorkspace ? activeWorkspace.uri.fsPath : null;
	} else {
		activeWorkspaceFolder = null;
	}
	return activeWorkspaceFolder;
}

export const  { unwrapExceptionMessage } = require('@oracle/netsuite-suitecloud-nodejs-cli/src/utils/ExceptionUtils');

