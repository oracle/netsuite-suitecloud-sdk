/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

export const FILE_COMMAND_STATUS = {
	SUCCESS: 'SUCCESS',
	ERROR: 'ERROR',
} as const;

export type FileCommandStatus = (typeof FILE_COMMAND_STATUS)[keyof typeof FILE_COMMAND_STATUS];

export type FileCommandOperationResult = {
	status: FileCommandStatus;
	data?: unknown;
	resultMessage?: string;
	httpStatusCode?: number;
	errorMessages?: string[];
};

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
};
export type UploadFilesExecutionInput = FileCommandAuthInput & {
	projectFolder: string;
	filePaths: string[];
};
