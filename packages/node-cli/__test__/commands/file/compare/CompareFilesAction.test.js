/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

jest.mock('../../../../src/SdkExecutor');
jest.mock('../../../../src/ui/CliSpinner', () => ({
	executeWithSpinner: ({ action }) => action,
}));
jest.mock('../../../../src/utils/AuthenticationUtils', () => ({
	getProjectDefaultAuthId: jest.fn(() => 'auth123'),
}));

const fs = require('fs');
const os = require('os');

const SdkExecutor = require('../../../../src/SdkExecutor');
const FileUtils = require('../../../../src/utils/FileUtils');
const { STATUS } = require('../../../../src/utils/SdkOperationResultUtils');
const CompareFilesAction = require('../../../../src/commands/file/compare/CompareFilesAction');

const sdkExecutorExecuteMock = jest.spyOn(SdkExecutor.prototype, 'execute');

const PROJECT_FOLDER = '/project';
const TEMP_FOLDER = '/tmp/suitecloud-compare-file-xyz';
const FILE_PATH = '/SuiteScripts/x.js';

const ACTION_OPTIONS = {
	projectFolder: PROJECT_FOLDER,
	executionPath: PROJECT_FOLDER,
	commandMetadata: { options: {} },
	runInInteractiveMode: false,
	log: { info() {}, result() {}, warning() {}, error() {}, println() {} },
};

describe('CompareFilesAction execute(params)', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.spyOn(os, 'tmpdir').mockReturnValue('/tmp');
		jest.spyOn(fs, 'mkdtempSync').mockReturnValue(TEMP_FOLDER);
		jest.spyOn(fs, 'copyFileSync').mockImplementation(() => {});
		jest.spyOn(fs, 'rmSync').mockImplementation(() => {});
		jest.spyOn(FileUtils, 'createDirectory').mockImplementation(() => {});
		jest.spyOn(FileUtils, 'exists').mockReturnValue(true);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('returns a structured diff when the local and account versions differ', async () => {
		sdkExecutorExecuteMock.mockResolvedValue({
			status: STATUS.SUCCESS,
			data: { results: [{ path: FILE_PATH, loaded: true }] },
		});
		// The account version is imported under the temp folder; the local version lives under the project folder.
		jest.spyOn(FileUtils, 'readAsString').mockImplementation((filePath) => (filePath.startsWith('/tmp') ? 'a\nb\nc\n' : 'a\nB\nc\n'));

		const action = new CompareFilesAction(ACTION_OPTIONS);
		const actionResult = await action.execute({ path: FILE_PATH, authid: 'auth123' });

		expect(actionResult.isSuccess()).toBe(true);
		expect(actionResult.data.remoteLoaded).toBe(true);
		expect(actionResult.data.identical).toBe(false);
		expect(actionResult.data.lines).toContainEqual({ type: 'removed', text: '-b' });
		expect(actionResult.data.lines).toContainEqual({ type: 'added', text: '+B' });
		// The temporary project must be cleaned up afterwards.
		expect(fs.rmSync).toHaveBeenCalledWith(TEMP_FOLDER, { recursive: true, force: true });
	});

	it('reports identical files when the content matches', async () => {
		sdkExecutorExecuteMock.mockResolvedValue({
			status: STATUS.SUCCESS,
			data: { results: [{ path: FILE_PATH, loaded: true }] },
		});
		jest.spyOn(FileUtils, 'readAsString').mockReturnValue('same\ncontent\n');

		const action = new CompareFilesAction(ACTION_OPTIONS);
		const actionResult = await action.execute({ path: FILE_PATH, authid: 'auth123' });

		expect(actionResult.isSuccess()).toBe(true);
		expect(actionResult.data.identical).toBe(true);
		expect(actionResult.data.lines).toEqual([]);
	});

	it('flags remoteLoaded as false when the account does not have the file', async () => {
		sdkExecutorExecuteMock.mockResolvedValue({
			status: STATUS.SUCCESS,
			data: { results: [{ path: FILE_PATH, loaded: false, message: 'File not found' }] },
		});

		const action = new CompareFilesAction(ACTION_OPTIONS);
		const actionResult = await action.execute({ path: FILE_PATH, authid: 'auth123' });

		expect(actionResult.isSuccess()).toBe(true);
		expect(actionResult.data.remoteLoaded).toBe(false);
	});

	it('returns an error when no path is provided', async () => {
		const action = new CompareFilesAction(ACTION_OPTIONS);
		const actionResult = await action.execute({ authid: 'auth123' });

		expect(actionResult.isSuccess()).toBe(false);
		expect(actionResult.errorMessages.length).toBeGreaterThan(0);
	});

	it('surfaces SDK errors from the import', async () => {
		sdkExecutorExecuteMock.mockResolvedValue({
			status: STATUS.ERROR,
			errorMessages: ['Something went wrong'],
		});

		const action = new CompareFilesAction(ACTION_OPTIONS);
		const actionResult = await action.execute({ path: FILE_PATH, authid: 'auth123' });

		expect(actionResult.isSuccess()).toBe(false);
		expect(actionResult.errorMessages).toContain('Something went wrong');
	});
});
