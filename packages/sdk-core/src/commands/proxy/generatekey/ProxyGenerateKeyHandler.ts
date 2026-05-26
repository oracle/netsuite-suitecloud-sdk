/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import crypto from 'crypto';

const FILE_FIELDS = {
	DEFAULT_KEY: 'defaultKey',
	KEYS: 'keys',
} as const;

const KEY_FIELDS = {
	CREATION_DATE: 'creationDate',
	VALUE: 'value',
} as const;

const DEFAULT_EMPTY_CLIENT_API_KEY_OBJECT = {
	schemaVersion: 1,
	defaultKey: 'proxyKey',
	keys: {
		proxyKey: {
			creationDate: '',
			value: '',
		},
	},
};

export const PROXY_GENERATE_KEY_ERROR = {
	INVALID_KEY_FILE_CONTENTS: 'INVALID_KEY_FILE_CONTENTS',
} as const;

type ProxyGenerateKeyErrorCode = typeof PROXY_GENERATE_KEY_ERROR[keyof typeof PROXY_GENERATE_KEY_ERROR];

export type ProxyGenerateKeyValidationError = {
	errorCode: ProxyGenerateKeyErrorCode;
};

export type ClientApiKeyFileData = {
	defaultKey: string;
	keys: Record<string, { creationDate?: string; value?: string }>;
	[key: string]: unknown;
};

export type BuildProxyKeyResult = {
	proxyAPIKey: string;
	updatedClientApiKeyContent: string;
};

export function generateProxyApiKey(length: number = 32): string {
	return crypto.randomBytes(length).toString('hex');
}

export function parseClientApiKeyContent(content?: string): {
	data?: ClientApiKeyFileData;
	validationError?: ProxyGenerateKeyValidationError;
} {
	try {
		const parsedData = content ? JSON.parse(content) : JSON.parse(JSON.stringify(DEFAULT_EMPTY_CLIENT_API_KEY_OBJECT));
		if (!parsedData || typeof parsedData !== 'object') {
			return { validationError: { errorCode: PROXY_GENERATE_KEY_ERROR.INVALID_KEY_FILE_CONTENTS } };
		}

		const defaultKey = parsedData[FILE_FIELDS.DEFAULT_KEY];
		const keys = parsedData[FILE_FIELDS.KEYS];
		if (!defaultKey || typeof defaultKey !== 'string' || !keys || typeof keys !== 'object' || !keys[defaultKey]) {
			return { validationError: { errorCode: PROXY_GENERATE_KEY_ERROR.INVALID_KEY_FILE_CONTENTS } };
		}

		const defaultKeyEntry = keys[defaultKey];
		if (!Object.prototype.hasOwnProperty.call(defaultKeyEntry, KEY_FIELDS.VALUE)) {
			return { validationError: { errorCode: PROXY_GENERATE_KEY_ERROR.INVALID_KEY_FILE_CONTENTS } };
		}

		return { data: parsedData as ClientApiKeyFileData };
	} catch (error) {
		return { validationError: { errorCode: PROXY_GENERATE_KEY_ERROR.INVALID_KEY_FILE_CONTENTS } };
	}
}

export function buildProxyGenerateKeyResult(
	content: string | undefined,
	generatedAt: string = new Date().toISOString()
): BuildProxyKeyResult | { validationError: ProxyGenerateKeyValidationError } {
	const parsed = parseClientApiKeyContent(content);
	if (parsed.validationError || !parsed.data) {
		return { validationError: parsed.validationError || { errorCode: PROXY_GENERATE_KEY_ERROR.INVALID_KEY_FILE_CONTENTS } };
	}

	const proxyAPIKey = generateProxyApiKey();
	const defaultKey = parsed.data.defaultKey;
	parsed.data.keys[defaultKey] = {
		[KEY_FIELDS.CREATION_DATE]: generatedAt,
		[KEY_FIELDS.VALUE]: proxyAPIKey,
	};

	return {
		proxyAPIKey,
		updatedClientApiKeyContent: JSON.stringify(parsed.data),
	};
}
