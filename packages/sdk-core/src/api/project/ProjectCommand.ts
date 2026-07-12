/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import {
	SDK_OPERATION_STATUS,
	type OperationResult as SharedOperationResult,
	type SdkOperationStatus,
} from '../OperationResult';

export { SDK_OPERATION_STATUS };
export type { SdkOperationStatus };

export const PROJECT_COMMAND = {
	DEPLOY: 'deploy',
	PREVIEW: 'preview',
	VALIDATE: 'validate',
} as const;

export type ProjectCommandType = (typeof PROJECT_COMMAND)[keyof typeof PROJECT_COMMAND];

export type ProjectCommandSummaryContext = {
	accountName?: string;
	roleName?: string;
	projectName?: string;
	suiteAppId?: string;
	localTimestamp?: string;
};

export type OperationResult<T = unknown> = SharedOperationResult<T>;
