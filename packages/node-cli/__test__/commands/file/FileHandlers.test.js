/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { prepareListFilesParams } = require('@oracle/suitecloud-sdk-core/commands/file/list/ListFilesHandler');
const { prepareUploadFilesParams } = require('@oracle/suitecloud-sdk-core/commands/file/upload/UploadFilesHandler');
const {
	prepareImportFilesParams,
	addCompareFilesImportFlag,
	addImportCallMetadata,
} = require('@oracle/suitecloud-sdk-core/commands/file/import/ImportFilesHandler');

describe('FileHandlers', () => {
	it('prepareListFilesParams should quote folder and set auth id', () => {
		const result = prepareListFilesParams({ folder: '/Suite Scripts', other: true }, 'myAuth');
		expect(result).toEqual({
			folder: '"/Suite Scripts"',
			other: true,
			authid: 'myAuth',
		});
	});

	it('prepareUploadFilesParams should normalize paths and set project/auth id', () => {
		const result = prepareUploadFilesParams(
			{ paths: ['/SuiteScripts/a.js', '/SuiteScripts/b.js'] },
			'/tmp/project',
			'myAuth'
		);
		expect(result).toEqual({
			paths: '"/SuiteScripts/a.js" "/SuiteScripts/b.js"',
			project: '"/tmp/project"',
			authid: 'myAuth',
		});
	});

	it('prepareImportFilesParams should normalize params and extract call metadata', () => {
		const result = prepareImportFilesParams(
			{
				paths: ['/SuiteScripts/a.js'],
				excludeproperties: true,
				calledfromcomparefiles: true,
				calledfromupdate: true,
			},
			'/tmp/project',
			'myAuth'
		);

		expect(result.calledFromCompareFiles).toBe(true);
		expect(result.calledFromUpdate).toBe(true);
		expect(result.params).toEqual({
			paths: '"/SuiteScripts/a.js"',
			excludeproperties: '',
			project: '"/tmp/project"',
			authid: 'myAuth',
		});
	});

	it('import helper flags should be composable', () => {
		const withCompareFlag = addCompareFilesImportFlag({ folder: '/SuiteScripts' });
		expect(withCompareFlag.allowforsuiteapps).toBe('');

		const withMetadata = addImportCallMetadata(withCompareFlag, true, false);
		expect(withMetadata.calledfromcomparefiles).toBe(true);
		expect(withMetadata.calledfromupdate).toBeUndefined();
	});
});
