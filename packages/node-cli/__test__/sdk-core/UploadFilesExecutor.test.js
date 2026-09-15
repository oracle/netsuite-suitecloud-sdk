/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const { mkdtemp, mkdir, rm, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

jest.mock('../../../sdk-core/build/commands/file/FileCommandClient', () => ({
	getHttpErrorMessage: jest.fn(),
	sendFileCommandRequest: jest.fn(),
}));

const { sendFileCommandRequest } = require('../../../sdk-core/build/commands/file/FileCommandClient');
const { executeUploadFiles } = require('../../../sdk-core/build/commands/file/upload/UploadFilesExecutor');

describe('UploadFilesExecutor', () => {
	let projectFolder;

	beforeEach(async () => {
		projectFolder = await mkdtemp(join(tmpdir(), 'suitecloud-upload-'));
		await mkdir(join(projectFolder, 'FileCabinet', 'SuiteScripts'), { recursive: true });
		await writeFile(join(projectFolder, 'FileCabinet', 'SuiteScripts', 'example.js'), 'content');
	});

	afterEach(async () => {
		await rm(projectFolder, { recursive: true, force: true });
	});

	it('preserves an update action returned by the File Cabinet endpoint', async () => {
		sendFileCommandRequest.mockResolvedValue({
			statusCode: 200,
			body: Buffer.from(JSON.stringify({ action: 'update' })),
		});

		const result = await executeUploadFiles({
			hostName: 'example.test',
			accessToken: 'token',
			projectFolder,
			filePaths: ['/SuiteScripts/example.js'],
		});

		expect(result.data).toEqual([
			{
				file: { path: join(projectFolder, 'FileCabinet', 'SuiteScripts', 'example.js') },
				type: 'SUCCESS',
				action: 'update',
			},
		]);
	});
});
