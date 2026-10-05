/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const NodeTranslationService = require('../services/NodeTranslationService');
const { SUITECLOUD_AUTH_PROXY_SERVICE } = require('../services/TranslationKeys');
const { getAuthCredentialsById } = require('./AuthenticationUtils');

const AUTH_RETRY_HTTP_STATUS_CODES = new Set([401, 403]);
const AUTH_RETRY_ERROR_PATTERNS = [/authenticat/i, /authoriz/i, /invalid login/i];

async function getAuthCredentialsForProjectCommand(sdkPath, authId) {
	if (!authId) {
		throw NodeTranslationService.getMessage(SUITECLOUD_AUTH_PROXY_SERVICE.MISSING_AUTH_ID);
	}
	return getAuthCredentialsById(authId, sdkPath);
}

async function refreshAuthCredentialsForProjectCommand(sdkPath, authId, executionEnvironmentContext) {
	return getAuthCredentialsById(authId, sdkPath, executionEnvironmentContext);
}

function shouldRetryProjectCommandAuth(operationResult) {
	if (!operationResult || operationResult.status !== 'ERROR') {
		return false;
	}

	if (AUTH_RETRY_HTTP_STATUS_CODES.has(operationResult.httpStatusCode)) {
		return true;
	}

	if (!Array.isArray(operationResult.errorMessages)) {
		return false;
	}

	return operationResult.errorMessages.some((errorMessage) =>
		AUTH_RETRY_ERROR_PATTERNS.some((pattern) => pattern.test(String(errorMessage)))
	);
}

module.exports = {
	getAuthCredentialsForProjectCommand,
	refreshAuthCredentialsForProjectCommand,
	shouldRetryProjectCommandAuth,
};
