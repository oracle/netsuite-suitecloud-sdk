/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import {
	executeUpdateObjects,
	executeUpdateCustomRecordWithInstances,
	type ObjectCommandOperationResult,
	type UpdateObjectResultItem,
	type UpdateObjectsExecutionInput,
	type UpdateCustomRecordWithInstancesExecutionInput,
} from '../ObjectCommandExecutor';

export const UPDATE_OBJECTS_COMMAND_OPTIONS = {
	AUTH_ID: 'authid',
	PROJECT: 'project',
	SCRIPT_ID: 'scriptid',
	INCLUDE_INSTANCES: 'includeinstances',
} as const;

export async function executeUpdateObjectsCommand(
	input: UpdateObjectsExecutionInput
): Promise<ObjectCommandOperationResult<UpdateObjectResultItem[]>> {
	return executeUpdateObjects(input);
}

export async function executeUpdateCustomRecordWithInstancesCommand(
	input: UpdateCustomRecordWithInstancesExecutionInput
): Promise<ObjectCommandOperationResult<string>> {
	return executeUpdateCustomRecordWithInstances(input);
}
