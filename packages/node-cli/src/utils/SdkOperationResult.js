/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const assert = require('assert');

/* 
// Sample SdkOperation results
const SdkOperationResultSuccess =
{
	status: 'SUCCESS',
	data: { needsReauthorization: true },
	errorMessages: []
}
// data: could be of any shape/type of object

const SdkOperationResultError =
{
	status: 'ERROR',
	errorCode: 'SAS0001',
	errorMessages: [
		'The authentication process has been interrupted.\r\n' +
		'The request was canceled.'
	]
}
 */
const STATUS = {
	SUCCESS: 'SUCCESS',
	ERROR: 'ERROR',
}
module.exports = class SdkOperationResult {
	status;
	data;
	resultMessage;
	errorCode;
	errorMessages;

	constructor(rawOpertionResult) {
		assert(rawOpertionResult)
		assert(rawOpertionResult.status, 'status is required when creating an SdkOperationResult object.')
		// Note: not checking existence of rawOpertionResult.data when status === SUCCESS as refrehAuthorization command returns successfully without data
		if (rawOpertionResult.status === STATUS.ERROR) {
			assert(rawOpertionResult.errorMessages, 'errorMessages is required when SdkOperationResult is an error.');
			assert(Array.isArray(rawOpertionResult.errorMessages), 'errorMessages property must be an array');
		}
		this.status = rawOpertionResult.status;
		this.data = rawOpertionResult.data;
		this.resultMessage = rawOpertionResult.resultMessage;
		this.errorCode = rawOpertionResult.errorCode;
		this.errorMessages = rawOpertionResult.errorMessages;
	}

	isSuccess() {
		return this.status === STATUS.SUCCESS
	}

	get errorMessages() {
		if (this.status === STATUS.SUCCESS) {
			throw 'Accessing errorMessages on a successful SdkOperationResult'
		}
		this.errorMessages;
	}

	get resultMessage() {
		return this.resultMessage ? this.resultMessage : '';
	}
}