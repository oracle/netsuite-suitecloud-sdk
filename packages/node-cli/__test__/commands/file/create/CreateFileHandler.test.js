/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const {
	normalizeCreateFileParams,
	buildCreateFileResultData,
} = require('@oracle/suitecloud-sdk-core/commands/file/create/CreateFileHandler');

describe('CreateFileHandler', () => {
	it('should normalize interactive params and quote values', () => {
		const normalized = normalizeCreateFileParams(
			{
				parentPath: '/SuiteScripts/',
				name: 'MyScript',
				module: ['N/record', 'N/search'],
				type: 'ClientScript',
			},
			'/tmp/project',
			true
		);

		expect(normalized.project).toBe('"/tmp/project"');
		expect(normalized.path).toBe('"/SuiteScripts/MyScript.js"');
		expect(normalized.module).toBe('"N/record" "N/search"');
		expect(normalized.parentPath).toBeUndefined();
		expect(normalized.name).toBeUndefined();
	});

	it('should build result data with module summary', () => {
		const resultData = buildCreateFileResultData('/tmp/project', {
			path: '"/SuiteScripts/MyScript.js"',
			module: '"N/record" "N/search"',
		});

		expect(resultData.suiteScriptFileAbsolutePath).toContain('/tmp/project/src/SuiteScripts/MyScript.js');
		expect(resultData.modulesSummary).toBe('"N/record", "N/search"');
	});
});
