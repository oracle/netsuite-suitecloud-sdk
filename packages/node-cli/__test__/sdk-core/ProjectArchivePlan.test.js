/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const { mkdir, mkdtemp, readdir, rm, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

const {
	createPackageArchivePlan,
} = require('../../../sdk-core/build/services/project/ProjectArchivePlan');
const {
	DefaultProjectArchiveService,
} = require('../../../sdk-core/build/services/project/ProjectArchiveService');
const {
	extractZipArchive,
} = require('../../../sdk-core/build/services/archive/ZipArchive');

describe('ProjectArchivePlan', () => {
	let projectFolder;
	let projectArchivePath;
	let extractionFolder;

	beforeEach(async () => {
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
		projectArchivePath = await new DefaultProjectArchiveService().create(projectFolder);
		extractionFolder = await mkdtemp(join(tmpdir(), 'suitecloud-project-archive-extracted-'));
		await extractZipArchive(projectArchivePath, extractionFolder);

		expect(await listFiles(extractionFolder)).toEqual(expectedArchiveFiles());
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
		writeFile(
			join(projectFolder, 'manifest.xml'),
			'<manifest projecttype="SUITEAPP">' +
				'<publisherid>com.example</publisherid>' +
				'<projectid>app</projectid>' +
				'<projectname>Archive Test</projectname>' +
				'<projectversion>1.0.0</projectversion>' +
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
