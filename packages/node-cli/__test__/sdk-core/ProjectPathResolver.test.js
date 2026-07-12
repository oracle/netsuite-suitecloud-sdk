/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { mkdir, mkdtemp, rm, symlink } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

const {
	assertCreatablePathWithin,
	assertPathWithin,
	assertRealPathWithin,
	isSuiteCloudPathWithinRoot,
	PathOutsideRootError,
	resolveSuiteCloudPath,
} = require('../../../sdk-core/build/services/project/ProjectPathResolver');
const {
	executeUploadFiles,
} = require('../../../sdk-core/build/services/file/FileCommandService');
const {
	executeImportObjects,
} = require('../../../sdk-core/build/services/object/ObjectCommandService');

describe('ProjectPathResolver', () => {
	let temporaryRoot;

	beforeEach(async () => {
		temporaryRoot = await mkdtemp(join(tmpdir(), 'suitecloud-path-resolver-'));
	});

	afterEach(async () => {
		await rm(temporaryRoot, { recursive: true, force: true });
	});

	it('resolves SuiteCloud paths below the supplied local root', () => {
		expect(resolveSuiteCloudPath(temporaryRoot, '/Objects/Test Object')).toBe(
			join(temporaryRoot, 'Objects', 'Test Object')
		);
	});

	it('rejects parent traversal in SuiteCloud paths', () => {
		expect(() => resolveSuiteCloudPath(temporaryRoot, '/Objects/../../outside.xml')).toThrow(
			PathOutsideRootError
		);
	});

	it('matches complete virtual path segments instead of sibling prefixes', () => {
		expect(isSuiteCloudPathWithinRoot('/Objects', '/Objects')).toBe(true);
		expect(isSuiteCloudPathWithinRoot('/Objects/Subfolder', '/Objects')).toBe(true);
		expect(isSuiteCloudPathWithinRoot('/ObjectsOther', '/Objects')).toBe(false);
	});

	it('rejects local paths outside the supplied root', () => {
		expect(() => assertPathWithin(join(temporaryRoot, 'project'), join(temporaryRoot, 'outside'))).toThrow(
			PathOutsideRootError
		);
	});

	it('rejects existing and creatable paths that escape through a symlink', async () => {
		const projectRoot = join(temporaryRoot, 'project');
		const outsideRoot = join(temporaryRoot, 'outside');
		const linkedFolder = join(projectRoot, 'linked');
		await mkdir(projectRoot);
		await mkdir(outsideRoot);
		await symlink(outsideRoot, linkedFolder, process.platform === 'win32' ? 'junction' : 'dir');

		await expect(assertRealPathWithin(projectRoot, linkedFolder)).rejects.toThrow(PathOutsideRootError);
		await expect(assertCreatablePathWithin(projectRoot, join(linkedFolder, 'new-file.xml'))).rejects.toThrow(
			PathOutsideRootError
		);
	});

	it('allows a destination below a root folder that has not been created yet', async () => {
		const projectRoot = join(temporaryRoot, 'project');
		const fileCabinetRoot = join(projectRoot, 'FileCabinet');
		await mkdir(projectRoot);

		const destination = assertPathWithin(fileCabinetRoot, join(fileCabinetRoot, 'SuiteScripts', 'file.js'));
		await expect(assertCreatablePathWithin(projectRoot, destination)).resolves.toBe(destination);
	});
});

describe('command path validation', () => {
	let projectFolder;

	beforeEach(async () => {
		projectFolder = await mkdtemp(join(tmpdir(), 'suitecloud-command-path-'));
		await mkdir(join(projectFolder, 'FileCabinet', 'SuiteScripts'), { recursive: true });
		await mkdir(join(projectFolder, 'Objects'), { recursive: true });
	});

	afterEach(async () => {
		await rm(projectFolder, { recursive: true, force: true });
	});

	it('returns the established error when file:upload receives a directory', async () => {
		const directoryPath = '/SuiteScripts/test folder with spaces';
		await mkdir(resolveSuiteCloudPath(join(projectFolder, 'FileCabinet'), directoryPath));

		const result = await executeUploadFiles({
			hostName: 'example.test',
			accessToken: 'token',
			projectFolder,
			filePaths: [directoryPath],
		});

		expect(result).toEqual({
			status: 'ERROR',
			errorMessages: ['You tried to upload a folder instead of a file.'],
		});
	});

	it('rejects object import destinations outside the Objects folder before making a request', async () => {
		const result = await executeImportObjects({
			hostName: 'example.test',
			accessToken: 'token',
			projectFolder,
			targetFolder: join(projectFolder, 'Invalid'),
			scriptIds: ['customrecord_example'],
			objectType: 'ALL',
			excludeFiles: false,
		});

		expect(result).toEqual({
			status: 'ERROR',
			httpStatusCode: undefined,
			errorMessages: ['Objects must be placed under the Objects folder or any of its subfolders.'],
		});
	});
});
