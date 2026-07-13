/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { EventEmitter } = require('node:events');
const { access, mkdtemp, readFile, rm, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { dirname, join } = require('node:path');

const mockSpawn = jest.fn();
jest.mock('node:child_process', () => ({
	...jest.requireActual('node:child_process'),
	spawn: mockSpawn,
}));

const {
	CREATE_PROJECT_OPERATION_STATUS,
	executeCreateProject,
	executeCreateProjectWorkflow,
} = require('@oracle/suitecloud-sdk-core').commands;

const SDK_CORE_ROOT = dirname(require.resolve('@oracle/suitecloud-sdk-core/package.json'));
const TEMPLATE_ROOT = join(SDK_CORE_ROOT, 'build/resources/templates');

describe('CreateProjectExecutor', () => {
	let temporaryFolder;

	beforeEach(async () => {
		mockSpawn.mockReset();
		temporaryFolder = await mkdtemp(join(tmpdir(), 'suitecloud-createproject-'));
	});

	afterEach(async () => {
		await rm(temporaryFolder, { recursive: true, force: true });
	});

	it('should create an ACP from the authoritative project templates', async () => {
		const result = await executeCreateProject({
			parentdirectory: temporaryFolder,
			type: 'ACCOUNTCUSTOMIZATION',
			projectname: 'My ACP',
		});

		expect(result.status).toBe(CREATE_PROJECT_OPERATION_STATUS.SUCCESS);
		expect(await readFile(join(result.data, 'deploy.xml'), 'utf8')).toBe(
			await readTemplate('project/project_deploy_acp.xml')
		);
		expect(await readFile(join(result.data, 'manifest.xml'), 'utf8')).toBe(
			'<manifest projecttype="ACCOUNTCUSTOMIZATION">\n' +
				'    <projectname>My ACP</projectname>\n' +
				'    <frameworkversion>1.0</frameworkversion>\n' +
				'</manifest>'
		);

		await expectDirectories(result.data, [
			'AccountConfiguration',
			'FileCabinet/SuiteScripts',
			'FileCabinet/Web Site Hosting Files/Live Hosting Files',
			'FileCabinet/Web Site Hosting Files/Staging Hosting Files',
			'FileCabinet/Templates/E-mail Templates',
			'FileCabinet/Templates/Marketing Templates',
			'Objects',
			'Translations',
		]);
	});

	it('should create a SuiteApp from the authoritative project templates', async () => {
		const result = await executeCreateProject({
			parentdirectory: temporaryFolder,
			type: 'SUITEAPP',
			projectname: 'My SuiteApp',
			publisherid: 'com.example',
			projectid: 'application',
			projectversion: '2.1.0',
		});

		expect(result.status).toBe(CREATE_PROJECT_OPERATION_STATUS.SUCCESS);
		const deployTemplate = await readTemplate('project/project_deploy_suiteapp.xml');
		expect(await readFile(join(result.data, 'deploy.xml'), 'utf8')).toBe(
			deployTemplate.split('${applicationId}').join('com.example.application')
		);
		expect(await readFile(join(result.data, 'manifest.xml'), 'utf8')).toContain(
			'<projectversion>2.1.0</projectversion>'
		);

		for (const filename of ['hiding.xml', 'locking.xml', 'overwriting.xml']) {
			expect(await readFile(join(result.data, 'InstallationPreferences', filename), 'utf8')).toBe(
				await readTemplate(`project/suiteapp_${filename}`)
			);
		}
		await expectDirectories(result.data, [
			'FileCabinet/SuiteApps/com.example.application',
			'FileCabinet/Web Site Hosting Files',
			'Objects',
			'Translations',
		]);
	});

	it('should reject unsupported project types', async () => {
		const result = await executeCreateProject({
			parentdirectory: temporaryFolder,
			type: 'UNKNOWN',
			projectname: 'invalid',
		});

		expect(result.status).toBe(CREATE_PROJECT_OPERATION_STATUS.ERROR);
		expect(result.errorMessages).toEqual(['Unsupported project type "UNKNOWN".']);
	});

	it('should require SuiteApp identifiers', async () => {
		const result = await executeCreateProject({
			parentdirectory: temporaryFolder,
			type: 'SUITEAPP',
			projectname: 'My SuiteApp',
		});

		expect(result.status).toBe(CREATE_PROJECT_OPERATION_STATUS.ERROR);
		expect(result.errorMessages).toEqual(['publisherid is required to create a SuiteApp project.']);
	});

	it('should create the Node project wrapper from sdk-core templates', async () => {
		const projectAbsolutePath = join(temporaryFolder, 'wrapper');
		const installDependencies = jest.fn().mockResolvedValue(true);
		const result = await executeCreateProjectWorkflow(
			{
				createProjectParams: {
					parentdirectory: projectAbsolutePath,
					type: 'ACCOUNTCUSTOMIZATION',
					projectname: 'src',
				},
				displayProjectName: 'My ACP',
				includeUnitTesting: true,
			},
			{ installDependencies }
		);

		expect(result.status).toBe(CREATE_PROJECT_OPERATION_STATUS.SUCCESS);
		expect(result.npmInstallSuccess).toBe(true);
		expect(installDependencies).toHaveBeenCalledWith(projectAbsolutePath);
		expect(await readFile(join(projectAbsolutePath, '.gitignore'), 'utf8')).toBe(
			await readTemplate('project/default_gitignore.template')
		);
		expect(await readFile(join(projectAbsolutePath, 'suitecloud.config.js'), 'utf8')).toBe(
			await readTemplate('project/unittest/suitecloud.config.js.template')
		);
		expect(await readFile(join(projectAbsolutePath, 'package.json'), 'utf8')).toContain('"version": "1.0.0"');
		expect(await readFile(join(projectAbsolutePath, 'jest.config.js'), 'utf8')).toContain(
			'SuiteCloudJestConfiguration.ProjectType.ACP'
		);
		expect(await readFile(join(projectAbsolutePath, '__tests__', 'sample-test.js'), 'utf8')).toBe(
			await readTemplate('project/unittest/sample-test.js.template')
		);
		expect(await readFile(join(projectAbsolutePath, 'jsconfig.json'), 'utf8')).toBe(
			await readTemplate('project/unittest/jsconfig.json.template')
		);
	});

	it('should run npm install through the Windows command interpreter', async () => {
		const platformDescriptor = Object.getOwnPropertyDescriptor(process, 'platform');
		const originalComSpec = process.env.ComSpec;
		const commandInterpreter = 'C:\\Windows\\System32\\cmd.exe';
		const processResult = new EventEmitter();
		mockSpawn.mockImplementation(() => {
			setImmediate(() => processResult.emit('close', 0));
			return processResult;
		});
		Object.defineProperty(process, 'platform', { ...platformDescriptor, value: 'win32' });
		process.env.ComSpec = commandInterpreter;

		try {
			const projectAbsolutePath = join(temporaryFolder, 'windows-wrapper');
			const result = await executeCreateProjectWorkflow({
				createProjectParams: {
					parentdirectory: projectAbsolutePath,
					type: 'ACCOUNTCUSTOMIZATION',
					projectname: 'src',
				},
				displayProjectName: 'My ACP',
				includeUnitTesting: true,
			});

			expect(result.status).toBe(CREATE_PROJECT_OPERATION_STATUS.SUCCESS);
			expect(result.npmInstallSuccess).toBe(true);
			expect(mockSpawn).toHaveBeenCalledWith(
				commandInterpreter,
				['/d', '/s', '/c', 'npm.cmd install'],
				{
					cwd: projectAbsolutePath,
					stdio: 'inherit',
					windowsHide: true,
				}
			);
		} finally {
			Object.defineProperty(process, 'platform', platformDescriptor);
			if (originalComSpec === undefined) {
				delete process.env.ComSpec;
			} else {
				process.env.ComSpec = originalComSpec;
			}
		}
	});

	it('should preserve the created project when npm cannot be started', async () => {
		const projectAbsolutePath = join(temporaryFolder, 'npm-start-failure-wrapper');
		mockSpawn.mockImplementation(() => {
			throw new Error('spawn EINVAL');
		});

		const result = await executeCreateProjectWorkflow({
			createProjectParams: {
				parentdirectory: projectAbsolutePath,
				type: 'ACCOUNTCUSTOMIZATION',
				projectname: 'src',
			},
			displayProjectName: 'My ACP',
			includeUnitTesting: true,
		});

		expect(result.status).toBe(CREATE_PROJECT_OPERATION_STATUS.SUCCESS);
		expect(result.npmInstallSuccess).toBe(false);
		await expect(access(projectAbsolutePath)).resolves.toBeUndefined();
	});

	it('should create the default wrapper without unit testing', async () => {
		const projectAbsolutePath = join(temporaryFolder, 'default-wrapper');
		const result = await executeCreateProjectWorkflow({
			createProjectParams: {
				parentdirectory: projectAbsolutePath,
				type: 'ACCOUNTCUSTOMIZATION',
				projectname: 'src',
			},
			displayProjectName: 'My ACP',
			includeUnitTesting: false,
		});

		expect(result.status).toBe(CREATE_PROJECT_OPERATION_STATUS.SUCCESS);
		expect(await readFile(join(projectAbsolutePath, '.gitignore'), 'utf8')).toBe(
			await readTemplate('project/default_gitignore.template')
		);
		expect(await readFile(join(projectAbsolutePath, 'suitecloud.config.js'), 'utf8')).toBe(
			await readTemplate('project/suitecloud.config.js')
		);
	});

	it('should replace the complete Node project wrapper when overwrite is enabled', async () => {
		const projectAbsolutePath = join(temporaryFolder, 'overwrite-wrapper');
		const input = {
			createProjectParams: {
				parentdirectory: projectAbsolutePath,
				type: 'ACCOUNTCUSTOMIZATION',
				projectname: 'src',
			},
			displayProjectName: 'My ACP',
			includeUnitTesting: false,
		};
		expect((await executeCreateProjectWorkflow(input)).status).toBe(CREATE_PROJECT_OPERATION_STATUS.SUCCESS);
		await writeFile(join(projectAbsolutePath, 'stale-file.txt'), 'stale', 'utf8');

		const result = await executeCreateProjectWorkflow({
			...input,
			createProjectParams: { ...input.createProjectParams, overwrite: true },
		});

		expect(result.status).toBe(CREATE_PROJECT_OPERATION_STATUS.SUCCESS);
		await expect(access(join(projectAbsolutePath, 'stale-file.txt'))).rejects.toMatchObject({ code: 'ENOENT' });
		expect(await readFile(join(projectAbsolutePath, 'src', 'manifest.xml'), 'utf8')).toContain(
			'<projectname>My ACP</projectname>'
		);
	});

	it('should create a SuiteApp wrapper using the created project path', async () => {
		const projectAbsolutePath = join(temporaryFolder, 'suiteapp-wrapper');
		const result = await executeCreateProjectWorkflow({
			createProjectParams: {
				parentdirectory: projectAbsolutePath,
				type: 'SUITEAPP',
				projectname: 'src',
				publisherid: 'com.example',
				projectid: 'application',
				projectversion: '2.1.0',
			},
			displayProjectName: 'My SuiteApp',
			includeUnitTesting: false,
		});

		expect(result.status).toBe(CREATE_PROJECT_OPERATION_STATUS.SUCCESS);
		expect(result.projectDirectory).toBe(projectAbsolutePath);
		expect(result.data).toBe(join(projectAbsolutePath, 'src'));
		expect(await readFile(join(projectAbsolutePath, 'src', 'manifest.xml'), 'utf8')).toContain(
			'<projectname>My SuiteApp</projectname>'
		);
	});

	it('should remove a partially scaffolded project when finalization fails', async () => {
		const projectAbsolutePath = join(temporaryFolder, 'failed-wrapper');
		const result = await executeCreateProjectWorkflow(
			{
				createProjectParams: {
					parentdirectory: projectAbsolutePath,
					type: 'ACCOUNTCUSTOMIZATION',
					projectname: 'src',
				},
				displayProjectName: 'My ACP',
				includeUnitTesting: true,
			},
			{ installDependencies: jest.fn().mockRejectedValue(new Error('installation failed')) }
		);

		expect(result.status).toBe(CREATE_PROJECT_OPERATION_STATUS.ERROR);
		await expect(access(projectAbsolutePath)).rejects.toMatchObject({ code: 'ENOENT' });
	});
});

async function readTemplate(relativePath) {
	return readFile(join(TEMPLATE_ROOT, relativePath), 'utf8');
}

async function expectDirectories(projectFolder, relativePaths) {
	await Promise.all(relativePaths.map((relativePath) => expect(access(join(projectFolder, relativePath))).resolves.toBeUndefined()));
}
