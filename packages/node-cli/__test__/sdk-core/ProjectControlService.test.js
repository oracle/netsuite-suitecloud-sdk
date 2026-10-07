/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const { mkdtemp, rm, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const {
	getAllProjectControlFiles,
	inspectProjectControls,
	getProjectManifestFile,
} = require('@oracle/suitecloud-sdk-core').services;
const ProjectInfoService = require('../../src/services/ProjectInfoService');

describe('ProjectControlService', () => {
	let projectFolder;

	beforeEach(async () => {
		projectFolder = await mkdtemp(join(tmpdir(), 'suitecloud-project-controls-'));
	});

	afterEach(async () => {
		await rm(projectFolder, { recursive: true, force: true });
	});

	it('shares V1 identity and selected files with the synchronous CLI facade', async () => {
		await writeFile(join(projectFolder, 'manifest.xml'),
			'<manifest projecttype="SUITEAPP"><publisherid>com.example</publisherid><projectid>app</projectid>' +
			'<projectname>Example</projectname><projectversion>1.0.0</projectversion>' +
			'<frameworkversion>1.0</frameworkversion></manifest>');
		await writeFile(join(projectFolder, 'deploy.xml'),
			'<deploy><files><path>~/FileCabinet/first.js</path></files>' +
			'<objects><path>~/Objects/record.xml</path></objects>' +
			'<files><path>~/FileCabinet/second.js</path></files></deploy>');
		await writeFile(join(projectFolder, 'application.xml'), '<application/>');
		await writeFile(join(projectFolder, 'messages.xlf'), '<xliff/>');

		const description = await inspectProjectControls(projectFolder);
		const cliInfo = new ProjectInfoService(projectFolder);
		expect(description.controlFiles).toEqual(getAllProjectControlFiles(projectFolder));
		expect(description.controlFiles).toMatchObject({
			sdfFrameworkVersion: '1.0',
			manifest: { filepath: join(projectFolder, 'manifest.xml') },
			deploy: { filepath: join(projectFolder, 'deploy.xml') },
			application: { filename: 'application.xml', filepath: join(projectFolder, 'application.xml'), format: 'xml' },
		});
		expect(description.manifest).toEqual(getProjectManifestFile(projectFolder));
		expect(description.manifest).toMatchObject({
			projectType: cliInfo.getProjectType(),
			projectName: cliInfo.getProjectName(),
			publisherId: cliInfo.getPublisherId(),
			projectId: cliInfo.getProjectId(),
			frameworkVersion: '1.0',
		});
		expect(cliInfo.getApplicationId()).toBe('com.example.app');
		expect(description.manifest.applicationId).toBe('com.example.app');
		expect(description.deployGroups.map((group) => group.kind)).toEqual(['files', 'objects', 'files']);
		expect(description.deployGroups[2].paths[0]).toEqual({
			value: '~/FileCabinet/second.js',
			source: { file: 'deploy.xml', propertyPath: '/deploy/files[2]/path[1]' },
		});
	});

	it('discovers a mixed JSON and YAML V2 pair without misclassifying unrelated files', async () => {
		await writeFile(join(projectFolder, 'manifest.yaml'), 'frameworkversion: 2.0');
		await writeFile(join(projectFolder, 'deploy.json'), '{}');
		await writeFile(join(projectFolder, 'translation.xml'), '<xliff/>');
		expect(getAllProjectControlFiles(projectFolder)).toMatchObject({
			sdfFrameworkVersion: '2.0',
			manifest: { filename: 'manifest.yaml', filepath: join(projectFolder, 'manifest.yaml') },
			deploy: { filename: 'deploy.json', filepath: join(projectFolder, 'deploy.json') },
		});
		expect(() => getProjectManifestFile(projectFolder)).toThrow('not supported yet');
	});

	it('rejects missing, duplicate, and mixed-generation control files', async () => {
		await writeFile(join(projectFolder, 'manifest.xml'), '<manifest/>');
		expect(() => getAllProjectControlFiles(projectFolder)).toThrow('Missing deploy control file');
		await writeFile(join(projectFolder, 'deploy.yaml'), 'files: []');
		expect(() => getAllProjectControlFiles(projectFolder)).toThrow('cannot be mixed');
		await writeFile(join(projectFolder, 'manifest.json'), '{}');
		expect(() => getAllProjectControlFiles(projectFolder)).toThrow('Multiple manifest control files');
	});

	it('selects a V2 control pair alongside application.xml', async () => {
		await writeFile(join(projectFolder, 'manifest.json'), '{}');
		await writeFile(join(projectFolder, 'deploy.yml'), '{}');
		await writeFile(join(projectFolder, 'application.xml'), '<application/>');
		const controlFiles = getAllProjectControlFiles(projectFolder);
		expect(controlFiles).toMatchObject({
			sdfFrameworkVersion: '2.0',
			manifest: { filename: 'manifest.json' },
			deploy: { filename: 'deploy.yml' },
			application: { filename: 'application.xml', format: 'xml' },
		});
	});

	it.each([
		['missing deploy', [], 'Missing deploy control file'],
		['duplicate deploy', ['deploy.xml', 'deploy.json'], 'Multiple deploy control files'],
		['mixed-generation deploy', ['deploy.json'], 'cannot be mixed'],
		['malformed deploy', ['deploy.xml'], 'Invalid deploy.xml'],
	])('reads manifest metadata independently of %s and application contents', async (_name, deployFiles, inspectionError) => {
		await writeFile(join(projectFolder, 'manifest.xml'),
			'<manifest projecttype="SUITEAPP"><publisherid>com.example</publisherid><projectid>app</projectid></manifest>');
		await writeFile(join(projectFolder, 'application.xml'), '<application>');
		await Promise.all(deployFiles.map((filename) => writeFile(join(projectFolder, filename), '<deploy>')));

		expect(getProjectManifestFile(projectFolder).applicationId).toBe('com.example.app');
		await expect(inspectProjectControls(projectFolder)).rejects.toThrow(inspectionError);
	});

	it('still rejects missing and duplicate manifests during metadata reads', async () => {
		expect(() => getProjectManifestFile(projectFolder)).toThrow('Missing manifest control file');
		await writeFile(join(projectFolder, 'manifest.xml'), '<manifest projecttype="ACCOUNTCUSTOMIZATION"/>');
		await writeFile(join(projectFolder, 'manifest.yml'), '{}');
		expect(() => getProjectManifestFile(projectFolder)).toThrow('Multiple manifest control files');
	});

	it.each([false, true])('ignores JSON and YAML application files with application.xml present: %s', async (hasApplicationXml) => {
		await Promise.all([
			writeFile(join(projectFolder, 'manifest.xml'), '<manifest projecttype="ACCOUNTCUSTOMIZATION"/>'),
			writeFile(join(projectFolder, 'deploy.xml'), '<deploy/>'),
			writeFile(join(projectFolder, 'application.json'), 'invalid JSON'),
			writeFile(join(projectFolder, 'application.yaml'), 'invalid YAML'),
			writeFile(join(projectFolder, 'application.yml'), 'invalid YAML'),
		]);
		if (hasApplicationXml) {
			await writeFile(join(projectFolder, 'application.xml'), '<application/>');
		}

		const description = await inspectProjectControls(projectFolder);
		expect(description.controlFiles.application?.filename).toBe(hasApplicationXml ? 'application.xml' : undefined);
	});

	it.each(['<application>', ''])('rejects invalid application.xml during shared inspection: %j', async (contents) => {
		await writeFile(join(projectFolder, 'manifest.xml'), '<manifest projecttype="ACCOUNTCUSTOMIZATION"/>');
		await writeFile(join(projectFolder, 'deploy.xml'), '<deploy/>');
		await writeFile(join(projectFolder, 'application.xml'), contents);
		await expect(inspectProjectControls(projectFolder)).rejects.toThrow('Invalid application.xml');
	});

	it('reports a malformed manifest and wrong deploy root with their filenames', async () => {
		await writeFile(join(projectFolder, 'manifest.xml'), '<manifest>');
		await writeFile(join(projectFolder, 'deploy.xml'), '<deploy/>');
		await expect(inspectProjectControls(projectFolder)).rejects.toThrow('Invalid manifest.xml');
		await writeFile(join(projectFolder, 'manifest.xml'), '<manifest projecttype="ACCOUNTCUSTOMIZATION"/>');
		await writeFile(join(projectFolder, 'deploy.xml'), '<other/>');
		await expect(inspectProjectControls(projectFolder)).rejects.toThrow('Invalid deploy.xml: expected <deploy>');
	});

	it('keeps existing project type checks in the shared metadata reader', async () => {
		await writeFile(join(projectFolder, 'manifest.xml'), '<manifest/>');
		await writeFile(join(projectFolder, 'deploy.xml'), '<deploy/>');
		expect(() => getProjectManifestFile(projectFolder)).toThrow('does not contain the projecttype attribute');
		await writeFile(join(projectFolder, 'manifest.xml'), '<manifest projecttype="OTHER"/>');
		expect(() => getProjectManifestFile(projectFolder)).toThrow('must be either SUITEAPP or ACCOUNTCUSTOMIZATION');
	});
});
