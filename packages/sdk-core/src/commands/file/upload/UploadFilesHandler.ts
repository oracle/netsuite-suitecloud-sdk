/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import {
	executeUploadFiles,
	type FileCommandAuthInput,
	type FileCommandOperationResult,
} from '../FileCommandExecutor';

export const UPLOAD_FILES_COMMAND_OPTIONS = {
	PATHS: 'paths',
	PROJECT: 'project',
	AUTH_ID: 'authid',
} as const;

type UploadFilesParams = {
	paths?: string | string[];
	project?: string;
	authid?: string;
	[key: string]: unknown;
};

export type UploadFilesExecutionInput = FileCommandAuthInput & {
	projectFolder: string;
	filePaths: string[];
};

export function prepareUploadFilesParams(
	params: UploadFilesParams,
	projectFolder: string,
	authId: string
): UploadFilesParams {
	const normalizedParams = { ...params };
	const paths = normalizedParams[UPLOAD_FILES_COMMAND_OPTIONS.PATHS];

	if (paths !== undefined) {
		if (Array.isArray(paths)) {
			normalizedParams[UPLOAD_FILES_COMMAND_OPTIONS.PATHS] = paths.map(quoteString).join(' ');
		} else if (typeof paths === 'string') {
			normalizedParams[UPLOAD_FILES_COMMAND_OPTIONS.PATHS] = quoteString(paths);
		}
	}

	normalizedParams[UPLOAD_FILES_COMMAND_OPTIONS.PROJECT] = quoteString(projectFolder);
	normalizedParams[UPLOAD_FILES_COMMAND_OPTIONS.AUTH_ID] = authId;

	return normalizedParams;
}

function quoteString(value: string): string {
	return `"${value}"`;
}

export async function executeUploadFilesCommand(
	input: UploadFilesExecutionInput
): Promise<FileCommandOperationResult> {
	return executeUploadFiles(input);
}
