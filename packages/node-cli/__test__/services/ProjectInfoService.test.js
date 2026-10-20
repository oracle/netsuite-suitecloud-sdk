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
const { lineBreak } = require('../../src/loggers/LoggerOsConstants');
const { LINKS: { INFO } } = require('../../src/ApplicationConstants');

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
		expect(error.getErrorMessage()).toBe([
			'Invalid SuiteCloud project context for command "object:import".',
			` - Missing manifest control file in "${projectFolder}". Expected one of: manifest.xml, manifest.json, manifest.yaml, manifest.yml.`,
			` - Missing deploy control file in "${projectFolder}". Expected one of: deploy.xml, deploy.json, deploy.yaml, deploy.yml.`,
			`For more information about the project structure, see ${INFO.PROJECT_STRUCTURE}`,
		].join(lineBreak));
		await writeFile(join(projectFolder, 'manifest.yaml'), '{');
		await writeFile(join(projectFolder, 'deploy.json'), '{');
		expect(() => service.checkWorkingDirectoryContainsValidProject('object:import')).not.toThrow();
	});

	it('renders manifest validation errors with a header, one bullet per error, and project guidance', async () => {
		await writeFile(join(projectFolder, 'manifest.yaml'),
			'manifest:\n  projecttype: INVALID\n  frameworkversion: "3.0"');
		await writeFile(join(projectFolder, 'deploy.yaml'), 'deploy: []');

		let error;
		try {
			service.getProjectType();
		} catch (caught) {
			error = caught;
		}

		expect(error).toBeInstanceOf(CLIException);
		expect(error.getErrorMessage()).toBe([
			'Unable to read the SuiteCloud project manifest.',
			' - The projecttype attribute in manifest.yaml must be either SUITEAPP or ACCOUNTCUSTOMIZATION.',
			' - The SDF "frameworkversion" value "3.0" in manifest.yaml does not match the control-file generation. XML control files must use version "1.0"; JSON and YAML control files must use version "2.0".',
			`For more information about the project structure, see ${INFO.PROJECT_STRUCTURE}`,
		].join(lineBreak));
	});

	it('renders a single manifest error with the same header, bullet, and guidance', async () => {
		await writeFile(join(projectFolder, 'manifest.json'),
			'{"manifest":{"projecttype":"INVALID","frameworkversion":"2.0"}}');
		await writeFile(join(projectFolder, 'deploy.json'), '{"deploy":[]}');

		let error;
		try {
			service.getProjectName();
		} catch (caught) {
			error = caught;
		}

		expect(error).toBeInstanceOf(CLIException);
		expect(error.getErrorMessage()).toBe([
			'Unable to read the SuiteCloud project manifest.',
			' - The projecttype attribute in manifest.json must be either SUITEAPP or ACCOUNTCUSTOMIZATION.',
			`For more information about the project structure, see ${INFO.PROJECT_STRUCTURE}`,
		].join(lineBreak));
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
