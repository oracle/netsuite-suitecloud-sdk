/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';

import {
	CREATE_PROJECT_OPERATION_STATUS,
	executeCreateProject,
	type CreateProjectExecutionInput,
	type CreateProjectOperationResult,
} from './CreateProjectExecutor';

const PLATFORM_WIN = 'win32';
const COMMAND_NPM_WIN = 'npm.cmd';
const COMMAND_NPM_UNIX = 'npm';
const NPM_ARG_INSTALL = 'install';
const SOURCE_FOLDER = 'src';
const JEST_CONFIG_FILENAME = 'jest.config.js';
const JEST_CONFIG_PROJECT_TYPE_ACP = 'SuiteCloudJestConfiguration.ProjectType.ACP';
const JEST_CONFIG_PROJECT_TYPE_SUITEAPP = 'SuiteCloudJestConfiguration.ProjectType.SUITEAPP';
const JEST_CONFIG_REPLACE_STRING_PROJECT_TYPE = '{{projectType}}';
const PACKAGE_JSON_FILENAME = 'package.json';
const PACKAGE_JSON_DEFAULT_VERSION = '1.0.0';
const PACKAGE_JSON_REPLACE_STRING_VERSION = '{{version}}';
const UNIT_TEST_TEST_FOLDER = '__tests__';
const UNIT_TEST_SAMPLE_TEST_FILENAME = 'sample-test.js';
const GITIGNORE_FILENAME = '.gitignore';
const SUITECLOUD_CONFIG_FILENAME = 'suitecloud.config.js';
const MANIFEST_FILENAME = 'manifest.xml';

const DEFAULT_SUITECLOUD_CONFIG_FILE = `module.exports = {
	defaultProjectFolder: "src",
	commands: {}
};
`;

const DEFAULT_GITIGNORE_FILE = `# IDEs and editors
.idea
*.iml
*.iws
.project
.classpath
*.launch
.settings
*.sublime-workspace
.vscode

# Dependency directories
node_modules

# TypeScript cache
*.tsbuildinfo

# Logs
logs
*.log
npm-debug.log*

# Packaged SuiteCloud projects
build

# misc
.sass-cache

# Optional npm cache directory
.npm

# System Files
.DS_Store
Thumbs.db

# Output of 'npm pack'
*.tgz

# Project config
project.json
`;

const UNIT_TEST_SUITECLOUD_CONFIG_FILE = `const SuiteCloudJestUnitTestRunner = require('@oracle/suitecloud-unit-testing/services/SuiteCloudJestUnitTestRunner');

module.exports = {
	defaultProjectFolder: 'src',
	commands: {
		"project:deploy": {
			beforeExecuting: async args => {
				await SuiteCloudJestUnitTestRunner.run({
				    // Jest configuration options.
				});
				return args;
			},
		},
	},
};
`;

const UNIT_TEST_JEST_CONFIG_FILE = `const SuiteCloudJestConfiguration = require("@oracle/suitecloud-unit-testing/jest-configuration/SuiteCloudJestConfiguration");
const cliConfig = require("./suitecloud.config");

module.exports = SuiteCloudJestConfiguration.build({
	projectFolder: cliConfig.defaultProjectFolder,
	projectType: {{projectType}},
});
`;

const UNIT_TEST_PACKAGE_JSON_FILE = `{
  "name": "suitecloud-project",
  "version": "{{version}}",
  "scripts": {
    "test": "jest"
  },
  "devDependencies": {
    "jest": "29.7.0",
    "@types/jest": "29.5.14",
    "@oracle/suitecloud-unit-testing": "^1.7.0"
  }
}
`;

const UNIT_TEST_SAMPLE_TEST_FILE = `import record from 'N/record';
import Record from 'N/record/instance';

jest.mock('N/record');
jest.mock('N/record/instance');

beforeEach(() => {
	jest.clearAllMocks();
});

describe('Basic jest test with simple assert', () => {
	it('should assert strings are equal', () => {
		const a = 'foobar';
		const b = 'foobar';
		expect(a).toMatch(b);
	});
});

describe('Sample test with provided record module stubs', () => {
	it('should update Sales Order memo field', () => {
		// given
		const salesOrderId = 1352;
		record.load.mockReturnValue(Record);
		Record.save.mockReturnValue(salesOrderId);

		// when
		let salesOrderRecord = record.load({id: salesOrderId});
		salesOrderRecord.setValue({fieldId: 'memo', value: 'foobar'});
		const updatedSalesOrderId = salesOrderRecord.save({enableSourcing: false});

		// then
		expect(record.load).toHaveBeenCalledWith({id: salesOrderId});
		expect(Record.setValue).toHaveBeenCalledWith({fieldId: 'memo', value: 'foobar'});
		expect(Record.save).toHaveBeenCalledWith({enableSourcing: false});
		expect(salesOrderId).toBe(updatedSalesOrderId);
	});
});
`;

const UNIT_TEST_JSCONFIG_FILE = `{
    "typeAcquisition": {
        "include": ["jest"]
    }
}
`;

export type CreateProjectWorkflowInput = {
	createProjectParams: CreateProjectExecutionInput;
	projectAbsolutePath: string;
	projectFolderName: string;
	projectType: string;
	projectName: string;
	projectVersion?: string;
	includeUnitTesting: boolean;
	projectTypeSuiteApp: string;
};

export type CreateProjectWorkflowOperationResult = CreateProjectOperationResult & {
	projectDirectory?: string;
	npmInstallSuccess?: boolean;
};

export async function executeCreateProjectWorkflow(
	input: CreateProjectWorkflowInput
): Promise<CreateProjectWorkflowOperationResult> {
	try {
		const createProjectResult = await executeCreateProject(input.createProjectParams);
		if (createProjectResult.status === CREATE_PROJECT_OPERATION_STATUS.ERROR) {
			return createProjectResult;
		}

		await finalizeCreatedProject(input);
		const npmInstallSuccess = input.includeUnitTesting ? await runNpmInstall(input.projectAbsolutePath) : undefined;

		return {
			...createProjectResult,
			projectDirectory: input.projectAbsolutePath,
			npmInstallSuccess,
		};
	} catch (error: unknown) {
		await rm(join(input.projectAbsolutePath, input.projectFolderName), { recursive: true, force: true });
		return {
			status: CREATE_PROJECT_OPERATION_STATUS.ERROR,
			errorMessages: [toErrorMessage(error)],
		};
	}
}

async function finalizeCreatedProject(input: CreateProjectWorkflowInput): Promise<void> {
	if (input.projectType === input.projectTypeSuiteApp) {
		const oldPath = join(input.projectAbsolutePath, input.projectFolderName);
		const newPath = join(input.projectAbsolutePath, SOURCE_FOLDER);
		await rm(newPath, { recursive: true, force: true });
		await rename(oldPath, newPath);
	}

	const manifestPath = join(input.projectAbsolutePath, SOURCE_FOLDER, MANIFEST_FILENAME);
	await replaceStringInFile(manifestPath, SOURCE_FOLDER, input.projectName);

	if (input.includeUnitTesting) {
		await createUnitTestFiles(input.projectType, input.projectVersion, input.projectAbsolutePath, input.projectTypeSuiteApp);
	} else {
		await writeFile(join(input.projectAbsolutePath, SUITECLOUD_CONFIG_FILENAME), DEFAULT_SUITECLOUD_CONFIG_FILE, 'utf8');
	}

	await writeFile(join(input.projectAbsolutePath, GITIGNORE_FILENAME), DEFAULT_GITIGNORE_FILE, 'utf8');
}

async function createUnitTestFiles(
	projectType: string,
	projectVersion: string | undefined,
	projectAbsolutePath: string,
	projectTypeSuiteApp: string
): Promise<void> {
	await writeFile(join(projectAbsolutePath, SUITECLOUD_CONFIG_FILENAME), UNIT_TEST_SUITECLOUD_CONFIG_FILE, 'utf8');

	let packageJsonTemplate = UNIT_TEST_PACKAGE_JSON_FILE;
	const version = projectType === projectTypeSuiteApp ? (projectVersion ?? PACKAGE_JSON_DEFAULT_VERSION) : PACKAGE_JSON_DEFAULT_VERSION;
	packageJsonTemplate = packageJsonTemplate.replace(PACKAGE_JSON_REPLACE_STRING_VERSION, version);
	await writeFile(join(projectAbsolutePath, PACKAGE_JSON_FILENAME), packageJsonTemplate, 'utf8');

	let jestConfigTemplate = UNIT_TEST_JEST_CONFIG_FILE;
	const jestConfigProjectType =
		projectType === projectTypeSuiteApp ? JEST_CONFIG_PROJECT_TYPE_SUITEAPP : JEST_CONFIG_PROJECT_TYPE_ACP;
	jestConfigTemplate = jestConfigTemplate.replace(JEST_CONFIG_REPLACE_STRING_PROJECT_TYPE, jestConfigProjectType);
	await writeFile(join(projectAbsolutePath, JEST_CONFIG_FILENAME), jestConfigTemplate, 'utf8');

	const testsFolder = join(projectAbsolutePath, UNIT_TEST_TEST_FOLDER);
	await mkdir(testsFolder, { recursive: true });
	await writeFile(join(testsFolder, UNIT_TEST_SAMPLE_TEST_FILENAME), UNIT_TEST_SAMPLE_TEST_FILE, 'utf8');
	await writeFile(join(projectAbsolutePath, 'jsconfig.json'), UNIT_TEST_JSCONFIG_FILE, 'utf8');
}

async function replaceStringInFile(filePath: string, searchValue: string, replaceValue: string): Promise<void> {
	const fileContent = await readFile(filePath, 'utf8');
	await writeFile(filePath, fileContent.replace(new RegExp(escapeRegExp(searchValue), 'g'), replaceValue), 'utf8');
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function runNpmInstall(projectAbsolutePath: string): Promise<boolean> {
	return new Promise((resolve) => {
		const npmBinary = process.platform === PLATFORM_WIN ? COMMAND_NPM_WIN : COMMAND_NPM_UNIX;
		const processResult = spawn(npmBinary, [NPM_ARG_INSTALL], {
			cwd: projectAbsolutePath,
			stdio: 'inherit',
			windowsHide: true,
		});
		processResult.on('close', (code) => resolve(code === 0));
		processResult.on('error', () => resolve(false));
	});
}

function toErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	return String(error);
}
