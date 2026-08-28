/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { SUITECLOUD_PANEL_RUNTIME_STRINGS } from './Strings';

export const formatProxyStartError = (
	errorMessage: string,
	getBundledCliVersion: () => string
): string => {
	const normalizedMessage = (errorMessage || '').toLowerCase();
	const friendlyErrors = SUITECLOUD_PANEL_RUNTIME_STRINGS.friendlyErrors;

	if (normalizedMessage.startsWith('unable to start suitecloud proxy process:')) {
		return `${errorMessage}${friendlyErrors.outputHint}`;
	}
	if (normalizedMessage.includes('invalid or corrupt jarfile')) {
		return friendlyErrors.sdkJarInvalid;
	}
	if (normalizedMessage.includes('proxy:start') && normalizedMessage.includes('does not exist')) {
		return friendlyErrors.proxyStartMissing(getBundledCliVersion());
	}
	if (
		normalizedMessage.includes('client api key file') ||
		normalizedMessage.includes('client_api_key.p12') ||
		normalizedMessage.includes('secure storage') ||
		normalizedMessage.includes('passkey')
	) {
		return friendlyErrors.apiKeyStorage(errorMessage);
	}
	if (
		normalizedMessage.includes('already in use') ||
		normalizedMessage.includes('eaddrinuse') ||
		normalizedMessage.includes('eacces')
	) {
		return friendlyErrors.portConflict(errorMessage);
	}
	if (
		normalizedMessage.includes('auth id') ||
		normalizedMessage.includes('authid') ||
		normalizedMessage.includes('no account has been set up')
	) {
		return friendlyErrors.authIssue(errorMessage);
	}
	if (normalizedMessage.includes('timed out')) {
		return friendlyErrors.timeout(errorMessage);
	}
	return `${errorMessage}${friendlyErrors.outputHint}`;
};

export const summarizeInlineError = (errorMessage: string): string => {
	const firstLine = (errorMessage || '')
		.split('\n')
		.map((line) => line.trim())
		.find((line) => line.length > 0) || 'Operation failed.';
	return firstLine.length <= 180 ? firstLine : `${firstLine.substring(0, 177)}...`;
};
