/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

export {
	COMMAND_OPTIONS,
	MANAGE_AUTH_ACTION,
	MANAGE_AUTH_VALIDATION_ERROR,
	prepareManageAuthActionData,
	prepareManageAuthInfoData,
	sanitizeManageAuthListData,
	selectManageAuthAction,
	validateManageAuthOptions,
} from '../commands/account/manageauth/ManageAuthHandler';
export {
	FILE_COMMAND_STATUS,
	executeImportFiles,
	executeListFiles,
	executeListFolders,
	executeUploadFiles,
} from '../commands/file/FileCommandExecutor';
export { executeCreateFile, FILE_CREATE_STATUS } from '../commands/file/create/CreateFileExecutor';
export {
	buildCreateFileResultData,
	CREATE_FILE_COMMAND_OPTIONS,
	normalizeCreateFileParams,
} from '../commands/file/create/CreateFileHandler';
export {
	addCompareFilesImportFlag,
	addImportCallMetadata,
	executeImportFilesCommand,
	IMPORT_FILES_COMMAND_OPTIONS,
	prepareImportFilesParams,
} from '../commands/file/import/ImportFilesHandler';
export {
	executeListFilesCommand,
	executeListFoldersCommand,
	LIST_FILES_COMMAND_OPTIONS,
	prepareListFilesParams,
} from '../commands/file/list/ListFilesHandler';
export {
	executeUploadFilesCommand,
	prepareUploadFilesParams,
	UPLOAD_FILES_COMMAND_OPTIONS,
} from '../commands/file/upload/UploadFilesHandler';
export {
	executeImportObjects,
	executeListObjects,
	executeUpdateCustomRecordWithInstances,
	executeUpdateObjects,
	OBJECT_COMMAND_STATUS,
} from '../commands/object/ObjectCommandExecutor';
export {
	executeImportObjectsCommand,
	IMPORT_OBJECTS_COMMAND_OPTIONS,
} from '../commands/object/import/ImportObjectsHandler';
export {
	executeListObjectsCommand,
	LIST_OBJECTS_COMMAND_OPTIONS,
	parseObjectTypes,
	prepareListObjectsParams,
} from '../commands/object/list/ListObjectsHandler';
export {
	executeUpdateCustomRecordWithInstancesCommand,
	executeUpdateObjectsCommand,
	UPDATE_OBJECTS_COMMAND_OPTIONS,
} from '../commands/object/update/UpdateObjectsHandler';
export {
	executeProjectCommand,
	PROJECT_COMMAND,
	SDK_OPERATION_STATUS,
} from '../commands/project/ProjectCommandExecutor';
export {
	CREATE_PROJECT_OPERATION_STATUS,
	executeCreateProject,
} from '../commands/project/create/CreateProjectExecutor';
export {
	buildCreateProjectSdkParams,
	CREATE_PROJECT_COMMAND_OPTIONS,
	ensureCreateProjectLocation,
	getProjectFolderName,
	toIncludeUnitTestingBoolean,
} from '../commands/project/create/CreateProjectHandler';
export { executeCreateProjectWorkflow } from '../commands/project/create/CreateProjectWorkflowExecutor';
export {
	DEPLOY_COMMAND,
	DEPLOY_MODE,
	DEPLOY_VALIDATION_ERROR,
	getPreviewCommandName,
	isApplyInstallationPreferencesForDeploy,
	prepareDeployExecution,
} from '../commands/project/deploy/DeployHandler';
export {
	executePackageCommand,
	PACKAGE_COMMAND_OPTIONS,
	preparePackageParams,
} from '../commands/project/package/PackageHandler';
export {
	executePackageProject,
	PACKAGE_PROJECT_OPERATION_STATUS,
} from '../commands/project/package/PackageProjectExecutor';
export { prepareValidateExecution, VALIDATE_COMMAND } from '../commands/project/validate/ValidateHandler';
export {
	buildProxyGenerateKeyResult,
	generateProxyApiKey,
	parseClientApiKeyContent,
	PROXY_GENERATE_KEY_ERROR,
} from '../commands/proxy/generatekey/ProxyGenerateKeyHandler';
export {
	buildProxyStartActionData,
	buildProxyStartAuthIdChoices,
	normalizeProxyStartPort,
	PROXY_START_OPTIONS,
	PROXY_START_VALIDATION_ERROR,
	validateProxyStartPort,
} from '../commands/proxy/start/ProxyStartHandler';
