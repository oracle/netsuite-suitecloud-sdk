/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import {
	executeListFiles,
	executeListFolders,
	type FileCommandAuthInput,
	type FileCommandOperationResult,
} from '../FileCommandExecutor';

export const LIST_FILES_COMMAND_OPTIONS = {
	AUTH_ID: 'authid',
	FOLDER: 'folder',
} as const;

type ListFilesParams = {
	authid?: string;
	folder?: string;
	[key: string]: unknown;
};

export type ListFilesExecutionInput = FileCommandAuthInput & {
	folderPath: string;
};

export function prepareListFilesParams(params: ListFilesParams, authId: string): ListFilesParams {
	const normalizedParams = { ...params };
	normalizedParams[LIST_FILES_COMMAND_OPTIONS.AUTH_ID] = authId;

	if (typeof normalizedParams[LIST_FILES_COMMAND_OPTIONS.FOLDER] === 'string') {
		normalizedParams[LIST_FILES_COMMAND_OPTIONS.FOLDER] = quoteString(
			normalizedParams[LIST_FILES_COMMAND_OPTIONS.FOLDER] as string
		);
	}

	return normalizedParams;
}

function quoteString(value: string): string {
	return `"${value}"`;
}

export async function executeListFilesCommand(
	input: ListFilesExecutionInput
): Promise<FileCommandOperationResult> {
	return executeListFiles(input);
}

export async function executeListFoldersCommand(
	input: FileCommandAuthInput
): Promise<FileCommandOperationResult> {
	return executeListFolders(input);
}
