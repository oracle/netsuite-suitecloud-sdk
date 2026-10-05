/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import type {
	ObjectCommandOperationResult,
	UpdateCustomRecordWithInstancesExecutionInput,
	UpdateObjectResultItem,
	UpdateObjectsExecutionInput,
} from '../../../api/object/ObjectCommand';
import {
	executeUpdateObjects,
} from './UpdateObjectsExecutor';
import { executeUpdateCustomRecordWithInstances } from './UpdateCustomRecordExecutor';

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
