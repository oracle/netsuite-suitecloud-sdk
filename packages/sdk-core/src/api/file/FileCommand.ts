/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import {
	SDK_OPERATION_STATUS,
	type ErrorResult,
	type OperationResult,
	type SdkOperationStatus,
	type SuccessResult,
} from '../OperationResult';

/** Compatibility alias for existing command consumers. */
export const FILE_COMMAND_STATUS = SDK_OPERATION_STATUS;

export type FileCommandStatus = SdkOperationStatus;

export type FileCommandOperationResult<T = unknown> = OperationResult<T>;

export type ImportFileResult = {
	path: string;
	loaded: boolean;
	message: string;
};

export type ImportFilesResult = {
	results: ImportFileResult[];
};

export type ImportFilesOperationResult =
	| (SuccessResult<ImportFilesResult> & { data: ImportFilesResult })
	| ErrorResult;

export type FileCommandAuthInput = {
	hostName: string;
	accessToken: string;
	userAgent?: string;
	timeoutMs?: number;
};

export type ListFilesExecutionInput = FileCommandAuthInput & { folderPath: string };
export type ListFoldersExecutionInput = FileCommandAuthInput;
export type ImportFilesExecutionInput = FileCommandAuthInput & {
	projectFolder: string;
	filePaths: string[];
	excludeProperties: boolean;
	allowSuiteAppPaths?: boolean;
};
export type UploadFilesExecutionInput = FileCommandAuthInput & {
	projectFolder: string;
	filePaths: string[];
};
