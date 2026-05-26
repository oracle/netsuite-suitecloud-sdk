/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { join } from 'node:path';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';

export const CREATE_PROJECT_OPERATION_STATUS = {
	SUCCESS: 'SUCCESS',
	ERROR: 'ERROR',
} as const;

type CreateProjectOperationStatus = (typeof CREATE_PROJECT_OPERATION_STATUS)[keyof typeof CREATE_PROJECT_OPERATION_STATUS];

export type CreateProjectOperationResult = {
	status: CreateProjectOperationStatus;
	data?: string;
	errorMessages?: string[];
};

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
const MANIFEST_FILENAME = 'manifest.xml';
const DEPLOY_FILENAME = 'deploy.xml';
const FRAMEWORK_VERSION = '1.0';
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
const HIDING_XML_FILENAME = 'hiding.xml';
const LOCKING_XML_FILENAME = 'locking.xml';
const OVERWRITING_XML_FILENAME = 'overwriting.xml';
const ERROR_FOLDER_EXISTS_AND_NOT_EMPTY = 'Folder exists and is not empty.';

const MANIFEST_ACP_TEMPLATE = `<manifest projecttype="ACCOUNTCUSTOMIZATION">
    <projectname>{{projectName}}</projectname>
    <frameworkversion>{{frameworkVersion}}</frameworkversion>
</manifest>`;

const MANIFEST_SUITEAPP_TEMPLATE = `<manifest projecttype="SUITEAPP">
    <publisherid>{{publisherId}}</publisherid>
    <projectid>{{projectId}}</projectid>
    <projectname>{{projectName}}</projectname>
    <projectversion>{{projectVersion}}</projectversion>
    <frameworkversion>{{frameworkVersion}}</frameworkversion>
</manifest>`;

const DEPLOY_ACP_TEMPLATE = `<deploy>
    <configuration>
        <path>~/AccountConfiguration/*</path>
    </configuration>
    <files>
        <path>~/FileCabinet/*</path>
    </files>
    <objects>
        <path>~/Objects/*</path>
    </objects>
    <translationimports>
        <path>~/Translations/*</path>
    </translationimports>
</deploy>`;

const DEPLOY_SUITEAPP_TEMPLATE = `<deploy>
    <files>
        <path>~/FileCabinet/SuiteApps/{{applicationId}}/*</path>
    </files>
    <objects>
        <path>~/Objects/*</path>
    </objects>
    <translationimports>
        <path>~/Translations/*</path>
    </translationimports>
</deploy>`;

const HIDING_XML_TEMPLATE = `<!-- This file is used for hiding the content of your SuiteApp when deploying to a NetSuite account. -->
<!-- The configuration below hides all content except for the files and objects specified under the apply tag. Use the commented lines as examples. -->
<!-- This configuration is only applied when the "Apply Installation Preferences" option is provided through SuiteCloud SDK. Otherwise this file is ignored. -->
<!-- For more information, see https://system.netsuite.com/app/help/helpcenter.nl?fid=section_1515950176.html -->

<preference type="HIDING" defaultAction="HIDE">
    <apply action="UNHIDE">
        <!-- <path>~/FileCabinet/SuiteApps/xxx.xxx.xxx/MyScript.js</path> -->
    </apply>
</preference>`;

const LOCKING_XML_TEMPLATE = `<!-- This file is used for locking the content of your SuiteApp when deploying to a NetSuite account. -->
<!-- The configuration below locks all content except for the files and objects specified under the apply tag. Use the commented lines as examples. -->
<!-- This configuration is only applied when the "Apply Installation Preferences" option is provided through SuiteCloud SDK. Otherwise this file is ignored. -->
<!-- For more information, see https://system.netsuite.com/app/help/helpcenter.nl?fid=section_1543865613.html -->

<preference type="LOCKING" defaultAction="LOCK">
    <apply action="UNLOCK">
        <!-- <object>custcontenttype_myobject</object> -->
        <!-- <path>~/FileCabinet/SuiteApps/xxx.xxx.xxx/MyScript.js</path> -->
    </apply>
</preference>
`;

const OVERWRITING_XML_TEMPLATE = `<!-- This file is used for overwriting or preserving the objects in your SuiteApp when deploying to a NetSuite account. -->
<!-- This configuration is only applied when the "Apply Installation Preferences" option is provided through SuiteCloud SDK. Otherwise this file is ignored. -->
<!-- For more information, see https://system.netsuite.com/app/help/helpcenter.nl?fid=section_160751417871.html -->

<preference type="OVERWRITING">
    <!-- SCRIPT DEPLOYMENTS -->
    <!-- The configuration below overwrites all scriptdeployments except for the ones specified with the action tag PRESERVE. -->
    <!-- <scriptdeployments defaultAction="OVERWRITE">
            <scriptdeployment scriptid="customscript_user_event_example.customdeploy_ue_example" action="PRESERVE" />
    </scriptdeployments> -->

    <!-- CUSTOM RECORD TYPES -->
    <!-- The configuration below preserves all instances of customrecord_type_example except for the ones with the action tag OVERWRITE. -->
    <!-- <customrecordtypes>
        <customrecordtype scriptid="customrecord_type_example">
            <instances defaultAction="PRESERVE">
                <instance scriptid="customrecord_instance_example" action="OVERWRITE" />
            </instances>
        </customrecordtype>
    </customrecordtypes> -->

    <!-- CUSTOM LISTS -->
    <!-- The configuration below overwrites all customvalues of customlist_example except for the ones with the action tag PRESERVE. -->
    <!-- <customlists>
        <customlist scriptid="customlist_example">
            <customvalues defaultAction="OVERWRITE">
                <customvalue scriptid="customlist_value_example" action="PRESERVE" />
            </customvalues>
        </customlist>
    </customlists> -->
</preference>`;

export async function executeCreateProject(
	input: CreateProjectExecutionInput
): Promise<CreateProjectOperationResult> {
	try {
		const parentDirectory = unquote(input.parentdirectory);
		const projectType = String(input.type ?? '');
		const projectName = String(input.projectname ?? '');
		const overwrite = toBoolean(input.overwrite);

		if (!parentDirectory) {
			return errorResult('A parent directory is required to create a project.');
		}
		if (!projectType) {
			return errorResult('A project type is required to create a project.');
		}
		if (!projectName) {
			return errorResult('A project name is required to create a project.');
		}

		const targetProjectFolderName =
			projectType === PROJECT_TYPE_SUITEAPP ? `${input.publisherid}.${input.projectid}` : projectName;
		const targetProjectFolder = join(parentDirectory, targetProjectFolderName);
		const targetProjectExists = await pathExists(targetProjectFolder);

		if (targetProjectExists) {
			const contents = await readdir(targetProjectFolder);
			if (contents.length > 0) {
				if (!overwrite) {
					return errorResult(ERROR_FOLDER_EXISTS_AND_NOT_EMPTY);
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

	await mkdir(projectFolder, { recursive: true });

	await writeFile(
		join(projectFolder, MANIFEST_FILENAME),
		fillTemplate(MANIFEST_SUITEAPP_TEMPLATE, {
			publisherId,
			projectId,
			projectName,
			projectVersion,
			frameworkVersion: FRAMEWORK_VERSION,
		}),
		'utf8'
	);

	await writeFile(
		join(projectFolder, DEPLOY_FILENAME),
		fillTemplate(DEPLOY_SUITEAPP_TEMPLATE, { applicationId }),
		'utf8'
	);

	const installationPreferencesFolder = join(projectFolder, INSTALLATION_PREFERENCES_FOLDER);
	await mkdir(installationPreferencesFolder, { recursive: true });
	await writeFile(join(installationPreferencesFolder, HIDING_XML_FILENAME), HIDING_XML_TEMPLATE, 'utf8');
	await writeFile(join(installationPreferencesFolder, LOCKING_XML_FILENAME), LOCKING_XML_TEMPLATE, 'utf8');
	await writeFile(join(installationPreferencesFolder, OVERWRITING_XML_FILENAME), OVERWRITING_XML_TEMPLATE, 'utf8');

	await mkdir(join(projectFolder, FILE_CABINET_FOLDER, FILE_CABINET_WEB_SITE_HOSTING_FILES_FOLDER), { recursive: true });
	await mkdir(
		join(projectFolder, FILE_CABINET_FOLDER, FILE_CABINET_SUITE_APPS_FOLDER, applicationId),
		{ recursive: true }
	);
	await mkdir(join(projectFolder, OBJECTS_FOLDER), { recursive: true });
	await mkdir(join(projectFolder, TRANSLATIONS_FOLDER), { recursive: true });
}

async function createAcpProject(projectFolder: string, projectName: string): Promise<void> {
	await mkdir(projectFolder, { recursive: true });

	await writeFile(
		join(projectFolder, MANIFEST_FILENAME),
		fillTemplate(MANIFEST_ACP_TEMPLATE, {
			projectName,
			frameworkVersion: FRAMEWORK_VERSION,
		}),
		'utf8'
	);

	await writeFile(join(projectFolder, DEPLOY_FILENAME), DEPLOY_ACP_TEMPLATE, 'utf8');

	await mkdir(join(projectFolder, ACCOUNT_CONFIGURATION_FOLDER), { recursive: true });
	await mkdir(join(projectFolder, FILE_CABINET_FOLDER, FILE_CABINET_SUITESCRIPTS_FOLDER), { recursive: true });
	await mkdir(
		join(
			projectFolder,
			FILE_CABINET_FOLDER,
			FILE_CABINET_WEB_SITE_HOSTING_FILES_FOLDER,
			FILE_CABINET_LIVE_HOSTING_FILES_FOLDER
		),
		{ recursive: true }
	);
	await mkdir(
		join(
			projectFolder,
			FILE_CABINET_FOLDER,
			FILE_CABINET_WEB_SITE_HOSTING_FILES_FOLDER,
			FILE_CABINET_STAGING_HOSTING_FILES_FOLDER
		),
		{ recursive: true }
	);
	await mkdir(
		join(
			projectFolder,
			FILE_CABINET_FOLDER,
			FILE_CABINET_TEMPLATES_FOLDER,
			FILE_CABINET_TEMPLATES_EMAIL_TEMPLATES_FOLDER
		),
		{ recursive: true }
	);
	await mkdir(
		join(
			projectFolder,
			FILE_CABINET_FOLDER,
			FILE_CABINET_TEMPLATES_FOLDER,
			FILE_CABINET_TEMPLATES_MARKETING_TEMPLATES_FOLDER
		),
		{ recursive: true }
	);
	await mkdir(join(projectFolder, OBJECTS_FOLDER), { recursive: true });
	await mkdir(join(projectFolder, TRANSLATIONS_FOLDER), { recursive: true });
}

function fillTemplate(template: string, replacements: Record<string, string>): string {
	let content = template;
	for (const [token, value] of Object.entries(replacements)) {
		content = content.replace(new RegExp(`{{${token}}}`, 'g'), value ?? '');
	}
	return content;
}

function toBoolean(value: unknown): boolean {
	if (typeof value === 'boolean') {
		return value;
	}
	if (typeof value === 'string') {
		return value.trim().toLowerCase() === 'true';
	}
	return false;
}

function unquote(value: string): string {
	if (value.length > 1 && value.startsWith('"') && value.endsWith('"')) {
		return value.slice(1, -1);
	}
	return value;
}

async function pathExists(path: string): Promise<boolean> {
	try {
		await access(path);
		return true;
	} catch (error: unknown) {
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
	if (error instanceof Error) {
		return error.message;
	}
	return String(error);
}
