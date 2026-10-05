/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

/**
 * Stable status values shared by every sdk-core operation.
 *
 * Command-specific status constants remain available as compatibility aliases.
 */
export const SDK_OPERATION_STATUS = {
	SUCCESS: 'SUCCESS',
	ERROR: 'ERROR',
} as const;

export type SdkOperationStatus =
	(typeof SDK_OPERATION_STATUS)[keyof typeof SDK_OPERATION_STATUS];

/**
 * Common boundary returned by sdk-core workflows.
 *
 * Domain-specific result types should extend or alias this type instead of
 * introducing a different success/error shape.
 */
export type SuccessResult<T = unknown> = {
	status: typeof SDK_OPERATION_STATUS.SUCCESS;
	data?: T;
	resultMessage?: string;
	httpStatusCode?: never;
	errorCode?: never;
	errorMessages?: never;
};

export type ErrorResult = {
	status: typeof SDK_OPERATION_STATUS.ERROR;
	httpStatusCode?: number;
	errorCode?: string;
	errorMessages: string[];
	data?: never;
	resultMessage?: never;
};

/** A discriminated result that prevents mixing success data with error details. */
export type OperationResult<T = unknown> = SuccessResult<T> | ErrorResult;
