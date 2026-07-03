/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const {
	executePackageProject,
	PACKAGE_PROJECT_OPERATION_STATUS,
} = require('@oracle/suitecloud-sdk-core/commands/project/package/PackageProjectExecutor');

describe('PackageProjectExecutor', () => {
	let tempFolder;

	beforeEach(async () => {
		tempFolder = await fs.mkdtemp(path.join(os.tmpdir(), 'suitecloud-package-test-'));
	});

	afterEach(async () => {
		await fs.rm(tempFolder, { recursive: true, force: true });
	});

	it('packages only deploy-selected files and Java-compatible SuiteApp additions', async () => {
		const projectFolder = path.join(tempFolder, 'project');
		const destinationFolder = path.join(tempFolder, 'build');
		await writeFiles(projectFolder, {
			'manifest.xml': suiteAppManifest(),
			'deploy.xml': `<deploy>
				<files>
					<path>~/FileCabinet/SuiteApps/com.test.demo/data.json</path>
					<path>~/FileCabinet/SuiteApps/com.test.demo/missing.json</path>
				</files>
				<objects><path>~/Objects/*</path></objects>
				<translationimports><path>~/Translations/*</path></translationimports>
				<run><script><path>~/Objects/install.xml</path><deployment>customdeploy_install</deployment></script></run>
			</deploy>`,
			'application.xml': '<application/>',
			'InstallationPreferences/hiding.xml': '<preference/>',
			'InstallationPreferences/nested/locking.xml': '<preference/>',
			'FileCabinet/SuiteApps/com.test.demo/data.json': '{}',
			'FileCabinet/SuiteApps/com.test.demo/install.js': 'define([], () => ({}));',
			'Objects/custom.xml': '<customrecordtype/>',
			'Objects/install.xml': '<installationscript><scriptfile>/SuiteApps/com.test.demo/install.js</scriptfile></installationscript>',
			'Objects/metadata.json': '{}',
			'Translations/en_US.xml': '<translationcollection/>',
			'project.json': '{}',
			'suitecloud.log': 'not deployed',
		});

		const result = await executePackageProject({ projectFolder, destinationFolder });

		expect(result.status).toBe(PACKAGE_PROJECT_OPERATION_STATUS.SUCCESS);
		const entryNames = await extractEntryNames(result.data);
		expect(entryNames).toEqual([
			'FileCabinet/SuiteApps/com.test.demo/data.json',
			'FileCabinet/SuiteApps/com.test.demo/install.js',
			'InstallationPreferences/hiding.xml',
			'InstallationPreferences/nested/',
			'InstallationPreferences/nested/locking.xml',
			'Objects/custom.xml',
			'Objects/install.xml',
			'Objects/metadata.json',
			'Translations/en_US.xml',
			'application.xml',
			'deploy.xml',
			'manifest.xml',
		]);
	});

	it('packages ACP configuration paths but not SuiteApp installation preferences', async () => {
		const projectFolder = path.join(tempFolder, 'project');
		const destinationFolder = path.join(tempFolder, 'build');
		await writeFiles(projectFolder, {
			'manifest.xml': `<manifest projecttype="ACCOUNTCUSTOMIZATIONPROJECT"><projectname>account-project</projectname></manifest>`,
			'deploy.xml': `<deploy><configuration><path>~/AccountConfiguration/*</path></configuration></deploy>`,
			'AccountConfiguration/settings.xml': '<settings/>',
			'InstallationPreferences/hiding.xml': '<preference/>',
		});

		const result = await executePackageProject({ projectFolder, destinationFolder });

		expect(result.status).toBe(PACKAGE_PROJECT_OPERATION_STATUS.SUCCESS);
		await expect(extractEntryNames(result.data)).resolves.toEqual([
			'AccountConfiguration/settings.xml',
			'deploy.xml',
			'manifest.xml',
		]);
	});

	it.each([
		['malformed manifest XML', '{"projecttype":"SUITEAPP"}', '<deploy/>', undefined, 'Invalid manifest.xml'],
		['incorrect manifest root', '<project/>', '<deploy/>', undefined, 'expected <manifest>'],
		['malformed deploy XML', suiteAppManifest(), 'files: []', undefined, 'Invalid deploy.xml'],
		['incorrect deploy root', suiteAppManifest(), '<deployment/>', undefined, 'expected <deploy>'],
		['malformed application XML', suiteAppManifest(), '<deploy/>', 'application: true', 'Invalid application.xml'],
	])('rejects %s before creating the destination', async (_name, manifest, deploy, application, expectedError) => {
		const projectFolder = path.join(tempFolder, 'project');
		const destinationFolder = path.join(tempFolder, 'build');
		const files = { 'manifest.xml': manifest, 'deploy.xml': deploy };
		if (application !== undefined) {
			files['application.xml'] = application;
		}
		await writeFiles(projectFolder, files);

		const result = await executePackageProject({ projectFolder, destinationFolder });

		expect(result.status).toBe(PACKAGE_PROJECT_OPERATION_STATUS.ERROR);
		expect(result.errorMessages[0]).toContain(expectedError);
		await expect(fs.access(destinationFolder)).rejects.toMatchObject({ code: 'ENOENT' });
	});
});

function suiteAppManifest() {
	return `<manifest projecttype="SUITEAPP">
		<publisherid>com.test</publisherid>
		<projectid>demo</projectid>
		<projectname>demo</projectname>
		<projectversion>1.0.0</projectversion>
	</manifest>`;
}

async function writeFiles(root, files) {
	for (const [relativePath, contents] of Object.entries(files)) {
		const filepath = path.join(root, ...relativePath.split('/'));
		await fs.mkdir(path.dirname(filepath), { recursive: true });
		await fs.writeFile(filepath, contents);
	}
}

async function extractEntryNames(archivePath) {
	const archive = await fs.readFile(archivePath);
	let endOffset = archive.length - 22;
	while (endOffset >= 0 && archive.readUInt32LE(endOffset) !== 0x06054b50) {
		endOffset--;
	}
	const entryCount = archive.readUInt16LE(endOffset + 10);
	let offset = archive.readUInt32LE(endOffset + 16);
	const names = [];
	for (let index = 0; index < entryCount; index++) {
		const nameLength = archive.readUInt16LE(offset + 28);
		const extraLength = archive.readUInt16LE(offset + 30);
		const commentLength = archive.readUInt16LE(offset + 32);
		names.push(archive.subarray(offset + 46, offset + 46 + nameLength).toString('utf8'));
		offset += 46 + nameLength + extraLength + commentLength;
	}
	return names.sort();
}
