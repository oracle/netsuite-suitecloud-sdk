/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

jest.mock('../../../sdk-core/build/commands/object/ObjectCommandClient', () => ({
	...jest.requireActual('../../../sdk-core/build/commands/object/ObjectCommandClient'),
	sendFormRequest: jest.fn(),
}));

const { mkdir, mkdtemp, readFile, rm, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { stringify } = require('yaml');
const AdmZip = require('adm-zip');
const { commands } = require('@oracle/suitecloud-sdk-core');
const { sendFormRequest } = require('../../../sdk-core/build/commands/object/ObjectCommandClient');

describe.each([
	['object:update', (input) => commands.executeUpdateObjects({ ...input, scriptIds: ['customrecord_example'] })],
	['custom record update', (input) => commands.executeUpdateCustomRecordWithInstances({ ...input, scriptId: 'customrecord_example' })],
])('%s manifest identity', (command, execute) => {
	let projectFolder;
	let objectFile;
	const updatedXml = '<customrecordtype scriptid="customrecord_example"><recordname>Updated</recordname></customrecordtype>';

	beforeEach(async () => {
		jest.clearAllMocks();
		projectFolder = await mkdtemp(join(tmpdir(), 'suitecloud-update-identity-'));
		await mkdir(join(projectFolder, 'Objects'));
		objectFile = join(projectFolder, 'Objects', 'customrecord_example.xml');
		await writeFile(objectFile, '<customrecordtype scriptid="customrecord_example"/>');
		const archive = new AdmZip();
		archive.addFile('customrecord_example.xml', Buffer.from(updatedXml));
		sendFormRequest.mockResolvedValue({ statusCode: 200, contentType: 'application/octet-stream', body: archive.toBuffer() });
	});

	afterEach(async () => {
		await rm(projectFolder, { recursive: true, force: true });
	});

	describe.each(['xml', 'json', 'yaml', 'yml'])('manifest.%s', (format) => {
		it.each(['SUITEAPP', 'ACCOUNTCUSTOMIZATION'])('updates %s objects using the manifest identity', async (projectType) => {
			const identity = projectType === 'SUITEAPP' ? { publisherid: 'com.example', projectid: 'app' } : {};
			const manifest = { manifest: { projecttype: projectType, frameworkversion: '2.0', ...identity } };
			await writeFile(join(projectFolder, `manifest.${format}`), format === 'xml'
				? `<manifest projecttype="${projectType}"><frameworkversion>1.0</frameworkversion>${projectType === 'SUITEAPP'
					? '<publisherid>com.example</publisherid><projectid>app</projectid>' : ''}</manifest>`
				: format === 'json' ? JSON.stringify(manifest) : stringify(manifest));
			// Updating needs manifest metadata; deploy syntax is validated by project commands.
			await writeFile(join(projectFolder, format === 'xml' ? 'deploy.xml' : 'deploy.json'), '{');

			const result = await execute({ projectFolder, hostName: 'mock.invalid', accessToken: 'mock-token' });

			expect(result.status).toBe('SUCCESS');
			if (command === 'object:update') expect(result.data).toEqual([expect.objectContaining({ type: 'SUCCESS' })]);
			expect(sendFormRequest).toHaveBeenCalledTimes(1);
			const { params } = sendFormRequest.mock.calls[0][0];
			if (command === 'object:update') {
				expect(params.package_root).toBe(projectType === 'SUITEAPP' ? 'com.example.app' : '');
				if (projectType === 'SUITEAPP') expect(params.custom_objects).toContain('package="com.example.app"');
				else expect(params.custom_objects).not.toContain('package=');
			} else if (projectType === 'SUITEAPP') {
				expect(params.appid).toBe('com.example.app');
			} else {
				expect(params).not.toHaveProperty('appid');
			}
			expect(await readFile(objectFile, 'utf8')).toBe(updatedXml);
		});
	});
});
