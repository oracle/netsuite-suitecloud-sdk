import * as vscode from 'vscode';

// returns the root project folder of the active file in the editor
// works fine with workspace with multiple project folders opened
export function getRootProjectFolder(): string | null {
	const activeTextEditor = vscode.window.activeTextEditor;
	const activeWorkspaceFolder = activeTextEditor ? vscode.workspace.getWorkspaceFolder(activeTextEditor.document.uri) : null;
	return activeWorkspaceFolder ? activeWorkspaceFolder.uri.fsPath : null;
}

export const { unwrapExceptionMessage, unwrapInformationMessage } = require('@oracle/netsuite-suitecloud-nodejs-cli/src/utils/ExceptionUtils');
export const NodeUtils = require('@oracle/netsuite-suitecloud-nodejs-cli/src/utils/NodeUtils');

export const OperationResultStatus: {
	SUCCESS: string;
	ERROR: string;
} = require('@oracle/netsuite-suitecloud-nodejs-cli/src/commands/OperationResultStatus');
