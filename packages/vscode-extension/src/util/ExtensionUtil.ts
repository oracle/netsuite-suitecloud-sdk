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

export const ApplicationConstants = require('@oracle/suitecloud-cli/src/ApplicationConstants');

export const actionResultStatus: {
	SUCCESS: string;
	ERROR: string;
} = require('@oracle/suitecloud-cli/src/commands/actionresult/ActionResult').ActionResult.STATUS;

export const CommandActionExecutor = require('@oracle/suitecloud-cli/src/core/CommandActionExecutor');
export const CommandInstanceFactory = require('@oracle/suitecloud-cli/src/core/CommandInstanceFactory');
export const CommandsMetadataService = require('@oracle/suitecloud-cli/src/core/CommandsMetadataService');
export const CommandOptionsValidator = require('@oracle/suitecloud-cli/src/core/CommandOptionsValidator');
export const CLIConfigurationService = require('@oracle/suitecloud-cli/src/core/extensibility/CLIConfigurationService');

export const ConsoleLogger = require('@oracle/suitecloud-cli/src/loggers/ConsoleLogger');

export const TranslationService = require('@oracle/suitecloud-cli/src/services/TranslationService');
export const FileSystemService = require('@oracle/suitecloud-cli/src/services/FileSystemService');
export const AuthenticationService = require('@oracle/suitecloud-cli/src/services/AuthenticationService');

export const FileUtils = require('@oracle/suitecloud-cli/src/utils/FileUtils');