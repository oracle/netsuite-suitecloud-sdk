/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const { mkdir, mkdtemp, rm, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const ProjectInfoService = require('../../src/services/ProjectInfoService');
const CLIException = require('../../src/CLIException');

describe('ProjectInfoService compatibility facade', () => {
	let projectFolder;
	let service;

	beforeEach(async () => {
		projectFolder = await mkdtemp(join(tmpdir(), 'suitecloud-project-info-'));
		service = new ProjectInfoService(projectFolder);
	});

	afterEach(async () => {
		await rm(projectFolder, { recursive: true, force: true });
	});

	it('returns scalar V2 metadata and an empty ACP application ID', async () => {
		await writeFile(join(projectFolder, 'manifest.yml'),
			'manifest:\n  projecttype: ACCOUNTCUSTOMIZATION\n  frameworkversion: "2.0"\n  projectname: Account Project');
		await writeFile(join(projectFolder, 'deploy.json'), '{"deploy":[]}');
		expect(service.getProjectName()).toBe('Account Project');
		expect(service.getPublisherId()).toBe('');
		expect(service.getProjectId()).toBe('');
		expect(service.getApplicationId()).toBe('');
		expect(service.isAccountCustomizationProject()).toBe(true);
		expect(service.isSuiteAppProject()).toBe(false);
		expect(service.isSuiteCloudProject()).toBe(true);
	});

	it('returns false from project predicates and retries metadata after an invalid setup is repaired', async () => {
		expect(service.isAccountCustomizationProject()).toBe(false);
		expect(service.isSuiteAppProject()).toBe(false);
		expect(service.isSuiteCloudProject()).toBe(false);
		expect(() => service.getProjectType()).toThrow(CLIException);
		await writeFile(join(projectFolder, 'manifest.json'), '{"manifest":{"projecttype":"SUITEAPP","frameworkversion":"2.0"}}');
		await writeFile(join(projectFolder, 'deploy.yaml'), 'deploy: []');
		expect(service.isSuiteAppProject()).toBe(true);
		expect(service.isAccountCustomizationProject()).toBe(false);
	});

	it('checks control-file setup without parsing contents and wraps all setup errors with command guidance', async () => {
		let error;
		try {
			service.checkWorkingDirectoryContainsValidProject('object:import');
		} catch (caught) {
			error = caught;
		}
		expect(error).toBeInstanceOf(CLIException);
		expect(error.getErrorMessage()).toContain('object:import');
		expect(error.getErrorMessage()).toContain('Missing manifest control file');
		expect(error.getErrorMessage()).toContain('Missing deploy control file');
		await writeFile(join(projectFolder, 'manifest.yaml'), '{');
		await writeFile(join(projectFolder, 'deploy.json'), '{');
		expect(() => service.checkWorkingDirectoryContainsValidProject('object:import')).not.toThrow();
	});

	it('requires both XML installation preference files', async () => {
		await mkdir(join(projectFolder, 'InstallationPreferences'));
		expect(service.hasLockAndHideFiles()).toBe(false);
		await writeFile(join(projectFolder, 'InstallationPreferences', 'hiding.xml'), '<hiding/>');
		expect(service.hasLockAndHideFiles()).toBe(false);
		await writeFile(join(projectFolder, 'InstallationPreferences', 'locking.xml'), '<locking/>');
		expect(service.hasLockAndHideFiles()).toBe(true);
	});
});
