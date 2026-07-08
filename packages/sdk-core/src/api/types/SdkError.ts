/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

export const ErrorCodes = {
	FILE_ALREADY_EXISTS: 'FILE_ALREADY_EXISTS',
	INVALID_FILE_CABINET_PATH: 'INVALID_FILE_CABINET_PATH',
	INVALID_PROJECT_TYPE: 'INVALID_PROJECT_TYPE',
	INVALID_SUITESCRIPT_MODULE: 'INVALID_SUITESCRIPT_MODULE',
	INVALID_SUITESCRIPT_TYPE: 'INVALID_SUITESCRIPT_TYPE',
	MISSING_REQUIRED_PARAMETER: 'MISSING_REQUIRED_PARAMETER',
	PATH_OUTSIDE_FILE_CABINET: 'PATH_OUTSIDE_FILE_CABINET',
	PROJECT_CREATION_ERROR: 'PROJECT_CREATION_ERROR',
	UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export class SdkError extends Error {
	constructor(
		message: string,
		readonly code: ErrorCode = ErrorCodes.UNKNOWN_ERROR
	) {
		super(message);
		this.name = 'SdkError';
	}
}
