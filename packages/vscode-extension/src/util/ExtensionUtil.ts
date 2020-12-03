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
} = require('@oracle/suitecloud-cli/src/services/actionresult/ActionResult').STATUS;

export const CommandActionExecutor = require('@oracle/suitecloud-cli/src/core/CommandActionExecutor');
export const CommandsMetadataService = require('@oracle/suitecloud-cli/src/core/CommandsMetadataService');
export const CommandOptionsValidator = require('@oracle/suitecloud-cli/src/core/CommandOptionsValidator');
export const CLIConfigurationService = require('@oracle/suitecloud-cli/src/core/extensibility/CLIConfigurationService');

export const ConsoleLogger = require('@oracle/suitecloud-cli/src/loggers/ConsoleLogger');

export const TranslationService = require('@oracle/suitecloud-cli/src/services/TranslationService');
export const FileSystemService = require('@oracle/suitecloud-cli/src/services/FileSystemService');
export const AuthenticationUtils = require('@oracle/suitecloud-cli/src/utils/AuthenticationUtils');
export const EnvironmentInformationService = require('@oracle/suitecloud-cli/src/services/EnvironmentInformationService');
export const ProjectInfoService = require('@oracle/suitecloud-cli/src/services/ProjectInfoService');

export const FileUtils = require('@oracle/suitecloud-cli/src/utils/FileUtils');

export const InteractiveAnswersValidator: {
	showValidationResults(value: string, ...funcs: Function[]): string | boolean;
	validateFieldIsNotEmpty(fieldValue: string): boolean;
	validateAlphanumericHyphenUnderscoreExtended(fieldValue: string): boolean;
	validateFieldHasNoSpaces(fieldValue: string): boolean;
	validateFieldIsLowerCase(fieldOptionId: string, fieldValue: string): boolean;
	validatePublisherId(fieldValue: string): boolean;
	validateProjectVersion(fieldValue: string): boolean;
	validateArrayIsNotEmpty(array: any[]): boolean;
	validateSuiteApp(fieldValue: string): boolean;
	validateScriptId(fieldValue: string): boolean;
	validateXMLCharacters(fieldValue: string): boolean;
	validateNotUndefined(value: string, optionName: string): boolean;
	validateProjectType(value: string): boolean;
	validateSameAuthID(newAuthID: string, authID: string): boolean;
	validateAuthIDNotInList(newAuthID: string, authIDsList: string[]): boolean;
	validateAlphanumericHyphenUnderscore(fieldValue: string): boolean;
	validateMaximumLength(fieldValue: string, maxLength: number): boolean;
	validateNonProductionAccountSpecificDomain(fieldValue: string): boolean;
	validateNonProductionDomain(fieldValue: string): boolean;
} = require('@oracle/suitecloud-cli/src/validation/InteractiveAnswersValidator');
