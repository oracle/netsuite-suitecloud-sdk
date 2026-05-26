/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const AUTH_RETRY_HTTP_STATUS_CODES = new Set([401, 403]);
const AUTH_RETRY_ERROR_PATTERNS = [/authenticat/i, /authoriz/i, /invalid login/i];

type AuthSession = {
	hostName: string;
	accessToken: string;
	accountInfo?: {
		companyName?: string;
		roleName?: string;
		[key: string]: unknown;
	};
};

type AuthSessionProvider = {
	resolveAuthSession: (authId: string) => Promise<AuthSession>;
	refreshAuthSession: (authId: string) => Promise<AuthSession>;
};

type ExecuteWithAuthRetryInput<T> = {
	authId: string;
	authSessionProvider: AuthSessionProvider;
	executeWithAuthSession: (authSession: AuthSession) => Promise<T>;
	shouldRetryAuth?: (result: T) => boolean;
	maxAttempts?: number;
};

export function shouldRetryAuthByResult(operationResult: any): boolean {
	if (!operationResult || operationResult.status !== 'ERROR') {
		return false;
	}
	if (AUTH_RETRY_HTTP_STATUS_CODES.has(operationResult.httpStatusCode)) {
		return true;
	}
	if (!Array.isArray(operationResult.errorMessages)) {
		return false;
	}
	return operationResult.errorMessages.some((errorMessage: unknown) =>
		AUTH_RETRY_ERROR_PATTERNS.some((pattern) => pattern.test(String(errorMessage)))
	);
}

export async function executeWithAuthRetry<T>(input: ExecuteWithAuthRetryInput<T>): Promise<T> {
	validateExecuteWithAuthRetryInput(input);
	const maxAttempts = input.maxAttempts && input.maxAttempts > 0 ? Math.min(input.maxAttempts, 2) : 2;
	const shouldRetryAuth = input.shouldRetryAuth || shouldRetryAuthByResult;

	let authSession = await input.authSessionProvider.resolveAuthSession(input.authId);
	let result = await input.executeWithAuthSession(authSession);
	if (!shouldRetryAuth(result) || maxAttempts === 1) {
		return result;
	}

	authSession = await input.authSessionProvider.refreshAuthSession(input.authId);
	result = await input.executeWithAuthSession(authSession);
	return result;
}

function validateExecuteWithAuthRetryInput<T>(input: ExecuteWithAuthRetryInput<T>): void {
	if (!input) {
		throw new Error('Auth retry execution input is required.');
	}
	if (!input.authId) {
		throw new Error('Auth ID is required for auth retry execution.');
	}
	if (!input.authSessionProvider) {
		throw new Error('Auth session provider is required for auth retry execution.');
	}
	if (typeof input.authSessionProvider.resolveAuthSession !== 'function') {
		throw new Error('Auth session provider resolveAuthSession function is required.');
	}
	if (typeof input.authSessionProvider.refreshAuthSession !== 'function') {
		throw new Error('Auth session provider refreshAuthSession function is required.');
	}
	if (typeof input.executeWithAuthSession !== 'function') {
		throw new Error('executeWithAuthSession function is required.');
	}
}
