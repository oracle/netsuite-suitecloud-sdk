/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { mkdtemp, mkdir, readFile, readdir, rm, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const {
	writeProjectCommandLog,
} = require('../../../sdk-core/build/commands/project/result/ProjectCommandLog');

describe('ProjectCommandLog', () => {
	let temporaryFolder;

	beforeEach(async () => {
		temporaryFolder = await mkdtemp(join(tmpdir(), 'suitecloud-project-log-'));
	});

	afterEach(async () => {
		await rm(temporaryFolder, { recursive: true, force: true });
	});

	it('appends formatted command output to a log file', async () => {
		const logFilePath = join(temporaryFolder, 'deploy.log');
		await writeFile(logFilePath, 'Existing entry\n', 'utf8');

		const writtenPath = await writeProjectCommandLog({
			command: 'deploy',
			logFileLocation: logFilePath,
			operationResult: {
				status: 'SUCCESS',
				data: ['DEPLOY SUMMARY', 'Status: SUCCESS'],
			},
		});

		const contents = await readFile(logFilePath, 'utf8');
		expect(writtenPath).toBe(logFilePath);
		expect(contents).toMatch(/^Existing entry\n!DEPLOY - \d{14} -----------------------------------------------/);
		expect(contents).toContain('DEPLOY SUMMARY');
		expect(contents).toContain('Status: SUCCESS');
	});

	it('creates a timestamped log file when a directory is provided', async () => {
		const logsFolder = join(temporaryFolder, 'logs');
		await mkdir(logsFolder);

		const writtenPath = await writeProjectCommandLog({
			command: 'validate',
			logFileLocation: logsFolder,
			operationResult: {
				status: 'ERROR',
				errorMessages: ['Status: FAILED'],
			},
		});

		const files = await readdir(logsFolder);
		expect(files).toHaveLength(1);
		expect(files[0]).toMatch(/^log_\d{14}\.log$/);
		expect(writtenPath).toBe(join(logsFolder, files[0]));
		expect(await readFile(writtenPath, 'utf8')).toContain('Status: FAILED');
	});

	it('reports an error when the log destination cannot be created', async () => {
		await expect(writeProjectCommandLog({
			command: 'deploy',
			logFileLocation: join(temporaryFolder, 'missing', 'deploy.log'),
			operationResult: { status: 'SUCCESS', data: [] },
		})).rejects.toThrow('Unable to write the project command log');
	});
});
