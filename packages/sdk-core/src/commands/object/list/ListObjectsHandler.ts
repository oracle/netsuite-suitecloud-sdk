/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import {
	executeListObjects,
	type ListObjectsExecutionInput,
	type ObjectCommandOperationResult,
	type CustomObjectInfo,
} from '../ObjectCommandExecutor';

export const LIST_OBJECTS_COMMAND_OPTIONS = {
	AUTH_ID: 'authid',
	APP_ID: 'appid',
	SCRIPT_ID: 'scriptid',
	TYPE: 'type',
} as const;

type ListObjectsParams = {
	authid?: string;
	appid?: string;
	scriptid?: string;
	type?: string | string[];
	[key: string]: unknown;
};

export function prepareListObjectsParams(params: ListObjectsParams, authId: string): ListObjectsParams {
	return {
		...params,
		[LIST_OBJECTS_COMMAND_OPTIONS.AUTH_ID]: authId,
	};
}

export async function executeListObjectsCommand(
	input: ListObjectsExecutionInput
): Promise<ObjectCommandOperationResult<CustomObjectInfo[]>> {
	return executeListObjects(input);
}

export function parseObjectTypes(value: unknown): string[] | undefined {
	if (!value) {
		return undefined;
	}
	if (Array.isArray(value)) {
		const types = value.map((item) => String(item).trim()).filter(Boolean);
		return types.length ? types : undefined;
	}
	const tokens = String(value)
		.trim()
		.split(/\s+/)
		.map((item) => item.trim())
		.filter(Boolean);
	return tokens.length ? tokens : undefined;
}
