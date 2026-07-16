/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

jest.mock('node:fs/promises', () => ({
	...jest.requireActual('node:fs/promises'),
	readFile: jest.fn(),
}));
jest.mock('../../../sdk-core/build/commands/file/import/ImportFilesExecutor', () => ({
	executeImportFiles: jest.fn(),
}));
jest.mock('../../../sdk-core/build/commands/object/ObjectFiles', () => ({
	findObjectFileByScriptId: jest.fn(),
}));
jest.mock('../../../sdk-core/build/commands/object/ObjectCommandXml', () => ({
	extractScriptFileReferences: jest.fn(),
}));

const { readFile } = require('node:fs/promises');
const {
	executeImportFiles,
} = require('../../../sdk-core/build/commands/file/import/ImportFilesExecutor');
const {
	findObjectFileByScriptId,
} = require('../../../sdk-core/build/commands/object/ObjectFiles');
const {
	extractScriptFileReferences,
} = require('../../../sdk-core/build/commands/object/ObjectCommandXml');
const {
	importReferencedFiles,
} = require('../../../sdk-core/build/commands/object/import/ReferencedFilesImporter');

describe('ReferencedFilesImporter', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		findObjectFileByScriptId.mockResolvedValue('/tmp/customscript.xml');
		readFile.mockResolvedValue('<customscript/>');
		extractScriptFileReferences.mockReturnValue([
			'/SuiteScripts/imported.js',
			'/SuiteScripts/missing.js',
		]);
	});

	it('records successful and failed referenced-file imports', async () => {
		executeImportFiles.mockResolvedValue({
			status: 'SUCCESS',
			data: {
				results: [
					{ path: '/SuiteScripts/imported.js', loaded: true, message: '' },
					{ path: '/SuiteScripts/missing.js', loaded: false, message: 'File was not found.' },
				],
			},
		});
		const objectImport = {
			customObject: { id: 'customscript_example', type: 'customscript' },
			referencedFileImportResult: { successfulImports: [], failedImports: [] },
		};

		const result = await importReferencedFiles(
			{
				hostName: 'system.netsuite.com',
				accessToken: 'token',
				projectFolder: '/tmp/project',
				targetFolder: '/tmp/project/Objects',
				scriptIds: ['customscript_example'],
				objectType: 'customscript',
				excludeFiles: false,
			},
			[objectImport]
		);

		expect(result).toEqual({ status: 'SUCCESS' });
		expect(objectImport.referencedFileImportResult).toEqual({
			successfulImports: [{ path: '/SuiteScripts/imported.js' }],
			failedImports: [{ path: '/SuiteScripts/missing.js', message: 'File was not found.' }],
		});
	});
});
