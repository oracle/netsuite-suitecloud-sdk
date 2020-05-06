/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';

// returns the root project folder of the active file in the editor
// works fine with workspace with multiple project folders opened
export function getRootProjectFolder(): string | null {
	const activeTextEditor = vscode.window.activeTextEditor;
	const activeWorkspaceFolder = activeTextEditor ? vscode.workspace.getWorkspaceFolder(activeTextEditor.document.uri) : null;
	return activeWorkspaceFolder ? activeWorkspaceFolder.uri.fsPath : null;
}

export const ConsoleLogger = require('@oracle/suitecloud-cli/src/loggers/ConsoleLogger');

export const actionResultStatus: {
	SUCCESS: string;
	ERROR: string;
} = require('@oracle/suitecloud-cli/src/commands/actionResult/ActionResult').ActionResult.STATUS;

export const TranslationService = require('@oracle/suitecloud-cli/src/services/TranslationService');

//NodeTranslationService is needed in FileUtils
export const NodeTranslationService = require('@oracle/suitecloud-cli/src/services/NodeTranslationService');

export const FileUtils = require('@oracle/suitecloud-cli/src/utils/FileUtils');

export const SDKDownloadService = require('@oracle/suitecloud-cli/src/core/sdksetup/SDKDownloadService');

export const FileSystemService = require('@oracle/suitecloud-cli/src/services/FileSystemService');