/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

export const PROXY_START_OPTIONS = {
	AUTH_ID: 'authid',
	PORT: 'port',
	API_KEY: 'apiKey',
} as const;

export const PROXY_START_VALIDATION_ERROR = {
	INVALID_PORT: 'INVALID_PORT',
} as const;

export type ProxyStartValidationResult = {
	isValid: boolean;
	errorCode?: typeof PROXY_START_VALIDATION_ERROR[keyof typeof PROXY_START_VALIDATION_ERROR];
};

export type AuthIdChoice = {
	authId: string;
	roleName?: string;
	companyName?: string;
};

export function validateProxyStartPort(port: number, minPort: number, maxPort: number): ProxyStartValidationResult {
	if (Number.isNaN(port) || port < minPort || port > maxPort) {
		return { isValid: false, errorCode: PROXY_START_VALIDATION_ERROR.INVALID_PORT };
	}

	return { isValid: true };
}

export function normalizeProxyStartPort(port: unknown): number {
	return Number(port);
}

export function buildProxyStartAuthIdChoices(authIdData: Record<string, { accountInfo?: { companyName?: string; roleName?: string } }>): AuthIdChoice[] {
	const authIds = Object.keys(authIdData || {}).sort();
	return authIds.map((authId) => ({
		authId,
		roleName: authIdData[authId]?.accountInfo?.roleName,
		companyName: authIdData[authId]?.accountInfo?.companyName,
	}));
}

export function buildProxyStartActionData(authId: string, port: number): { authId: string; port: number } {
	return { authId, port };
}
