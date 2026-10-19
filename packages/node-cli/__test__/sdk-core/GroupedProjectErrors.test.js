/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

jest.mock('../../../sdk-core/build/commands/object/ObjectCommandClient', () => ({
	...jest.requireActual('../../../sdk-core/build/commands/object/ObjectCommandClient'),
	sendFormRequest: jest.fn(),
}));

const { mkdir, mkdtemp, rm, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { services, commands } = require('@oracle/suitecloud-sdk-core');
const { readProjectContext } = require('../../../sdk-core/build/services/project/ProjectControlService');
const { sendFormRequest } = require('../../../sdk-core/build/commands/object/ObjectCommandClient');
const ProjectInfoService = require('../../src/services/ProjectInfoService');
const CLIConfigurationService = require('../../src/core/extensibility/CLIConfigurationService');

function captureError(operation) {
	try {
		operation();
	} catch (error) {
		return error;
	}
	throw new Error('Expected validation to fail');
}

const metadataErrors = [
	expect.stringContaining('does not contain the projecttype attribute'),
	expect.stringContaining('Missing required "frameworkversion"'),
];

describe('Grouped project validation errors', () => {
	let projectFolder;

	beforeEach(async () => {
		projectFolder = await mkdtemp(join(tmpdir(), 'suitecloud-grouped-errors-'));
		jest.clearAllMocks();
	});

	afterEach(async () => {
		await rm(projectFolder, { recursive: true, force: true });
	});

	async function writeControls(manifest = '<manifest/>', deploy = '<deploy/>', format = 'xml') {
		await writeFile(join(projectFolder, `manifest.${format}`), manifest);
		await writeFile(join(projectFolder, `deploy.${format}`), deploy);
	}

	it('reports both missing controls for all readers', () => {
		for (const read of [services.validateControlFileSetup, services.readProjectManifest, readProjectContext]) {
			expect(captureError(() => read(projectFolder))).toEqual([
				expect.stringContaining('Missing manifest control file'),
				expect.stringContaining('Missing deploy control file'),
			]);
		}
	});

	it('collects duplicate, missing and generation errors before reading contents', async () => {
		for (const name of ['manifest.xml', 'manifest.json', 'application.json', 'application.yaml']) {
			await writeFile(join(projectFolder, name), '{');
		}
		const errors = captureError(() => readProjectContext(projectFolder));
		expect(errors).toHaveLength(4);
		expect(errors).toEqual(expect.arrayContaining([
			expect.stringContaining('Multiple manifest control files'),
			expect.stringContaining('Missing deploy control file'),
			expect.stringContaining('Multiple application control files'),
			expect.stringContaining('cannot be mixed'),
		]));
	});

	it('lists each control file once in mixed-generation errors', async () => {
		await writeFile(join(projectFolder, 'manifest.xml'), '<manifest/>');
		await writeFile(join(projectFolder, 'deploy.json'), '{"deploy":[]}');
		await writeFile(join(projectFolder, 'application.yaml'), 'application: {}');
		const errors = captureError(() => services.validateControlFileSetup(projectFolder));
		expect(errors).toHaveLength(1);
		expect(errors[0]).toContain('cannot be mixed');
		expect(errors[0].match(/application\.yaml/g)).toHaveLength(1);
	});

	it.each(['xml', 'json', 'yaml', 'yml'])('groups missing metadata in manifest.%s without redundant invalid-value errors', async (format) => {
		await writeControls(format === 'xml' ? '<manifest/>' : '{"manifest":{}}', format === 'xml' ? '<deploy/>' : '{"deploy":[]}', format);
		expect(captureError(() => services.readProjectManifest(projectFolder))).toEqual(metadataErrors);
	});

	it('groups invalid metadata without guessing application eligibility for an unknown project type', async () => {
		await writeControls('<manifest projecttype="OTHER"><frameworkversion>2.0</frameworkversion></manifest>');
		await writeFile(join(projectFolder, 'application.xml'), '<application/>');
		expect(captureError(() => readProjectContext(projectFolder))).toEqual([
			expect.stringContaining('must be either SUITEAPP or ACCOUNTCUSTOMIZATION'),
			expect.stringContaining('does not match'),
		]);
	});

	it('collects metadata, deploy and application eligibility errors independently', async () => {
		await writeControls('<manifest projecttype="ACCOUNTCUSTOMIZATION"/>', '<other/>');
		await writeFile(join(projectFolder, 'application.xml'), '<application/>');
		expect(captureError(() => readProjectContext(projectFolder))).toEqual([
			expect.stringContaining('Missing required "frameworkversion"'),
			expect.stringContaining('Invalid deploy.xml: expected <deploy>'),
			expect.stringContaining('only allowed in SuiteApp projects'),
		]);
	});

	it.each(['xml', 'json', 'yaml'])('reports both malformed control files in %s', async (format) => {
		await writeControls(format === 'xml' ? '<manifest>' : '{', format === 'xml' ? '<deploy>' : '{', format);
		expect(captureError(() => readProjectContext(projectFolder))).toEqual([
			expect.stringContaining(`Invalid manifest.${format}:`),
			expect.stringContaining(`Invalid deploy.${format}:`),
		]);
	});

	it.each([
		['file:create', (input) => commands.executeCreateFile({ ...input, path: '/SuiteScripts/example.js' })],
		['object:import', (input) => commands.executeImportObjects({ ...input, scriptIds: ['customlist_example'], targetFolder: join(input.projectFolder, 'Objects') })],
		['object:update', (input) => commands.executeUpdateObjects({ ...input, scriptIds: ['customlist_example'] })],
		['custom record update', (input) => commands.executeUpdateCustomRecordWithInstances({ ...input, scriptId: 'customrecord_example' })],
		['project:package', (input) => commands.executePackageProject({ ...input, destinationFolder: join(input.projectFolder, 'output') })],
	])('%s preserves grouped metadata errors before making requests', async (_name, execute) => {
		await writeControls();
		await mkdir(join(projectFolder, 'Objects'));
		await writeFile(join(projectFolder, 'Objects/customrecord_example.xml'), '<customrecord scriptid="customrecord_example"/>');
		const result = await execute({ projectFolder, hostName: 'mock.invalid', accessToken: 'mock-token' });
		expect(result.status).toBe('ERROR');
		expect(result.errorMessages).toEqual(metadataErrors);
		expect(sendFormRequest).not.toHaveBeenCalled();
	});

	it.each(['deploy', 'validate'])('project:%s preserves archive context for each error', async (command) => {
		await writeControls('<manifest/>', '<other/>');
		const sendProjectRequest = jest.fn();
		const result = await commands.executeProjectCommand({ command, projectFolder, hostName: 'mock.invalid', accessToken: 'mock-token' }, { sendProjectRequest });
		expect(result.status).toBe('ERROR');
		expect(result.errorMessages).toHaveLength(3);
		expect(result.errorMessages[0]).toContain('projecttype');
		expect(result.errorMessages[1]).toContain('frameworkversion');
		expect(result.errorMessages[2]).toContain('Invalid deploy.xml');
		for (const message of result.errorMessages) expect(message).toContain(projectFolder);
		expect(sendProjectRequest).not.toHaveBeenCalled();
	});

	it('includes every error in the existing CLI exception text', async () => {
		const configuration = new CLIConfigurationService();
		configuration.initialize(projectFolder);
		const setupError = captureError(() => configuration.validateProjectContext('project:deploy')).getErrorMessage();
		expect(setupError).toContain('Missing manifest control file');
		expect(setupError).toContain('Missing deploy control file');
		await writeControls();
		const manifestError = captureError(() => new ProjectInfoService(projectFolder).getProjectType()).getErrorMessage();
		for (const message of ['projecttype', 'frameworkversion']) expect(manifestError).toContain(message);
	});
});
