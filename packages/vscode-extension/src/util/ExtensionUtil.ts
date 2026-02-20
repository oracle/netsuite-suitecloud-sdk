/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import type { ActionResult, AuthListData } from '../types/ActionResult';
import type { ConsoleLoggerConstructor, ExecutionEnvironmentContextConstructor, ExecutionEnvironmentContextInstance, SdkOperationResult, SuiteCloudAuthProxyServiceConstructor } from '../types/JavascriptNodeCli';


export const SUITESCRIPT_TYPES: { id: string; name: string }[] = require('@oracle/suitecloud-cli/src/metadata/SuiteScriptTypesMetadata');
export const SUITESCRIPT_MODULES: { id: string }[] = require('@oracle/suitecloud-cli/src/metadata/SuiteScriptModulesMetadata');

export const objectTypes: {
	name: string;
	value: { name: string; type: string; prefix: string; hasRelatedFiles: boolean; relatedFiles?: { type: string }[] };
}[] = require('@oracle/suitecloud-cli/src/metadata/ObjectTypesMetadata');
objectTypes.sort((a, b) => (a.value.type > b.value.type ? 1 : -1));

export const ApplicationConstants = require('@oracle/suitecloud-cli/src/ApplicationConstants');

export const actionResultStatus: {
	SUCCESS: string;
	ERROR: string;
} = require('@oracle/suitecloud-cli/src/services/actionresult/ActionResult').STATUS;

export const ExecutionEnvironmentContext: ExecutionEnvironmentContextConstructor = require('@oracle/suitecloud-cli/src/ExecutionEnvironmentContext');


export const CommandActionExecutor = require('@oracle/suitecloud-cli/src/core/CommandActionExecutor');
export const CommandsMetadataService = require('@oracle/suitecloud-cli/src/core/CommandsMetadataService');
export const CommandOptionsValidator = require('@oracle/suitecloud-cli/src/core/CommandOptionsValidator');
export const CLIConfigurationService = require('@oracle/suitecloud-cli/src/core/extensibility/CLIConfigurationService');
export const ConsoleLogger: ConsoleLoggerConstructor = require('@oracle/suitecloud-cli/src/loggers/ConsoleLogger');
export const AccountFileCabinetService = require('@oracle/suitecloud-cli/src/services/AccountFileCabinetService');
export const EnvironmentInformationService = require('@oracle/suitecloud-cli/src/services/EnvironmentInformationService');
export const FileCabinetService = require('@oracle/suitecloud-cli/src/services/FileCabinetService');
export const FileSystemService = require('@oracle/suitecloud-cli/src/services/FileSystemService');
export const ProjectInfoService = require('@oracle/suitecloud-cli/src/services/ProjectInfoService');
export const TranslationService = require('@oracle/suitecloud-cli/src/services/TranslationService');
export const ExecutionContextService: {
	validateBrowserBasedAuthIsAllowed(): void;
	validateMachineToMachineAuthIsAllowed(): void;
	getBrowserBasedWarningMessages(): string | void;
} = require('@oracle/suitecloud-cli/src/services/ExecutionContextService');
export const AuthenticationUtils: {
	[key: string]: any;
	getProjectDefaultAuthId(projectFolder?: string): string;
	getAuthIds(sdkPath: string): Promise<ActionResult<AuthListData>>;
	refreshAuthorization(authid: string, sdkPath: string, executionEnvironmentContext: ExecutionEnvironmentContextInstance): Promise<SdkOperationResult<null>>
} = require('@oracle/suitecloud-cli/src/utils/AuthenticationUtils');

/**
 * Approach for adapting a JavaScript class for TypeScript use:
 * 
 * 1. Define TypeScript type definitions for both the class instance and the class constructor.
 * 2. Import the JavaScript class using the constructor type for proper typing support.
 * 3. Create a new TypeScript class that extends the (typed) imported JavaScript class, with an empty body.
 * 
 * By extending from the typed JavaScript class, the new TypeScript class inherits the code implementation from the original JavaScript class,
 * while also gaining type safety. This makes it possible to use the new TypeScript class as both the constructor and instance type—enabling seamless,
 * type-safe integration of legacy JavaScript classes in TypeScript.
 */
const SuiteCloudAuthProxyServiceTypedJSClass: SuiteCloudAuthProxyServiceConstructor = require('@oracle/suitecloud-cli/src/services/SuiteCloudAuthProxyService').SuiteCloudAuthProxyService;
export class SuiteCloudAuthProxyService extends SuiteCloudAuthProxyServiceTypedJSClass { };

export const AccountCredentialsFormatter: {
	getInfoString(accountCredentials: any): string;
} = require('@oracle/suitecloud-cli/src/utils/AccountCredentialsFormatter');
export const FileUtils : {
	readAsJson(filePath: string) : any;
	readAsString(fileName: string) : string;
	exists(fileName: string) : boolean;
	createDirectory(dirPath: string) : void;
} = require('@oracle/suitecloud-cli/src/utils/FileUtils');

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
	validateSuiteScriptFileDoesNotExist(parentFolderPath: string, filename: string): string | boolean;
	validateFolderDoesNotExist(path: string): boolean;
	validateFileName(fileName: string): boolean;
} = require('@oracle/suitecloud-cli/src/validation/InteractiveAnswersValidator');
