/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

export const STATUS = {
	SUCCESS: 'SUCCESS',
	ERROR: 'ERROR',
};

export function getResultMessage(operationResult: { resultMessage: string }) {
	const { resultMessage } = operationResult;
	return resultMessage ? resultMessage : '';
}
