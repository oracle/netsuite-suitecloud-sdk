/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const { mkdir, mkdtemp, readdir, rm, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { stringify } = require('yaml');

const {
	createPackageArchivePlan,
} = require('../../../sdk-core/build/commands/project/archive/ProjectArchivePlan');
const {
	createProjectArchive,
} = require('../../../sdk-core/build/commands/project/archive/ProjectArchive');
const {
	extractZipArchive,
} = require('../../../sdk-core/build/services/archive/ZipArchive');

describe('ProjectArchivePlan', () => {
	let projectFolder;
	let projectArchivePath;
	let extractionFolder;

	beforeEach(async () => {
		projectArchivePath = undefined;
		extractionFolder = undefined;
		projectFolder = await createSuiteAppProject();
	});

	afterEach(async () => {
		await Promise.all([
			projectFolder ? rm(projectFolder, { recursive: true, force: true }) : undefined,
			projectArchivePath ? rm(projectArchivePath, { force: true }) : undefined,
			extractionFolder ? rm(extractionFolder, { recursive: true, force: true }) : undefined,
		]);
	});

	it('includes run installation scripts and excludes files not selected by deploy.xml', async () => {
		const archivePlan = await createPackageArchivePlan(projectFolder);

		expect(listPlannedFiles(archivePlan.entries)).toEqual(expectedArchiveFiles());
	});

	it('uses the deploy.xml archive plan for project endpoint uploads', async () => {
		projectArchivePath = await createProjectArchive(projectFolder);
		extractionFolder = await mkdtemp(join(tmpdir(), 'suitecloud-project-archive-extracted-'));
		await extractZipArchive(projectArchivePath, extractionFolder);

		expect(await listFiles(extractionFolder)).toEqual(expectedArchiveFiles());
	});

	it.each(['<application>', ''])('rejects malformed application.xml before packaging: %j', async (contents) => {
		await writeFile(join(projectFolder, 'application.xml'), contents, 'utf8');
		await expect(createPackageArchivePlan(projectFolder)).rejects.toThrow('Invalid application.xml');
	});

	it.each(['json', 'yaml', 'yml'])('packages a V2 application.%s and rejects malformed syntax', async (format) => {
		await Promise.all([
			rm(join(projectFolder, 'manifest.xml')),
			rm(join(projectFolder, 'deploy.xml')),
			rm(join(projectFolder, 'application.xml')),
			writeFile(join(projectFolder, 'manifest.json'), '{"manifest":{"projecttype":"SUITEAPP","frameworkversion":"2.0"}}'),
			writeFile(join(projectFolder, 'deploy.json'), '{"deploy":[]}'),
			writeFile(join(projectFolder, `application.${format}`), format === 'json' ? '{"application":{}}' : 'application: {}'),
		]);
		const archivePlan = await createPackageArchivePlan(projectFolder);
		expect(listPlannedFiles(archivePlan.entries)).toContain(`application.${format}`);
		await writeFile(join(projectFolder, `application.${format}`), '{');
		await expect(createPackageArchivePlan(projectFolder)).rejects.toThrow(`Invalid application.${format}:`);
	});

	it.each([
		['json', 'json'], ['yaml', 'yaml'], ['yml', 'yml'],
		['json', 'yaml'], ['json', 'yml'], ['yaml', 'json'],
		['yaml', 'yml'], ['yml', 'json'], ['yml', 'yaml'],
	])('archives physical selections from manifest.%s and deploy.%s', async (manifestFormat, deployFormat) => {
		const manifest = { manifest: {
			projecttype: 'SUITEAPP', frameworkversion: '2.0', publisherid: 'com.example', projectid: 'app',
			projectname: 'Archive Test', projectversion: '1.0.0',
		} };
		const deploy = { deploy: [
			{ files: { path: '~/FileCabinet/SuiteScripts/selected.js' } },
			{ objects: { path: '~/Objects/customrecord_selected.xml' } },
			{ run: { script: { path: '~/Objects/customscript_install.xml', deployment: 'customdeploy_install' } } },
			{ files: { path: '~/FileCabinet/SuiteScripts/wildcard/*' } },
		] };
		await mkdir(join(projectFolder, 'FileCabinet', 'SuiteScripts', 'wildcard', 'nested'), { recursive: true });
		await Promise.all([
			rm(join(projectFolder, 'manifest.xml')),
			rm(join(projectFolder, 'deploy.xml')),
			rm(join(projectFolder, 'application.xml')),
			writeFile(join(projectFolder, `manifest.${manifestFormat}`), manifestFormat === 'json' ? JSON.stringify(manifest) : stringify(manifest)),
			writeFile(join(projectFolder, `deploy.${deployFormat}`), deployFormat === 'json' ? JSON.stringify(deploy) : stringify(deploy)),
			writeFile(join(projectFolder, 'FileCabinet', 'SuiteScripts', 'wildcard', 'first.js'), 'first'),
			writeFile(join(projectFolder, 'FileCabinet', 'SuiteScripts', 'wildcard', 'nested', 'second.js'), 'second'),
		]);
		const expectedFiles = expectedArchiveFiles()
			.filter((filename) => filename !== 'manifest.xml' && filename !== 'deploy.xml' && filename !== 'application.xml')
			.concat(`manifest.${manifestFormat}`, `deploy.${deployFormat}`,
				'FileCabinet/SuiteScripts/wildcard/first.js', 'FileCabinet/SuiteScripts/wildcard/nested/second.js')
			.sort();
		const archivePlan = await createPackageArchivePlan(projectFolder);
		expect(listPlannedFiles(archivePlan.entries)).toEqual(expectedFiles);
		projectArchivePath = await createProjectArchive(projectFolder);
		extractionFolder = await mkdtemp(join(tmpdir(), 'suitecloud-v2-archive-extracted-'));
		await extractZipArchive(projectArchivePath, extractionFolder);
		expect(await listFiles(extractionFolder)).toEqual(expectedFiles);
	});

	it('packages without an optional application control file', async () => {
		await rm(join(projectFolder, 'application.xml'));
		const archivePlan = await createPackageArchivePlan(projectFolder);
		expect(listPlannedFiles(archivePlan.entries)).toEqual(
			expectedArchiveFiles().filter((filename) => filename !== 'application.xml')
		);
	});

});

async function createSuiteAppProject() {
	const projectFolder = await mkdtemp(join(tmpdir(), 'suitecloud-project-archive-'));
	await Promise.all([
		mkdir(join(projectFolder, 'Objects'), { recursive: true }),
		mkdir(join(projectFolder, 'FileCabinet', 'SuiteScripts'), { recursive: true }),
		mkdir(join(projectFolder, 'FileCabinet', 'SuiteApps', 'com.example.app'), { recursive: true }),
	]);

	await Promise.all([
		writeFile(join(projectFolder, 'application.xml'), '<application/>', 'utf8'),
		writeFile(
			join(projectFolder, 'manifest.xml'),
			'<manifest projecttype="SUITEAPP">' +
				'<publisherid>com.example</publisherid>' +
				'<projectid>app</projectid>' +
				'<projectname>Archive Test</projectname>' +
				'<projectversion>1.0.0</projectversion>' +
				'<frameworkversion>1.0</frameworkversion>' +
			'</manifest>',
			'utf8'
		),
		writeFile(
			join(projectFolder, 'deploy.xml'),
			'<deploy>' +
				'<files><path>~/FileCabinet/SuiteScripts/selected.js</path></files>' +
				'<objects><path>~/Objects/customrecord_selected.xml</path></objects>' +
				'<run><script>' +
					'<path>~/Objects/customscript_install.xml</path>' +
					'<deployment>customdeploy_install</deployment>' +
				'</script></run>' +
			'</deploy>',
			'utf8'
		),
		writeFile(join(projectFolder, 'FileCabinet', 'SuiteScripts', 'selected.js'), 'selected', 'utf8'),
		writeFile(join(projectFolder, 'FileCabinet', 'SuiteScripts', 'not-selected.js'), 'not selected', 'utf8'),
		writeFile(
			join(projectFolder, 'Objects', 'customrecord_selected.xml'),
			'<customrecordtype scriptid="customrecord_selected"/>',
			'utf8'
		),
		writeFile(
			join(projectFolder, 'Objects', 'customscript_install.xml'),
			'<sdfinstallationscript scriptid="customscript_install">' +
				'<scriptfile>[/SuiteApps/com.example.app/install.js]</scriptfile>' +
			'</sdfinstallationscript>',
			'utf8'
		),
		writeFile(
			join(projectFolder, 'FileCabinet', 'SuiteApps', 'com.example.app', 'install.js'),
			'install',
			'utf8'
		),
	]);

	return projectFolder;
}

function expectedArchiveFiles() {
	return [
		'FileCabinet/SuiteApps/com.example.app/install.js',
		'FileCabinet/SuiteScripts/selected.js',
		'Objects/customrecord_selected.xml',
		'Objects/customscript_install.xml',
		'application.xml',
		'deploy.xml',
		'manifest.xml',
	];
}

function listPlannedFiles(entries) {
	return entries
		.filter((entry) => !entry.isDirectory)
		.map((entry) => entry.path)
		.sort();
}

async function listFiles(folder, prefix = '') {
	const files = [];
	for (const entry of await readdir(folder, { withFileTypes: true })) {
		const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
		if (entry.isDirectory()) {
			files.push(...(await listFiles(join(folder, entry.name), relativePath)));
		} else if (entry.isFile()) {
			files.push(relativePath);
		}
	}
	return files.sort();
}
