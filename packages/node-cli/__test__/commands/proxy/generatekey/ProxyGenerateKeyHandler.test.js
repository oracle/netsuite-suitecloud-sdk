/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const {
	PROXY_GENERATE_KEY_ERROR,
	parseClientApiKeyContent,
	buildProxyGenerateKeyResult,
} = require('@oracle/suitecloud-sdk-core/commands/proxy/generatekey/ProxyGenerateKeyHandler');

describe('ProxyGenerateKeyHandler', () => {
	it('should create default structure when content is empty', () => {
		const parsed = parseClientApiKeyContent('');

		expect(parsed.validationError).toBeUndefined();
		expect(parsed.data.defaultKey).toBe('proxyKey');
		expect(parsed.data.keys.proxyKey.value).toBe('');
	});

	it('should return validation error for invalid content', () => {
		const parsed = parseClientApiKeyContent('{"invalid":true}');

		expect(parsed.data).toBeUndefined();
		expect(parsed.validationError.errorCode).toBe(PROXY_GENERATE_KEY_ERROR.INVALID_KEY_FILE_CONTENTS);
	});

	it('should build updated key file content', () => {
		const currentContent = JSON.stringify({
			schemaVersion: 1,
			defaultKey: 'proxyKey',
			keys: {
				proxyKey: {
					creationDate: '',
					value: '',
				},
			},
		});

		const result = buildProxyGenerateKeyResult(currentContent, '2026-05-15T00:00:00.000Z');

		expect(result.validationError).toBeUndefined();
		expect(result.proxyAPIKey).toMatch(/^[a-f0-9]{64}$/);

		const updated = JSON.parse(result.updatedClientApiKeyContent);
		expect(updated.keys.proxyKey.creationDate).toBe('2026-05-15T00:00:00.000Z');
		expect(updated.keys.proxyKey.value).toBe(result.proxyAPIKey);
	});
});
