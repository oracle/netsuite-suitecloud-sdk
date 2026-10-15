/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const { mkdtemp, rm, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const {
	getProjectControlFiles,
	inspectControlFilesAndGetProjectDescription,
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

		const description = inspectControlFilesAndGetProjectDescription(projectFolder);
		const cliInfo = new ProjectInfoService(projectFolder);
		expect(description.controlFiles).toEqual(getProjectControlFiles(projectFolder));
		expect(description.controlFiles).toMatchObject({
			manifest: { filePath: join(projectFolder, 'manifest.xml') },
			deploy: { filePath: join(projectFolder, 'deploy.xml') },
			application: { fileName: 'application.xml', filePath: join(projectFolder, 'application.xml'), fileFormat: 'xml' },
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
		expect(description.deploy).toEqual({
			files: ['~/FileCabinet/first.js', '~/FileCabinet/second.js'],
			objects: ['~/Objects/record.xml'], run: [], translationimports: [], configurations: [],
		});
	});

	it('discovers a mixed JSON and YAML V2 pair without misclassifying unrelated files', async () => {
		await writeFile(join(projectFolder, 'manifest.yaml'), 'manifest:\n  projecttype: ACCOUNTCUSTOMIZATION\n  frameworkversion: "2.0"');
		await writeFile(join(projectFolder, 'deploy.json'), '{"deploy": []}');
		await writeFile(join(projectFolder, 'translation.xml'), '<xliff/>');
		expect(getProjectControlFiles(projectFolder)).toMatchObject({
			manifest: { fileName: 'manifest.yaml', filePath: join(projectFolder, 'manifest.yaml') },
			deploy: { fileName: 'deploy.json', filePath: join(projectFolder, 'deploy.json') },
		});
		const description = inspectControlFilesAndGetProjectDescription(projectFolder);
		expect(description.manifest).toEqual(getProjectManifestFile(projectFolder));
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

		expect(inspectControlFilesAndGetProjectDescription(projectFolder).deploy).toEqual({
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

		expect(() => inspectControlFilesAndGetProjectDescription(projectFolder))
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
		expect(() => getProjectManifestFile(projectFolder)).toThrow(errorMessage);
		expect(() => inspectControlFilesAndGetProjectDescription(projectFolder)).toThrow(errorMessage);
	});

	it.each(['xml', 'json', 'yaml', 'yml'])('requires the expected framework version in manifest.%s', async (format) => {
		await writeFile(join(projectFolder, format === 'xml' ? 'deploy.xml' : 'deploy.json'), format === 'xml' ? '<deploy/>' : '{"deploy": []}');
		for (const frameworkVersion of [undefined, '', '   ', '3.0', '2.0.0', format === 'xml' ? '1.0' : '2.0']) {
			const manifestContents = format === 'xml'
				? `<manifest projecttype="ACCOUNTCUSTOMIZATION">${frameworkVersion === undefined ? '' : `<frameworkversion>${frameworkVersion}</frameworkversion>`}</manifest>`
				: JSON.stringify({ manifest: { projecttype: 'ACCOUNTCUSTOMIZATION', frameworkversion: frameworkVersion } });
			await writeFile(join(projectFolder, `manifest.${format}`), manifestContents);
			if (frameworkVersion === (format === 'xml' ? '1.0' : '2.0')) {
				expect(getProjectManifestFile(projectFolder).frameworkVersion).toBe(frameworkVersion);
				expect(inspectControlFilesAndGetProjectDescription(projectFolder)).toMatchObject({ manifest: { frameworkVersion } });
			} else {
				const errorMessage = !frameworkVersion?.trim()
					? `Missing required "frameworkversion" field in manifest.${format}.`
					: `${frameworkVersion} in manifest.${format} does not match`;
				expect(() => getProjectManifestFile(projectFolder)).toThrow(errorMessage);
				expect(() => inspectControlFilesAndGetProjectDescription(projectFolder)).toThrow(errorMessage);
			}
		}
	});

	it('rejects missing, duplicate, and mixed-generation control files', async () => {
		await writeFile(join(projectFolder, 'manifest.xml'), '<manifest/>');
		expect(() => getProjectControlFiles(projectFolder)).toThrow('Missing deploy control file');
		await writeFile(join(projectFolder, 'deploy.yaml'), 'files: []');
		expect(() => getProjectControlFiles(projectFolder)).toThrow('cannot be mixed');
		await writeFile(join(projectFolder, 'manifest.json'), '{}');
		expect(() => getProjectControlFiles(projectFolder)).toThrow('Multiple manifest control files');
	});

	it('selects a V2 control pair alongside application.xml', async () => {
		await writeFile(join(projectFolder, 'manifest.json'), '{}');
		await writeFile(join(projectFolder, 'deploy.yml'), '{}');
		await writeFile(join(projectFolder, 'application.xml'), '<application/>');
		const controlFiles = getProjectControlFiles(projectFolder);
		expect(controlFiles).toMatchObject({
			manifest: { fileName: 'manifest.json' },
			deploy: { fileName: 'deploy.yml' },
			application: { fileName: 'application.xml', fileFormat: 'xml' },
		});
	});

	it.each(['json', 'yaml', 'yml'])('reports invalid manifest.%s consistently during metadata reads and inspection', async (format) => {
		await writeFile(join(projectFolder, `manifest.${format}`), '{');
		await writeFile(join(projectFolder, 'deploy.json'), '{"deploy": []}');
		const errorMessage = `Invalid manifest.${format}:`;
		expect(() => getProjectManifestFile(projectFolder)).toThrow(errorMessage);
		expect(() => inspectControlFilesAndGetProjectDescription(projectFolder)).toThrow(errorMessage);
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

		const description = inspectControlFilesAndGetProjectDescription(projectFolder);
		const cliInfo = new ProjectInfoService(projectFolder);
		expect(description.manifest).toEqual(getProjectManifestFile(projectFolder));
		expect(description.manifest.applicationId).toBe(cliInfo.getApplicationId());
		expect(cliInfo.getApplicationId()).toBe('com.example.app');
		expect(description.manifest.frameworkVersion).toBe('2.0');
		expect(description.deploy.files)
			.toEqual(['~/FileCabinet/first.js', '~/FileCabinet/second.js']);
	});

	it.each(['json', 'yaml', 'yml'])('rejects malformed deploy.%s during inspection while metadata reads remain independent', async (format) => {
		await writeFile(join(projectFolder, 'manifest.json'), '{"manifest": {"projecttype": "ACCOUNTCUSTOMIZATION", "frameworkversion": "2.0"}}');
		await writeFile(join(projectFolder, `deploy.${format}`), '{');
		expect(getProjectManifestFile(projectFolder).projectType).toBe('ACCOUNTCUSTOMIZATION');
		expect(() => inspectControlFilesAndGetProjectDescription(projectFolder)).toThrow(`Invalid deploy.${format}:`);
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

		expect(getProjectManifestFile(projectFolder).applicationId).toBe('com.example.app');
		expect(() => inspectControlFilesAndGetProjectDescription(projectFolder)).toThrow(inspectionError);
	});

	it('still rejects missing and duplicate manifests during metadata reads', async () => {
		expect(() => getProjectManifestFile(projectFolder)).toThrow('Missing manifest control file');
		await writeFile(join(projectFolder, 'manifest.xml'), '<manifest projecttype="ACCOUNTCUSTOMIZATION"><frameworkversion>1.0</frameworkversion></manifest>');
		await writeFile(join(projectFolder, 'manifest.yml'), '{}');
		expect(() => getProjectManifestFile(projectFolder)).toThrow('Multiple manifest control files');
	});

	it.each([false, true])('ignores JSON and YAML application files with application.xml present: %s', async (hasApplicationXml) => {
		await Promise.all([
			writeFile(join(projectFolder, 'manifest.xml'), '<manifest projecttype="ACCOUNTCUSTOMIZATION"><frameworkversion>1.0</frameworkversion></manifest>'),
			writeFile(join(projectFolder, 'deploy.xml'), '<deploy/>'),
			writeFile(join(projectFolder, 'application.json'), 'invalid JSON'),
			writeFile(join(projectFolder, 'application.yaml'), 'invalid YAML'),
			writeFile(join(projectFolder, 'application.yml'), 'invalid YAML'),
		]);
		if (hasApplicationXml) {
			await writeFile(join(projectFolder, 'application.xml'), '<application/>');
		}

		const description = inspectControlFilesAndGetProjectDescription(projectFolder);
		expect(description.controlFiles.application?.fileName).toBe(hasApplicationXml ? 'application.xml' : undefined);
	});

	it.each(['<application>', ''])('leaves application.xml content validation to packaging: %j', async (contents) => {
		await writeFile(join(projectFolder, 'manifest.xml'), '<manifest projecttype="ACCOUNTCUSTOMIZATION"><frameworkversion>1.0</frameworkversion></manifest>');
		await writeFile(join(projectFolder, 'deploy.xml'), '<deploy/>');
		await writeFile(join(projectFolder, 'application.xml'), contents);
		const description = inspectControlFilesAndGetProjectDescription(projectFolder);
		expect(description.controlFiles.application.fileName).toBe('application.xml');
	});

	it('reports a malformed manifest and wrong deploy root with their filenames', async () => {
		await writeFile(join(projectFolder, 'manifest.xml'), '<manifest>');
		await writeFile(join(projectFolder, 'deploy.xml'), '<deploy/>');
		expect(() => inspectControlFilesAndGetProjectDescription(projectFolder)).toThrow('Invalid manifest.xml');
		await writeFile(join(projectFolder, 'manifest.xml'), '<manifest projecttype="ACCOUNTCUSTOMIZATION"><frameworkversion>1.0</frameworkversion></manifest>');
		await writeFile(join(projectFolder, 'deploy.xml'), '<other/>');
		expect(() => inspectControlFilesAndGetProjectDescription(projectFolder)).toThrow('Invalid deploy.xml: expected <deploy>');
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
				expect(getProjectManifestFile(projectFolder).projectType).toBe(projectType);
				expect(inspectControlFilesAndGetProjectDescription(projectFolder).manifest.projectType).toBe(projectType);
			} else {
				const errorMessage = projectType ? 'must be either SUITEAPP or ACCOUNTCUSTOMIZATION' : 'does not contain the projecttype attribute';
				expect(() => getProjectManifestFile(projectFolder)).toThrow(errorMessage);
				expect(() => inspectControlFilesAndGetProjectDescription(projectFolder)).toThrow(errorMessage);
			}
		}
	});
});
