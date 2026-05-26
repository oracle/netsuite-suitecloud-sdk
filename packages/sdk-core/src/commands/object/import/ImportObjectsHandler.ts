/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import {
	executeImportObjects,
	type ImportObjectsExecutionInput,
	type ImportObjectsResult,
	type ObjectCommandOperationResult,
} from '../ObjectCommandExecutor';

export const IMPORT_OBJECTS_COMMAND_OPTIONS = {
	AUTH_ID: 'authid',
	APP_ID: 'appid',
	SCRIPT_ID: 'scriptid',
	TYPE: 'type',
	DESTINATION_FOLDER: 'destinationfolder',
	PROJECT: 'project',
	EXCLUDE_FILES: 'excludefiles',
} as const;

export async function executeImportObjectsCommand(
	input: ImportObjectsExecutionInput
): Promise<ObjectCommandOperationResult<ImportObjectsResult>> {
	return executeImportObjects(input);
}
