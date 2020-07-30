/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as vscode from 'vscode';

// returns the root project folder of the active file in the editor
// works fine with workspace with multiple project folders opened
export function getRootProjectFolder(): string | undefined {
	const activeTextEditor = vscode.window.activeTextEditor;
	const activeWorkspaceFolder = activeTextEditor ? vscode.workspace.getWorkspaceFolder(activeTextEditor.document.uri) : undefined;
	return activeWorkspaceFolder ? activeWorkspaceFolder.uri.fsPath : undefined;
}

export const CommandActionExecutor = require('@oracle/suitecloud-cli/dist/core/CommandActionExecutor');
export const CommandsMetadataService = require('@oracle/suitecloud-cli/dist/core/CommandsMetadataService');
export const CommandOptionsValidator = require('@oracle/suitecloud-cli/dist/core/CommandOptionsValidator');
export const CLIConfigurationService = require('@oracle/suitecloud-cli/dist/core/extensibility/CLIConfigurationService');

export const ConsoleLogger = require('@oracle/suitecloud-cli/dist/loggers/ConsoleLogger');

export const AuthenticationUtils = require('@oracle/suitecloud-cli/dist/utils/AuthenticationUtils');
