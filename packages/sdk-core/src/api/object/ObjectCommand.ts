/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

export const OBJECT_COMMAND_STATUS = {
	SUCCESS: 'SUCCESS',
	ERROR: 'ERROR',
} as const;

export type ObjectCommandStatus = (typeof OBJECT_COMMAND_STATUS)[keyof typeof OBJECT_COMMAND_STATUS];
export type ObjectCommandOperationResult<T = unknown> = {
	status: ObjectCommandStatus;
	data?: T;
	resultMessage?: string;
	httpStatusCode?: number;
	errorMessages?: string[];
};

export type ObjectCommandAuthInput = {
	hostName: string;
	accessToken: string;
	userAgent?: string;
	timeoutMs?: number;
};
export type ListObjectsExecutionInput = ObjectCommandAuthInput & {
	appId?: string;
	scriptIdContains?: string;
	objectTypes?: string[];
};
export type ImportObjectsExecutionInput = ObjectCommandAuthInput & {
	projectFolder: string;
	targetFolder: string;
	scriptIds: string[];
	objectType: string;
	appId?: string;
	excludeFiles: boolean;
};
export type UpdateObjectsExecutionInput = ObjectCommandAuthInput & {
	projectFolder: string;
	scriptIds: string[];
};
export type UpdateCustomRecordWithInstancesExecutionInput = ObjectCommandAuthInput & {
	projectFolder: string;
	scriptId: string;
};
export type CustomObjectInfo = { type: string; scriptId: string; appId?: string };
export type ImportObjectStatusItem = {
	id: string;
	type: string;
	appId?: string;
	result?: { code?: string; message?: string };
};
export type ReferencedFileImportResult = { path: string; message?: string };
export type ObjectImportResultItem = {
	customObject: {
		id: string;
		type: string;
		appId?: string;
		result?: { code?: string; message?: string };
	};
	referencedFileImportResult: {
		successfulImports: ReferencedFileImportResult[];
		failedImports: ReferencedFileImportResult[];
	};
};
export type ImportObjectsResult = {
	successfulImports: ObjectImportResultItem[];
	failedImports: ObjectImportResultItem[];
};
export type UpdateObjectResultItem = {
	key: string;
	type: 'SUCCESS' | 'ERROR';
	message: string;
};
