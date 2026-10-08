/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

jest.mock('../../../sdk-core/build/commands/object/ObjectCommandClient', () => ({
	...jest.requireActual('../../../sdk-core/build/commands/object/ObjectCommandClient'),
	sendFormRequest: jest.fn(),
}));

const { access, mkdtemp, readFile, rm, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const AdmZip = require('adm-zip');
const { sendFormRequest } = require('../../../sdk-core/build/commands/object/ObjectCommandClient');
const { executeImportObjects } = require('../../../sdk-core/build/commands/object/import/ImportObjectsExecutor');

describe('ImportObjectsExecutor manifest checks', () => {
	let projectFolder;
	let input;

	beforeEach(async () => {
		jest.clearAllMocks();
		projectFolder = await mkdtemp(join(tmpdir(), 'suitecloud-import-manifest-'));
		input = {
			projectFolder,
			targetFolder: join(projectFolder, 'Objects'),
			scriptIds: ['customlist_example'],
			objectType: 'customlist',
			excludeFiles: false,
			hostName: 'mock.invalid',
			accessToken: 'mock-token',
		};
		const archive = new AdmZip();
		archive.addFile('status.xml', Buffer.from(
			'<Status><customObject id="customlist_example" type="customlist">' +
			'<result><code>SUCCESS</code></result></customObject></Status>'
		));
		archive.addFile('customlist_example.xml', Buffer.from('<customlist scriptid="customlist_example"/>'));
		sendFormRequest.mockResolvedValue({
			statusCode: 200,
			contentType: 'application/octet-stream',
			body: archive.toBuffer(),
		});
	});

	afterEach(async () => {
		await rm(projectFolder, { recursive: true, force: true });
	});

	it.each([
		['missing', [], 'Missing manifest control file'],
		['malformed', [['manifest.xml', '<manifest>']], 'Invalid manifest.xml'],
		['duplicate', [
			['manifest.xml', '<manifest projecttype="ACCOUNTCUSTOMIZATION"/>'],
			['manifest.json', '{}'],
		], 'Multiple manifest control files'],
	])('rejects a %s manifest before requesting or writing objects', async (_name, files, errorMessage) => {
		await Promise.all(files.map(([filename, contents]) => writeFile(join(projectFolder, filename), contents)));
		const result = await executeImportObjects(input);
		expect(result.status).toBe('ERROR');
		expect(result.errorMessages[0]).toContain(errorMessage);
		expect(sendFormRequest).not.toHaveBeenCalled();
		await expect(access(input.targetFolder)).rejects.toMatchObject({ code: 'ENOENT' });
	});

	it('imports objects with a valid manifest and no deploy file', async () => {
		await writeFile(join(projectFolder, 'manifest.xml'), '<manifest projecttype="ACCOUNTCUSTOMIZATION"/>');
		const result = await executeImportObjects(input);
		expect(result.status).toBe('SUCCESS');
		expect(result.data.successfulImports).toHaveLength(1);
		expect(sendFormRequest).toHaveBeenCalledTimes(1);
		expect(await readFile(join(input.targetFolder, 'customlist_example.xml'), 'utf8'))
			.toBe('<customlist scriptid="customlist_example"/>');
	});

	it('preserves skipping manifest reads when referenced files are excluded', async () => {
		const result = await executeImportObjects({ ...input, excludeFiles: true });
		expect(result.status).toBe('SUCCESS');
		expect(sendFormRequest).toHaveBeenCalledTimes(1);
	});
});
