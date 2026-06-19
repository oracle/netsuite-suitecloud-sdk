/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

// Java source of truth:
// - cli/.../handler/AuthenticateHandler.java (default production URL behavior)
const PRODUCTION_URL = 'system.netsuite.com';

export type SetupParams = {
	url?: string;
	[key: string]: unknown;
};

export function normalizeSetupParams(params: SetupParams, genericDomain: string = PRODUCTION_URL): SetupParams {
	const normalizedParams = { ...params };
	const url = normalizedParams.url;

	if (url == null || url === '' || url === genericDomain || url === PRODUCTION_URL) {
		delete normalizedParams.url;
	}

	return normalizedParams;
}
