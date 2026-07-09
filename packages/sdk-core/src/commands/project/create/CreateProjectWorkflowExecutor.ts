/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { spawn } from 'node:child_process';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { TranslationKeys } from '../../../services/translation/TranslationKeys';
import { translationService } from '../../../services/translation/TranslationService';
import { loadTemplate, renderTemplate } from '../../../templates/TemplateLoader';
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
const PROJECT_TYPE_SUITEAPP = 'SUITEAPP';
const JEST_CONFIG_FILENAME = 'jest.config.js';
const JEST_CONFIG_PROJECT_TYPE_ACP = 'SuiteCloudJestConfiguration.ProjectType.ACP';
const JEST_CONFIG_PROJECT_TYPE_SUITEAPP = 'SuiteCloudJestConfiguration.ProjectType.SUITEAPP';
const PACKAGE_JSON_FILENAME = 'package.json';
const PACKAGE_JSON_DEFAULT_VERSION = '1.0.0';
const UNIT_TEST_TEST_FOLDER = '__tests__';
const UNIT_TEST_SAMPLE_TEST_FILENAME = 'sample-test.js';
const GITIGNORE_FILENAME = '.gitignore';
const SUITECLOUD_CONFIG_FILENAME = 'suitecloud.config.js';
const MANIFEST_FILENAME = 'manifest.xml';
const PROJECT_TEMPLATE_FOLDER = 'project';
const UNIT_TEST_TEMPLATE_FOLDER = `${PROJECT_TEMPLATE_FOLDER}/unittest`;

export type CreateProjectWorkflowInput = {
	createProjectParams: CreateProjectExecutionInput;
	displayProjectName: string;
	includeUnitTesting: boolean;
};

export type CreateProjectWorkflowOperationResult = CreateProjectOperationResult & {
	projectDirectory?: string;
	npmInstallSuccess?: boolean;
};

export type CreateProjectWorkflowDependencies = {
	installDependencies?: (projectAbsolutePath: string) => Promise<boolean>;
};

export async function executeCreateProjectWorkflow(
	input: CreateProjectWorkflowInput,
	dependencies: CreateProjectWorkflowDependencies = {}
): Promise<CreateProjectWorkflowOperationResult> {
	let projectDirectory: string | undefined;
	try {
		if (isOverwriteEnabled(input.createProjectParams.overwrite)) {
			await rm(unquote(input.createProjectParams.parentdirectory), { recursive: true, force: true });
		}
		const createProjectResult = await executeCreateProject(input.createProjectParams);
		if (createProjectResult.status === CREATE_PROJECT_OPERATION_STATUS.ERROR) {
			return createProjectResult;
		}

		if (!createProjectResult.data) {
			throw new Error(
				translationService.getMessage(TranslationKeys.PROJECT_CREATE.ERROR.PATH_NOT_RETURNED)
			);
		}
		projectDirectory = dirname(createProjectResult.data);
		await finalizeCreatedProject(input, createProjectResult.data, projectDirectory);
		const installDependencies = dependencies.installDependencies || runNpmInstall;
		const npmInstallSuccess = input.includeUnitTesting
			? await installDependencies(projectDirectory)
			: undefined;

		return {
			...createProjectResult,
			data: join(projectDirectory, SOURCE_FOLDER),
			projectDirectory,
			npmInstallSuccess,
		};
	} catch (error: unknown) {
		if (projectDirectory) {
			await rm(projectDirectory, { recursive: true, force: true }).catch(() => undefined);
		}
		return {
			status: CREATE_PROJECT_OPERATION_STATUS.ERROR,
			errorMessages: [toErrorMessage(error)],
		};
	}
}

async function finalizeCreatedProject(
	input: CreateProjectWorkflowInput,
	createdProjectPath: string,
	projectDirectory: string
): Promise<void> {
	const projectType = input.createProjectParams.type;
	if (projectType === PROJECT_TYPE_SUITEAPP) {
		const newPath = join(projectDirectory, SOURCE_FOLDER);
		await rm(newPath, { recursive: true, force: true });
		await rename(createdProjectPath, newPath);
	}

	const manifestPath = join(projectDirectory, SOURCE_FOLDER, MANIFEST_FILENAME);
	await replaceStringInFile(manifestPath, SOURCE_FOLDER, input.displayProjectName);

	if (input.includeUnitTesting) {
		await createUnitTestFiles(
			projectType,
			input.createProjectParams.projectversion,
			projectDirectory
		);
	} else {
		const suiteCloudConfig = await loadTemplate(`${PROJECT_TEMPLATE_FOLDER}/suitecloud.config.js`);
		await writeFile(join(projectDirectory, SUITECLOUD_CONFIG_FILENAME), suiteCloudConfig, 'utf8');
	}

	const gitignore = await loadTemplate(`${PROJECT_TEMPLATE_FOLDER}/default_gitignore.template`);
	await writeFile(join(projectDirectory, GITIGNORE_FILENAME), gitignore, 'utf8');
}

async function createUnitTestFiles(
	projectType: string,
	projectVersion: string | undefined,
	projectAbsolutePath: string
): Promise<void> {
	const [suiteCloudConfig, packageJson, jestConfig, sampleTest, jsConfig] = await Promise.all([
		loadUnitTestTemplate('suitecloud.config.js.template'),
		loadUnitTestTemplate('package.json.template'),
		loadUnitTestTemplate('jest.config.js.template'),
		loadUnitTestTemplate('sample-test.js.template'),
		loadUnitTestTemplate('jsconfig.json.template'),
	]);

	const version =
		projectType === PROJECT_TYPE_SUITEAPP
			? (projectVersion ?? PACKAGE_JSON_DEFAULT_VERSION)
			: PACKAGE_JSON_DEFAULT_VERSION;
	const jestConfigProjectType =
		projectType === PROJECT_TYPE_SUITEAPP ? JEST_CONFIG_PROJECT_TYPE_SUITEAPP : JEST_CONFIG_PROJECT_TYPE_ACP;

	await writeFile(join(projectAbsolutePath, SUITECLOUD_CONFIG_FILENAME), suiteCloudConfig, 'utf8');
	await writeFile(join(projectAbsolutePath, PACKAGE_JSON_FILENAME), renderTemplate(packageJson, { version }), 'utf8');
	await writeFile(
		join(projectAbsolutePath, JEST_CONFIG_FILENAME),
		renderTemplate(jestConfig, { projectType: jestConfigProjectType }),
		'utf8'
	);

	const testsFolder = join(projectAbsolutePath, UNIT_TEST_TEST_FOLDER);
	await mkdir(testsFolder, { recursive: true });
	await writeFile(join(testsFolder, UNIT_TEST_SAMPLE_TEST_FILENAME), sampleTest, 'utf8');
	await writeFile(join(projectAbsolutePath, 'jsconfig.json'), jsConfig, 'utf8');
}

function loadUnitTestTemplate(filename: string): Promise<string> {
	return loadTemplate(`${UNIT_TEST_TEMPLATE_FOLDER}/${filename}`);
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
	return error instanceof Error ? error.message : String(error);
}

function isOverwriteEnabled(value: boolean | string | undefined): boolean {
	return value === true || (typeof value === 'string' && value.trim().toLowerCase() === 'true');
}

function unquote(value: string): string {
	return value.length > 1 && value.startsWith('"') && value.endsWith('"') ? value.slice(1, -1) : value;
}
