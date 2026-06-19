/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

// Java source of truth:
// - cli/.../handler/AuthenticateCIHandler.java (default production URL behavior)
// - core/.../delegate/authentication/AuthenticateClientCredentialsDelegate.java (private key cleanup)
const PRODUCTION_URL = 'system.netsuite.com';
const BEGIN_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----';
const END_PRIVATE_KEY = '-----END PRIVATE KEY-----';
const CARRIAGE_RETURN = '\r';
const NEWLINE_FEED = '\n';

export type SetupCiParams = {
	account?: string;
	authid?: string;
	certificateid?: string;
	privatekeypath?: string;
	domain?: string;
	select?: string;
	[key: string]: unknown;
};

export function normalizeSetupCiParams(params: SetupCiParams, genericDomain: string = PRODUCTION_URL): SetupCiParams {
	const normalizedParams: SetupCiParams = { ...params };

	if (typeof normalizedParams.account === 'string') {
		normalizedParams.account = normalizedParams.account.toUpperCase();
	}

	// Java command defaults to production URL when url is omitted.
	// Keep CLI parameters aligned by omitting domain when the generic production domain is selected.
	const domain = normalizedParams.domain;
	if (
		domain == null ||
		domain === '' ||
		domain === genericDomain ||
		domain === PRODUCTION_URL
	) {
		delete normalizedParams.domain;
	}

	return normalizedParams;
}

export function getSetupCiAuthId(params: SetupCiParams, isSetupMode: boolean): string | undefined {
	return isSetupMode ? (params.authid as string | undefined) : (params.select as string | undefined);
}

export function cleanPrivateKey(privateKey: string): string {
	return privateKey
		.split(BEGIN_PRIVATE_KEY).join('')
		.split(CARRIAGE_RETURN).join('')
		.split(NEWLINE_FEED).join('')
		.split(END_PRIVATE_KEY).join('');
}
