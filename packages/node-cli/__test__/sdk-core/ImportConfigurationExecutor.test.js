/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const { mkdtemp, mkdir, readFile, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const AdmZip = require('adm-zip');

const mockSendFormRequest = jest.fn();

jest.mock('../../../sdk-core/build/commands/object/ObjectCommandClient', () => {
	const actual = jest.requireActual('../../../sdk-core/build/commands/object/ObjectCommandClient');
	return { ...actual, sendFormRequest: (...args) => mockSendFormRequest(...args) };
});

const {
	executeImportConfiguration,
} = require('../../../sdk-core/build/commands/config/import/ImportConfigurationExecutor');

describe('ImportConfigurationExecutor', () => {
	let projectFolder;

	beforeEach(async () => {
		mockSendFormRequest.mockReset();
		projectFolder = await mkdtemp(join(tmpdir(), 'suitecloud-config-import-test-'));
		await mkdir(join(projectFolder, 'AccountConfiguration'), { recursive: true });
	});

	afterEach(async () => {
		await rm(projectFolder, { recursive: true, force: true });
	});

	it('requests all features and extracts configurations into the current project', async () => {
		mockSendFormRequest.mockResolvedValue({
			statusCode: 200,
			contentType: 'application/octet-stream',
			body: createImportZip(),
		});

		const result = await executeImportConfiguration({
			hostName: 'system.netsuite.com',
			accessToken: 'token',
			projectFolder,
		});

		expect(mockSendFormRequest).toHaveBeenCalledWith(expect.objectContaining({
			actionName: 'importconfiguration',
			params: {
				action: 'FetchCustomObjectXml',
				custom_objects: expect.stringContaining('id="ALL_FEATURES" type="FEATURES"'),
			},
		}));
		expect(result).toEqual({
			status: 'SUCCESS',
			data: {
				successfulImports: [{ type: 'features', id: 'all_features' }],
				failedImports: [],
			},
		});
		await expect(readFile(join(projectFolder, 'AccountConfiguration', 'features.xml'), 'utf8'))
			.resolves.toBe('<features/>');
		await expect(readFile(join(projectFolder, 'AccountConfiguration', 'status.xml'), 'utf8'))
			.rejects.toThrow();
	});

	it('returns the server error without trying to extract it', async () => {
		mockSendFormRequest.mockResolvedValue({
			statusCode: 403,
			contentType: 'text/plain',
			body: Buffer.from('Forbidden'),
		});

		await expect(executeImportConfiguration({
			hostName: 'system.netsuite.com',
			accessToken: 'token',
			projectFolder,
		})).resolves.toEqual({
			status: 'ERROR',
			httpStatusCode: 403,
			errorMessages: ['Forbidden'],
		});
	});
});

function createImportZip() {
	const zip = new AdmZip();
	zip.addFile('status.xml', Buffer.from(
		'<Status><customObject id="all_features" type="features">' +
		'<result><code>SUCCESS</code></result></customObject></Status>'
	));
	zip.addFile('features.xml', Buffer.from('<features/>'));
	return zip.toBuffer();
}
