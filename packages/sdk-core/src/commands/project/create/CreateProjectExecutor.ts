/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { access, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
	SDK_OPERATION_STATUS,
	type OperationResult,
} from '../../../api/OperationResult';
import { PROJECT_CREATE } from '../../../services/translation/TranslationKeys';
import { translationService } from '../../../services/translation/TranslationService';
import { loadTemplate, renderTemplate, setXmlElementValues } from '../../../templates/TemplateLoader';

/** Compatibility alias for existing command consumers. */
export const CREATE_PROJECT_OPERATION_STATUS = SDK_OPERATION_STATUS;

export type CreateProjectOperationResult = OperationResult<string>;

export type CreateProjectExecutionInput = {
	parentdirectory: string;
	type: string;
	projectname: string;
	publisherid?: string;
	projectid?: string;
	projectversion?: string;
	overwrite?: boolean | string;
};

const PROJECT_TYPE_SUITEAPP = 'SUITEAPP';
const PROJECT_TYPE_ACP = 'ACCOUNTCUSTOMIZATION';
const FRAMEWORK_VERSION = '1.0';
const PROJECT_TEMPLATE_FOLDER = 'project';

const MANIFEST_FILENAME = 'manifest.xml';
const DEPLOY_FILENAME = 'deploy.xml';
const INSTALLATION_PREFERENCES_FOLDER = 'InstallationPreferences';
const FILE_CABINET_FOLDER = 'FileCabinet';
const FILE_CABINET_SUITESCRIPTS_FOLDER = 'SuiteScripts';
const FILE_CABINET_WEB_SITE_HOSTING_FILES_FOLDER = 'Web Site Hosting Files';
const FILE_CABINET_LIVE_HOSTING_FILES_FOLDER = 'Live Hosting Files';
const FILE_CABINET_STAGING_HOSTING_FILES_FOLDER = 'Staging Hosting Files';
const FILE_CABINET_TEMPLATES_FOLDER = 'Templates';
const FILE_CABINET_TEMPLATES_EMAIL_TEMPLATES_FOLDER = 'E-mail Templates';
const FILE_CABINET_TEMPLATES_MARKETING_TEMPLATES_FOLDER = 'Marketing Templates';
const FILE_CABINET_SUITE_APPS_FOLDER = 'SuiteApps';
const ACCOUNT_CONFIGURATION_FOLDER = 'AccountConfiguration';
const OBJECTS_FOLDER = 'Objects';
const TRANSLATIONS_FOLDER = 'Translations';

const MANIFEST_ACP_TEMPLATE = 'project_manifest_acp.xml';
const MANIFEST_SUITEAPP_TEMPLATE = 'project_manifest_suiteapp.xml';
const DEPLOY_ACP_TEMPLATE = 'project_deploy_acp.xml';
const DEPLOY_SUITEAPP_TEMPLATE = 'project_deploy_suiteapp.xml';
const INSTALLATION_PREFERENCE_TEMPLATES = [
	['suiteapp_hiding.xml', 'hiding.xml'],
	['suiteapp_locking.xml', 'locking.xml'],
	['suiteapp_overwriting.xml', 'overwriting.xml'],
] as const;

export async function executeCreateProject(
	input: CreateProjectExecutionInput
): Promise<CreateProjectOperationResult> {
	let targetProjectFolder: string | undefined;
	try {
		const parentDirectory = unquote(input.parentdirectory);
		const projectType = String(input.type ?? '');
		const projectName = String(input.projectname ?? '');
		const overwrite = toBoolean(input.overwrite);

		if (!parentDirectory) {
			return errorResult(
				translationService.getMessage(PROJECT_CREATE.ERROR.PARENT_DIRECTORY_REQUIRED)
			);
		}
		if (!projectType) {
			return errorResult(translationService.getMessage(PROJECT_CREATE.ERROR.TYPE_REQUIRED));
		}
		if (!projectName) {
			return errorResult(translationService.getMessage(PROJECT_CREATE.ERROR.NAME_REQUIRED));
		}
		if (projectType !== PROJECT_TYPE_ACP && projectType !== PROJECT_TYPE_SUITEAPP) {
			return errorResult(
				translationService.getMessage(PROJECT_CREATE.ERROR.UNSUPPORTED_TYPE, projectType)
			);
		}
		if (projectType === PROJECT_TYPE_SUITEAPP) {
			const missingField = [
				['publisherid', input.publisherid],
				['projectid', input.projectid],
				['projectversion', input.projectversion],
			].find(([, value]) => !String(value ?? '').trim());
			if (missingField) {
				return errorResult(
					translationService.getMessage(
						PROJECT_CREATE.ERROR.SUITEAPP_FIELD_REQUIRED,
						String(missingField[0])
					)
				);
			}
		}

		const targetProjectFolderName =
			projectType === PROJECT_TYPE_SUITEAPP ? `${input.publisherid}.${input.projectid}` : projectName;
		targetProjectFolder = join(parentDirectory, targetProjectFolderName);

		if (await pathExists(targetProjectFolder)) {
			const contents = await readdir(targetProjectFolder);
			if (contents.length > 0) {
				if (!overwrite) {
					return errorResult(
						translationService.getMessage(PROJECT_CREATE.ERROR.FOLDER_NOT_EMPTY)
					);
				}
				await rm(targetProjectFolder, { recursive: true, force: true });
			}
		}

		if (projectType === PROJECT_TYPE_SUITEAPP) {
			await createSuiteAppProject(targetProjectFolder, input, projectName);
		} else {
			await createAcpProject(targetProjectFolder, projectName);
		}

		return {
			status: CREATE_PROJECT_OPERATION_STATUS.SUCCESS,
			data: targetProjectFolder,
		};
	} catch (error: unknown) {
		if (targetProjectFolder) {
			await rm(targetProjectFolder, { recursive: true, force: true }).catch(() => undefined);
		}
		return errorResult(toErrorMessage(error));
	}
}

async function createSuiteAppProject(
	projectFolder: string,
	input: CreateProjectExecutionInput,
	projectName: string
): Promise<void> {
	const publisherId = String(input.publisherid ?? '');
	const projectId = String(input.projectid ?? '');
	const projectVersion = String(input.projectversion ?? '');
	const applicationId = `${publisherId}.${projectId}`;

	const [manifestTemplate, deployTemplate, ...installationPreferenceTemplates] = await Promise.all([
		loadProjectTemplate(MANIFEST_SUITEAPP_TEMPLATE),
		loadProjectTemplate(DEPLOY_SUITEAPP_TEMPLATE),
		...INSTALLATION_PREFERENCE_TEMPLATES.map(([template]) => loadProjectTemplate(template)),
	]);

	await mkdir(projectFolder, { recursive: true });
	await writeFile(
		join(projectFolder, MANIFEST_FILENAME),
		setXmlElementValues(manifestTemplate, {
			publisherid: publisherId,
			projectid: projectId,
			projectname: projectName,
			projectversion: projectVersion,
			frameworkversion: FRAMEWORK_VERSION,
		}),
		'utf8'
	);
	await writeFile(
		join(projectFolder, DEPLOY_FILENAME),
		renderTemplate(deployTemplate, { applicationId }),
		'utf8'
	);

	const installationPreferencesFolder = join(projectFolder, INSTALLATION_PREFERENCES_FOLDER);
	await mkdir(installationPreferencesFolder, { recursive: true });
	await Promise.all(
		INSTALLATION_PREFERENCE_TEMPLATES.map(([, filename], index) =>
			writeFile(join(installationPreferencesFolder, filename), installationPreferenceTemplates[index], 'utf8')
		)
	);

	await Promise.all([
		mkdir(join(projectFolder, FILE_CABINET_FOLDER, FILE_CABINET_WEB_SITE_HOSTING_FILES_FOLDER), {
			recursive: true,
		}),
		mkdir(join(projectFolder, FILE_CABINET_FOLDER, FILE_CABINET_SUITE_APPS_FOLDER, applicationId), {
			recursive: true,
		}),
		mkdir(join(projectFolder, OBJECTS_FOLDER), { recursive: true }),
		mkdir(join(projectFolder, TRANSLATIONS_FOLDER), { recursive: true }),
	]);
}

async function createAcpProject(projectFolder: string, projectName: string): Promise<void> {
	const [manifestTemplate, deployTemplate] = await Promise.all([
		loadProjectTemplate(MANIFEST_ACP_TEMPLATE),
		loadProjectTemplate(DEPLOY_ACP_TEMPLATE),
	]);

	await mkdir(projectFolder, { recursive: true });
	await writeFile(
		join(projectFolder, MANIFEST_FILENAME),
		setXmlElementValues(manifestTemplate, {
			projectname: projectName,
			frameworkversion: FRAMEWORK_VERSION,
		}),
		'utf8'
	);
	await writeFile(join(projectFolder, DEPLOY_FILENAME), deployTemplate, 'utf8');

	await Promise.all([
		mkdir(join(projectFolder, ACCOUNT_CONFIGURATION_FOLDER), { recursive: true }),
		mkdir(join(projectFolder, FILE_CABINET_FOLDER, FILE_CABINET_SUITESCRIPTS_FOLDER), { recursive: true }),
		mkdir(
			join(
				projectFolder,
				FILE_CABINET_FOLDER,
				FILE_CABINET_WEB_SITE_HOSTING_FILES_FOLDER,
				FILE_CABINET_LIVE_HOSTING_FILES_FOLDER
			),
			{ recursive: true }
		),
		mkdir(
			join(
				projectFolder,
				FILE_CABINET_FOLDER,
				FILE_CABINET_WEB_SITE_HOSTING_FILES_FOLDER,
				FILE_CABINET_STAGING_HOSTING_FILES_FOLDER
			),
			{ recursive: true }
		),
		mkdir(
			join(
				projectFolder,
				FILE_CABINET_FOLDER,
				FILE_CABINET_TEMPLATES_FOLDER,
				FILE_CABINET_TEMPLATES_EMAIL_TEMPLATES_FOLDER
			),
			{ recursive: true }
		),
		mkdir(
			join(
				projectFolder,
				FILE_CABINET_FOLDER,
				FILE_CABINET_TEMPLATES_FOLDER,
				FILE_CABINET_TEMPLATES_MARKETING_TEMPLATES_FOLDER
			),
			{ recursive: true }
		),
		mkdir(join(projectFolder, OBJECTS_FOLDER), { recursive: true }),
		mkdir(join(projectFolder, TRANSLATIONS_FOLDER), { recursive: true }),
	]);
}

function loadProjectTemplate(filename: string): Promise<string> {
	return loadTemplate(`${PROJECT_TEMPLATE_FOLDER}/${filename}`);
}

function toBoolean(value: unknown): boolean {
	if (typeof value === 'boolean') {
		return value;
	}
	return typeof value === 'string' && value.trim().toLowerCase() === 'true';
}

function unquote(value: string): string {
	return value.length > 1 && value.startsWith('"') && value.endsWith('"') ? value.slice(1, -1) : value;
}

async function pathExists(path: string): Promise<boolean> {
	try {
		await access(path);
		return true;
	} catch {
		return false;
	}
}

function errorResult(errorMessage: string): CreateProjectOperationResult {
	return {
		status: CREATE_PROJECT_OPERATION_STATUS.ERROR,
		errorMessages: [errorMessage],
	};
}

function toErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
