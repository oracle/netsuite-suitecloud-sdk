/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

export const VSCODE_PLATFORM = 'VSCode';

export const FILES = {
	DEPLOY_XML: 'deploy.xml',
	MANIFEST_XML: 'manifest.xml',
	PROJECT_JSON: 'project.json',
	SUITECLOUD_CONFIG_JS: 'suitecloud.config.js'
};

export const FOLDERS = {
	OBJECTS: 'Objects',
	SEPARATOR: '/',
	SUITEAPPS: '/SuiteApps',
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

const DEVASSIST_PROXY_BASE_PATH = '/api/internal/devassist';

export const DEVASSIST = {
	ALLOWED_PROXY_PATH_PREFIX: `${DEVASSIST_PROXY_BASE_PATH}/`,
	CONFIGURATION_SECTION: 'suitecloud.developerAssistant',
	PREFERENCES_STORAGE_KEY: 'suitecloud.controlPanel.state.v1',
	DEFAULT_VALUES: {
		localPort: 8181,
		authID: 'authid-to-be-used-by-dev-assist',
	},
	PORT_RANGE: {
		MIN: 1024,
		MAX: 65535,
	},
	PROXY_URL: {
		SCHEME: 'http://',
		LOCALHOST_IP: '127.0.0.1',
		BASE_PATH: DEVASSIST_PROXY_BASE_PATH,
		FEEDBACK_PATH: `${DEVASSIST_PROXY_BASE_PATH}/feedback`,
	},
};
