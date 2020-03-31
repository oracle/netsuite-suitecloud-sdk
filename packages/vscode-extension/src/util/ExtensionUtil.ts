import * as vscode from 'vscode';

// returns the root project folder of the active file in the editor
// works fine with workspace with multiple project folders opened
export function getRootProjectFolder(): string | null {
	const activeTextEditor = vscode.window.activeTextEditor;
	const activeWorkspaceFolder = activeTextEditor ? vscode.workspace.getWorkspaceFolder(activeTextEditor.document.uri) : null;
	return activeWorkspaceFolder ? activeWorkspaceFolder.uri.fsPath : null;
}

export const { unwrapExceptionMessage, unwrapInformationMessage } = require('@oracle/suitecloud-cli/src/utils/ExceptionUtils');
export const ConsoleLogger = require('@oracle/suitecloud-cli/src/loggers/ConsoleLogger');
export const NodeConsoleLogger = require('@oracle/suitecloud-cli/src/loggers/NodeConsoleLogger');

export const actionResultStatus: {
	SUCCESS: string;
	ERROR: string;
} = require('@oracle/suitecloud-cli/src/commands/actionResult/ActionResult').ActionResult;

export const CommandOutputHandler = require('@oracle/suitecloud-cli/src/core/CommandOutputHandler');
