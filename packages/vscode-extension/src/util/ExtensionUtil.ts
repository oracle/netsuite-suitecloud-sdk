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
} = require('@oracle/suitecloud-cli/src/services/actionresult/ActionResult').ActionResult.STATUS;

export const CommandActionExecutor = require('@oracle/suitecloud-cli/src/core/CommandActionExecutor');
export const CommandsMetadataService = require('@oracle/suitecloud-cli/src/core/CommandsMetadataService');
export const CommandOptionsValidator = require('@oracle/suitecloud-cli/src/core/CommandOptionsValidator');
export const CLIConfigurationService = require('@oracle/suitecloud-cli/src/core/extensibility/CLIConfigurationService');

export const ConsoleLogger = require('@oracle/suitecloud-cli/src/loggers/ConsoleLogger');

export const TranslationService = require('@oracle/suitecloud-cli/src/services/TranslationService');
export const FileSystemService = require('@oracle/suitecloud-cli/src/services/FileSystemService');
export const AuthenticationUtils = require('@oracle/suitecloud-cli/src/utils/AuthenticationUtils');

export const FileUtils = require('@oracle/suitecloud-cli/src/utils/FileUtils');

export const showValidationResults = require('@oracle/suitecloud-cli/src/validation/InteractiveAnswersValidator');
export const validateAuthIDNotInList = require('@oracle/suitecloud-cli/src/validation/InteractiveAnswersValidator');
export const validateFieldIsNotEmpty = require('@oracle/suitecloud-cli/src/validation/InteractiveAnswersValidator');
export const validateFieldHasNoSpaces = require('@oracle/suitecloud-cli/src/validation/InteractiveAnswersValidator');
export const validateAlphanumericHyphenUnderscore = require('@oracle/suitecloud-cli/src/validation/InteractiveAnswersValidator');
export const validateMaximumLength = require('@oracle/suitecloud-cli/src/validation/InteractiveAnswersValidator');