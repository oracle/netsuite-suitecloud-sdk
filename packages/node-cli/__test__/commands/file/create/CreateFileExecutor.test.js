/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { mkdtemp, readFile, rm, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const {
	executeCreateFile,
	FILE_CREATE_STATUS,
} = require('@oracle/suitecloud-sdk-core').commands;

const SCRIPT_TYPES = [
	['BundleInstallationScript', 'const beforeInstall'],
	['ClientScript', 'function pageInit'],
	['CustomModule', 'const foo'],
	['plugintypeimpl', '@NScriptType plugintypeimpl'],
	['customRecordAction', 'const executeAction'],
	['MapReduceScript', 'const summarize'],
	['MassUpdateScript', 'const each'],
	['Portlet', 'const render'],
	['Restlet', 'const get'],
	['ScheduledScript', 'const execute'],
	['SDFInstallationScript', 'const run'],
	['Suitelet', 'const onRequest'],
	['UserEventScript', 'const beforeLoad'],
	['WorkflowActionScript', 'const onAction'],
];

describe('CreateFileExecutor', () => {
	let projectFolder;

	beforeEach(async () => {
		projectFolder = await mkdtemp(join(tmpdir(), 'suitecloud-createfile-'));
		await writeFile(
			join(projectFolder, 'manifest.xml'),
			'<manifest projecttype="SUITEAPP"><publisherid>com.netsuite</publisherid><projectid>311</projectid></manifest>',
			'utf8'
		);
	});

	afterEach(async () => {
		await rm(projectFolder, { recursive: true, force: true });
	});

	it.each(SCRIPT_TYPES)('should create the Java-equivalent %s template', async (type, expectedEntryPoint) => {
		const result = await executeCreateFile({
			projectFolder,
			path: `/SuiteApps/com.netsuite.311/${type}.js`,
			type,
		});

		expect(result.status).toBe(FILE_CREATE_STATUS.SUCCESS);
		const content = await readFile(result.data.createdFileAbsolutePath, 'utf8');
		expect(content).toContain(expectedEntryPoint);
	});

	it('should use the custom module template when no type is provided', async () => {
		const result = await executeCreateFile({
			projectFolder,
			path: '/SuiteApps/com.netsuite.311/default.js',
		});

		expect(result.status).toBe(FILE_CREATE_STATUS.SUCCESS);
		const content = await readFile(result.data.createdFileAbsolutePath, 'utf8');
		expect(content).toContain('@NApiVersion 2.1');
		expect(content).toContain('const foo');
	});

	it('should normalize modules and render their define, JSDoc, and function parameters', async () => {
		const result = await executeCreateFile({
			projectFolder,
			path: '/SuiteApps/com.netsuite.311/client.js',
			type: 'ClientScript',
			module: '"n/record" "N/search"',
		});

		expect(result.status).toBe(FILE_CREATE_STATUS.SUCCESS);
		const content = await readFile(result.data.createdFileAbsolutePath, 'utf8');
		expect(content).toContain("define(['N/record', 'N/search']");
		expect(content).toContain('@param{record} record');
		expect(content).toContain('@param{search} search');
		expect(content).toContain('function(record, search)');
	});

	it('should reject unsupported script types', async () => {
		const result = await executeCreateFile({
			projectFolder,
			path: '/SuiteApps/com.netsuite.311/invalid.js',
			type: 'InvalidScriptType',
		});

		expect(result.status).toBe(FILE_CREATE_STATUS.ERROR);
		expect(result.errorMessages[0]).toContain('not a valid SuiteScript type');
	});

	it('should reject unsupported SuiteScript modules', async () => {
		const result = await executeCreateFile({
			projectFolder,
			path: '/SuiteApps/com.netsuite.311/invalid-module.js',
			type: 'Suitelet',
			module: '"N/record" "N/not-a-module"',
		});

		expect(result.status).toBe(FILE_CREATE_STATUS.ERROR);
		expect(result.errorMessages[0]).toContain('Invalid SuiteScript module specified: "N/not-a-module"');
	});

	it('should fail when SuiteApp path does not start with app id', async () => {
		const result = await executeCreateFile({
			projectFolder,
			path: '/SuiteApps/other.app/hello.js',
			type: 'ClientScript',
		});

		expect(result.status).toBe(FILE_CREATE_STATUS.ERROR);
		expect(result.errorMessages[0]).toBe(
			'The file cabinet path "/SuiteApps/other.app/hello.js" is invalid. It must refer to a file in a ' +
				'"/SuiteApps/com.netsuite.311" folder or in any "/Web Site Hosting Files" subfolder. ' +
				'For example, "/SuiteApps/com.netsuite.311/file.js".'
		);
	});

	it('should reject paths that escape the FileCabinet folder', async () => {
		const result = await executeCreateFile({
			projectFolder,
			path: '/SuiteApps/com.netsuite.311/../../../escaped.js',
			type: 'ClientScript',
		});

		expect(result.status).toBe(FILE_CREATE_STATUS.ERROR);
		expect(result.errorMessages[0]).toContain("Path must remain inside the project's FileCabinet folder");
	});
});
