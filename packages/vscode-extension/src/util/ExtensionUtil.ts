import * as vscode from 'vscode';

// returns the root project folder of the active file in the editor
// works fine with workspace with multiple project folders opened
export function getRootProjectFolder(): string | null {
	const activeTextEditor = vscode.window.activeTextEditor;
	const activeWorkspaceFolder = activeTextEditor ? vscode.workspace.getWorkspaceFolder(activeTextEditor.document.uri) : null;
	return activeWorkspaceFolder ? activeWorkspaceFolder.uri.fsPath : null;
}

export const { unwrapExceptionMessage } = require('@oracle/suitecloud-cli/src/utils/ExceptionUtils');

export const operationResultStatus: {
	SUCCESS: string;
	ERROR: string;
} = require('@oracle/suitecloud-cli/src/commands/OperationResultStatus');
