/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

export const VSCODE_PLATFORM = 'VSCode';

export const FILES = {
	CREDENTIALS: 'credentials',
	PROJECT_JSON: 'project.json'
};

export const FOLDERS = {
	OBJECTS: 'Objects',
	SEPARATOR: '/',
	SUITEAPPS: '/SuiteApps',
	SUITECLOUD_SDK: '.suitecloud-sdk',
	SUITESCRIPTS: '/SuiteScripts',
	TEMPLATES_EMAIL_TEMPLATES: '/Templates/E-mail Templates',
	TEMPLATES_MARKETING_TEMPLATES: '/Templates/Marketing Templates',
	WEB_SITE_HOSTING_FILES: '/Web Site Hosting Files',
};

export const ACP_UNRESTRICTED_FOLDERS: string[] = [
	FOLDERS.SUITESCRIPTS,
	FOLDERS.TEMPLATES_EMAIL_TEMPLATES,
	FOLDERS.TEMPLATES_MARKETING_TEMPLATES,
	FOLDERS.WEB_SITE_HOSTING_FILES,
];
