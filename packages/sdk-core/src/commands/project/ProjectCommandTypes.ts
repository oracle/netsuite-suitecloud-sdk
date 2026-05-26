/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

export const PROJECT_COMMAND = {
	DEPLOY: 'deploy',
	PREVIEW: 'preview',
	VALIDATE: 'validate',
} as const;

export const SDK_OPERATION_STATUS = {
	SUCCESS: 'SUCCESS',
	ERROR: 'ERROR',
} as const;

export type ProjectCommandType = typeof PROJECT_COMMAND[keyof typeof PROJECT_COMMAND];

export type SdkOperationStatus = typeof SDK_OPERATION_STATUS[keyof typeof SDK_OPERATION_STATUS];

export type ProjectCommandSummaryContext = {
	accountName?: string;
	roleName?: string;
	projectName?: string;
	suiteAppId?: string;
	localTimestamp?: string;
};

export type OperationResult = {
	status: SdkOperationStatus;
	data?: unknown;
	resultMessage?: string;
	httpStatusCode?: number;
	errorCode?: string;
	errorMessages?: string[];
};
