/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const { join } = require('node:path');
const UploadFilesOutputHandler = require('../../../../src/commands/file/upload/UploadFilesOutputHandler');

describe('UploadFilesOutputHandler', () => {
	it('reports files updated by the server as updated', () => {
		const projectFolder = join('tmp', 'project');
		const filePath = join(projectFolder, 'FileCabinet', 'SuiteScripts', 'example.js');
		const log = { result: jest.fn(), warning: jest.fn() };
		const outputHandler = new UploadFilesOutputHandler({ log });

		outputHandler.parse({
			projectFolder,
			data: [{ file: { path: filePath }, type: 'SUCCESS', action: 'update' }],
		});

		expect(log.result.mock.calls).toEqual([
			['The following files were updated:'],
			['/SuiteScripts/example.js'],
		]);
	});
});
