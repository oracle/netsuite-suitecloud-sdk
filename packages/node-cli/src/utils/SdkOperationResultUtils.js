/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

module.exports = {
	// TODO: we could be always wrapping OperationResults whenever we run sdkCommand using the sdkExecutor with the SdkOperationResult.js class
	// and then use SdkOperationResult.isSuccess() method instead of (operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS)
	// Also the SdkOperationResult.js class allows to type using jsdocs the return type of any sdkCommand, as done in AuthenticationUtils.refreshAuthorization
	STATUS: {
		SUCCESS: 'SUCCESS',
		ERROR: 'ERROR',
	},

	getResultMessage: (operationResult) => {
		const { resultMessage } = operationResult;
		return resultMessage ? resultMessage : '';
	},
};
