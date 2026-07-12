/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

export {
	SDK_OPERATION_STATUS,
	type ErrorResult,
	type OperationResult,
	type SdkOperationStatus,
	type SuccessResult,
} from './api/OperationResult';
export {
	PROJECT_COMMAND,
	type ProjectCommandSummaryContext,
	type ProjectCommandType,
} from './api/project/ProjectCommand';
export {
	createSdkCore,
	type SdkCore,
	type SdkCoreDependencies,
} from './SdkCore';
export type {
	ProjectActionDependencies,
	ProjectActionInput,
} from './actions/project/ProjectAction';
