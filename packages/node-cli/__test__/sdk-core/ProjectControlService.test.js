/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const { mkdtemp, rm, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const {
	checkValidProjectContext,
	checkValidControlFileSetup,
	readProjectControlFilesSetup,
	readProjectContext,
	readProjectManifest,
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

		const description = readProjectContext(projectFolder);
		const cliInfo = new ProjectInfoService(projectFolder);
		expect(checkValidProjectContext(projectFolder)).toBeUndefined();
		expect(checkValidControlFileSetup(projectFolder)).toBeUndefined();
		expect(description.controlFiles).toEqual(readProjectControlFilesSetup(projectFolder));
		expect(description.controlFiles).toMatchObject({
			manifest: { filePath: join(projectFolder, 'manifest.xml') },
			deploy: { filePath: join(projectFolder, 'deploy.xml') },
			application: { fileName: 'application.xml', filePath: join(projectFolder, 'application.xml'), fileFormat: 'xml' },
		});
		expect(description.manifest).toEqual(readProjectManifest(projectFolder));
		expect(description.manifest).toMatchObject({
			projectType: cliInfo.getProjectType(),
			projectName: cliInfo.getProjectName(),
			publisherId: cliInfo.getPublisherId(),
			projectId: cliInfo.getProjectId(),
			frameworkVersion: '1.0',
		});
		expect(cliInfo.getApplicationId()).toBe('com.example.app');
		expect(description.manifest.applicationId).toBe('com.example.app');
		expect(description.deploy).toEqual({
			files: ['~/FileCabinet/first.js', '~/FileCabinet/second.js'],
			objects: ['~/Objects/record.xml'], run: [], translationimports: [], configurations: [],
		});
	});

	it('discovers a mixed JSON and YAML V2 pair without misclassifying unrelated files', async () => {
		await writeFile(join(projectFolder, 'manifest.yaml'), 'manifest:\n  projecttype: ACCOUNTCUSTOMIZATION\n  frameworkversion: "2.0"');
		await writeFile(join(projectFolder, 'deploy.json'), '{"deploy": []}');
		await writeFile(join(projectFolder, 'translation.xml'), '<xliff/>');
		expect(readProjectControlFilesSetup(projectFolder)).toMatchObject({
			manifest: { fileName: 'manifest.yaml', filePath: join(projectFolder, 'manifest.yaml') },
			deploy: { fileName: 'deploy.json', filePath: join(projectFolder, 'deploy.json') },
		});
		const description = readProjectContext(projectFolder);
		expect(description.manifest).toEqual(readProjectManifest(projectFolder));
		expect(description.manifest.frameworkVersion).toBe('2.0');
		expect(description.deploy).toEqual({ files: [], objects: [], run: [], translationimports: [], configurations: [] });
	});

	it.each(['xml', 'json', 'yaml', 'yml'])('collects repeated path sections and run scripts in deploy.%s', async (format) => {
		const manifest = format === 'xml'
			? '<manifest projecttype="SUITEAPP"><frameworkversion>1.0</frameworkversion></manifest>'
			: '{"manifest": {"projecttype": "SUITEAPP", "frameworkversion": "2.0"}}';
		const deploy = format === 'xml'
			? '<deploy><run><script><path>~/Objects/first.xml</path><deployment>first</deployment></script></run>' +
				'<files><path>~/FileCabinet/first.js</path></files><run/>' +
				'<run><script><path>~/Objects/second.xml</path><deployment>second</deployment></script></run>' +
				'<files><path>~/FileCabinet/second.js</path></files></deploy>'
			: JSON.stringify({ deploy: [
				{ run: { script: { path: '~/Objects/first.xml', deployment: 'first' } } },
				{ files: { path: '~/FileCabinet/first.js' } },
				{ run: {} },
				{ run: { script: [{ path: '~/Objects/second.xml', deployment: 'second' }] } },
				{ files: { path: ['~/FileCabinet/second.js'] } },
			] });
		await writeFile(join(projectFolder, `manifest.${format}`), manifest);
		await writeFile(join(projectFolder, `deploy.${format}`), deploy);

		expect(readProjectContext(projectFolder).deploy).toEqual({
			files: ['~/FileCabinet/first.js', '~/FileCabinet/second.js'],
			objects: [], translationimports: [], configurations: [],
			run: [
				{ path: '~/Objects/first.xml', deployment: 'first' },
				{ path: '~/Objects/second.xml', deployment: 'second' },
			],
		});
	});

	it.each(['xml', 'json', 'yaml', 'yml'])('rejects unsupported sections in deploy.%s', async (format) => {
		const manifest = format === 'xml'
			? '<manifest projecttype="SUITEAPP"><frameworkversion>1.0</frameworkversion></manifest>'
			: '{"manifest": {"projecttype": "SUITEAPP", "frameworkversion": "2.0"}}';
		const deploy = format === 'xml' ? '<deploy><unsupported/></deploy>' : '{"deploy": [{"unsupported": {}}]}';
		await writeFile(join(projectFolder, `manifest.${format}`), manifest);
		await writeFile(join(projectFolder, `deploy.${format}`), deploy);

		expect(() => readProjectContext(projectFolder))
			.toThrow(`Invalid deploy.${format} at /deploy/${format === 'xml' ? '' : '0/'}unsupported: expected a supported deploy group`);
	});

	it.each(['xml', 'json', 'yaml', 'yml'])('rejects a framework version that does not match manifest.%s', async (format) => {
		const frameworkVersion = format === 'xml' ? '2.0' : '1.0';
		const manifestContents = format === 'xml'
			? `<manifest projecttype="ACCOUNTCUSTOMIZATION"><frameworkversion>${frameworkVersion}</frameworkversion></manifest>`
			: JSON.stringify({ manifest: { projecttype: 'ACCOUNTCUSTOMIZATION', frameworkversion: frameworkVersion } });
		await writeFile(join(projectFolder, `manifest.${format}`), manifestContents);
		await writeFile(join(projectFolder, format === 'xml' ? 'deploy.xml' : 'deploy.json'), format === 'xml' ? '<deploy/>' : '{"deploy": []}');

		const errorMessage = `${frameworkVersion} in manifest.${format} does not match the control-file generation.`;
		expect(() => readProjectManifest(projectFolder)).toThrow(errorMessage);
		expect(() => readProjectContext(projectFolder)).toThrow(errorMessage);
	});

	it.each(['xml', 'json', 'yaml', 'yml'])('requires the expected framework version in manifest.%s', async (format) => {
		await writeFile(join(projectFolder, format === 'xml' ? 'deploy.xml' : 'deploy.json'), format === 'xml' ? '<deploy/>' : '{"deploy": []}');
		for (const frameworkVersion of [undefined, '', '   ', '3.0', '2.0.0', format === 'xml' ? '1.0' : '2.0']) {
			const manifestContents = format === 'xml'
				? `<manifest projecttype="ACCOUNTCUSTOMIZATION">${frameworkVersion === undefined ? '' : `<frameworkversion>${frameworkVersion}</frameworkversion>`}</manifest>`
				: JSON.stringify({ manifest: { projecttype: 'ACCOUNTCUSTOMIZATION', frameworkversion: frameworkVersion } });
			await writeFile(join(projectFolder, `manifest.${format}`), manifestContents);
			if (frameworkVersion === (format === 'xml' ? '1.0' : '2.0')) {
				expect(readProjectManifest(projectFolder).frameworkVersion).toBe(frameworkVersion);
				expect(readProjectContext(projectFolder)).toMatchObject({ manifest: { frameworkVersion } });
			} else {
				const errorMessage = !frameworkVersion?.trim()
					? `Missing required "frameworkversion" field in manifest.${format}.`
					: `${frameworkVersion} in manifest.${format} does not match`;
				expect(() => readProjectManifest(projectFolder)).toThrow(errorMessage);
				expect(() => readProjectContext(projectFolder)).toThrow(errorMessage);
			}
		}
	});

	it('rejects missing, duplicate, and mixed-generation control files', async () => {
		await writeFile(join(projectFolder, 'manifest.xml'), '<manifest/>');
		expect(() => checkValidControlFileSetup(projectFolder)).toThrow('Missing deploy control file');
		await writeFile(join(projectFolder, 'deploy.yaml'), 'files: []');
		expect(() => checkValidControlFileSetup(projectFolder)).toThrow('cannot be mixed');
		await writeFile(join(projectFolder, 'manifest.json'), '{}');
		expect(() => checkValidControlFileSetup(projectFolder)).toThrow('Multiple manifest control files');
	});

	it.each([
		['xml', 'json'], ['xml', 'yaml'], ['xml', 'yml'],
		['json', 'xml'], ['yaml', 'xml'], ['yml', 'xml'],
	])('rejects mixed generations including application.%s with manifest.%s', async (applicationFormat, manifestFormat) => {
		await writeFile(join(projectFolder, `manifest.${manifestFormat}`), '{}');
		await writeFile(join(projectFolder, `deploy.${manifestFormat}`), '{}');
		await writeFile(join(projectFolder, `application.${applicationFormat}`), '{}');
		expect(() => checkValidControlFileSetup(projectFolder)).toThrow('cannot be mixed');
		expect(() => readProjectContext(projectFolder)).toThrow(`application.${applicationFormat}`);
	});

	it.each(['json', 'yaml', 'yml'])('reports invalid manifest.%s consistently during metadata reads and inspection', async (format) => {
		await writeFile(join(projectFolder, `manifest.${format}`), '{');
		await writeFile(join(projectFolder, 'deploy.json'), '{"deploy": []}');
		const errorMessage = `Invalid manifest.${format}:`;
		expect(() => readProjectManifest(projectFolder)).toThrow(errorMessage);
		expect(() => readProjectContext(projectFolder)).toThrow(errorMessage);
	});

	it.each([
		['json', 'yaml'], ['json', 'yml'], ['json', 'json'],
		['yaml', 'json'], ['yaml', 'yaml'], ['yaml', 'yml'],
		['yml', 'json'], ['yml', 'yaml'], ['yml', 'yml'],
	])('shares manifest.%s and deploy.%s metadata with the synchronous CLI facade', async (manifestFormat, deployFormat) => {
		const manifestContents = manifestFormat === 'json'
			? JSON.stringify({ manifest: { projecttype: 'SUITEAPP', publisherid: 'com.example', projectid: 'app', frameworkversion: '2.0' } })
			: 'manifest:\n  projecttype: SUITEAPP\n  publisherid: com.example\n  projectid: app\n  frameworkversion: "2.0"';
		const deployContents = deployFormat === 'json'
			? JSON.stringify({ deploy: [{ files: { path: '~/FileCabinet/first.js' } }, { files: { path: '~/FileCabinet/second.js' } }] })
			: 'deploy:\n  - files:\n      path: ~/FileCabinet/first.js\n  - files:\n      path: ~/FileCabinet/second.js';
		await writeFile(join(projectFolder, `manifest.${manifestFormat}`), manifestContents);
		await writeFile(join(projectFolder, `deploy.${deployFormat}`), deployContents);

		const description = readProjectContext(projectFolder);
		const cliInfo = new ProjectInfoService(projectFolder);
		expect(description.manifest).toEqual(readProjectManifest(projectFolder));
		expect(description.manifest.applicationId).toBe(cliInfo.getApplicationId());
		expect(cliInfo.getApplicationId()).toBe('com.example.app');
		expect(description.manifest.frameworkVersion).toBe('2.0');
		expect(description.deploy.files)
			.toEqual(['~/FileCabinet/first.js', '~/FileCabinet/second.js']);
	});

	it.each(['json', 'yaml', 'yml'])('rejects malformed deploy.%s during inspection while metadata reads remain independent', async (format) => {
		await writeFile(join(projectFolder, 'manifest.json'), '{"manifest": {"projecttype": "ACCOUNTCUSTOMIZATION", "frameworkversion": "2.0"}}');
		await writeFile(join(projectFolder, `deploy.${format}`), '{');
		expect(checkValidControlFileSetup(projectFolder)).toBeUndefined();
		expect(readProjectManifest(projectFolder).projectType).toBe('ACCOUNTCUSTOMIZATION');
		expect(() => checkValidProjectContext(projectFolder)).toThrow(`Invalid deploy.${format}:`);
		expect(() => readProjectContext(projectFolder)).toThrow(`Invalid deploy.${format}:`);
	});

	it.each([
		['missing deploy', [], 'Missing deploy control file'],
		['duplicate deploy', ['deploy.xml', 'deploy.json'], 'Multiple deploy control files'],
		['mixed-generation deploy', ['deploy.json'], 'cannot be mixed'],
		['malformed deploy', ['deploy.xml'], 'Invalid deploy.xml'],
	])('reads manifest metadata independently of %s and application contents', async (_name, deployFiles, inspectionError) => {
		await writeFile(join(projectFolder, 'manifest.xml'),
			'<manifest projecttype="SUITEAPP"><publisherid>com.example</publisherid><projectid>app</projectid><frameworkversion>1.0</frameworkversion></manifest>');
		await writeFile(join(projectFolder, 'application.xml'), '<application>');
		await Promise.all(deployFiles.map((filename) => writeFile(join(projectFolder, filename), '<deploy>')));

		expect(readProjectManifest(projectFolder).applicationId).toBe('com.example.app');
		expect(() => readProjectContext(projectFolder)).toThrow(inspectionError);
	});

	it('still rejects missing and duplicate manifests during metadata reads', async () => {
		expect(() => readProjectManifest(projectFolder)).toThrow('Missing manifest control file');
		await writeFile(join(projectFolder, 'manifest.xml'), '<manifest projecttype="ACCOUNTCUSTOMIZATION"><frameworkversion>1.0</frameworkversion></manifest>');
		await writeFile(join(projectFolder, 'manifest.yml'), '{}');
		expect(() => readProjectManifest(projectFolder)).toThrow('Multiple manifest control files');
	});

	it.each(['xml', 'json', 'yaml', 'yml'])('allows application.%s only for SuiteApp projects', async (format) => {
		await writeFile(join(projectFolder, `deploy.${format}`), format === 'xml' ? '<deploy/>' : '{"deploy": []}');
		await writeFile(join(projectFolder, `application.${format}`), '{}');
		for (const projectType of ['SUITEAPP', 'ACCOUNTCUSTOMIZATION']) {
			await writeFile(join(projectFolder, `manifest.${format}`), format === 'xml'
				? `<manifest projecttype="${projectType}"><frameworkversion>1.0</frameworkversion></manifest>`
				: JSON.stringify({ manifest: { projecttype: projectType, frameworkversion: '2.0' } }));
			if (projectType === 'SUITEAPP') {
				expect(readProjectContext(projectFolder).controlFiles.application.fileName).toBe(`application.${format}`);
			} else {
				expect(() => checkValidProjectContext(projectFolder)).toThrow(`The application.${format} control file is only allowed in SuiteApp projects.`);
				expect(() => readProjectContext(projectFolder)).toThrow('only allowed in SuiteApp projects');
			}
		}
	});

	it.each(['<application>', ''])('leaves application.xml content validation to packaging: %j', async (contents) => {
		await writeFile(join(projectFolder, 'manifest.xml'), '<manifest projecttype="SUITEAPP"><frameworkversion>1.0</frameworkversion></manifest>');
		await writeFile(join(projectFolder, 'deploy.xml'), '<deploy/>');
		await writeFile(join(projectFolder, 'application.xml'), contents);
		const description = readProjectContext(projectFolder);
		expect(description.controlFiles.application.fileName).toBe('application.xml');
	});

	it('reports a malformed manifest and wrong deploy root with their filenames', async () => {
		await writeFile(join(projectFolder, 'manifest.xml'), '<manifest>');
		await writeFile(join(projectFolder, 'deploy.xml'), '<deploy/>');
		expect(() => readProjectContext(projectFolder)).toThrow('Invalid manifest.xml');
		await writeFile(join(projectFolder, 'manifest.xml'), '<manifest projecttype="ACCOUNTCUSTOMIZATION"><frameworkversion>1.0</frameworkversion></manifest>');
		await writeFile(join(projectFolder, 'deploy.xml'), '<other/>');
		expect(() => readProjectContext(projectFolder)).toThrow('Invalid deploy.xml: expected <deploy>');
	});

	it.each(['xml', 'json', 'yaml', 'yml'])('validates project types before returning a finalized manifest.%s', async (format) => {
		await writeFile(join(projectFolder, format === 'xml' ? 'deploy.xml' : 'deploy.json'), format === 'xml' ? '<deploy/>' : '{"deploy": []}');
		for (const projectType of [undefined, '', 'OTHER', 'suiteapp', 'SUITEAPP', 'ACCOUNTCUSTOMIZATION']) {
			const frameworkVersion = format === 'xml' ? '1.0' : '2.0';
			const contents = format === 'xml'
				? `<manifest${projectType === undefined ? '' : ` projecttype="${projectType}"`}><frameworkversion>${frameworkVersion}</frameworkversion></manifest>`
				: JSON.stringify({ manifest: { projecttype: projectType, frameworkversion: frameworkVersion } });
			await writeFile(join(projectFolder, `manifest.${format}`), contents);
			if (projectType === 'SUITEAPP' || projectType === 'ACCOUNTCUSTOMIZATION') {
				expect(readProjectManifest(projectFolder).projectType).toBe(projectType);
				expect(readProjectContext(projectFolder).manifest.projectType).toBe(projectType);
			} else {
				const errorMessage = projectType ? 'must be either SUITEAPP or ACCOUNTCUSTOMIZATION' : 'does not contain the projecttype attribute';
				expect(() => readProjectManifest(projectFolder)).toThrow(errorMessage);
				expect(() => readProjectContext(projectFolder)).toThrow(errorMessage);
			}
		}
	});
});
