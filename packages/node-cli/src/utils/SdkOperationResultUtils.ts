/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';


enum STATUS {
	SUCCESS = 'SUCCESS',
	ERROR = 'ERROR',
};

interface SuccessOperationResult<T> {
	status: STATUS.SUCCESS,
	resultMessage?: string;
	data: T;
}

interface ErrorOperationResult {
	status: STATUS.ERROR,
	errorMessages: string[];
}

export type OperationResult<T> = SuccessOperationResult<T> | ErrorOperationResult;

export function isSuccess<T>(operationResult: OperationResult<T>): operationResult is SuccessOperationResult<T> {
	return operationResult.status === STATUS.SUCCESS;
}

export function getResultMessage(operationResult: { resultMessage: string }) {
	const { resultMessage } = operationResult;
	return resultMessage ? resultMessage : '';
}
