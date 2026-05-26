/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { mkdtemp, mkdir, readFile, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const {
	executeCreateFile,
	FILE_CREATE_STATUS,
} = require('@oracle/suitecloud-sdk-core/commands/file/create/CreateFileExecutor');

describe('CreateFileExecutor', () => {
	let projectFolder;

	beforeEach(async () => {
		projectFolder = await mkdtemp(join(tmpdir(), 'suitecloud-createfile-'));
		await mkdir(join(projectFolder, 'src'), { recursive: true });
		await writeFile(
			join(projectFolder, 'src', 'manifest.xml'),
			'<manifest projecttype="SUITEAPP"><publisherid>com.netsuite</publisherid><projectid>311</projectid></manifest>',
			'utf8'
		);
	});

	it('should create SuiteScript file via TS core executor', async () => {
		const result = await executeCreateFile({
			projectFolder,
			path: '/SuiteApps/com.netsuite.311/hello.js',
			type: 'MapReduceScript',
		});

		expect(result.status).toBe(FILE_CREATE_STATUS.SUCCESS);
		const content = await readFile(result.data.createdFileAbsolutePath, 'utf8');
		expect(content).toContain('@NScriptType MapReduceScript');
		expect(content).toContain('define([], () =>');
	});

	it('should fail when suiteapp path does not start with app id', async () => {
		const result = await executeCreateFile({
			projectFolder,
			path: '/SuiteApps/other.app/hello.js',
			type: 'ClientScript',
		});

		expect(result.status).toBe(FILE_CREATE_STATUS.ERROR);
		expect(result.errorMessages[0]).toContain('For SuiteApp projects');
	});
});
