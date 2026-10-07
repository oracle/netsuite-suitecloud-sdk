/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

export const FILES = {
	FILE_FORMATS: {
		JSON: 'json',
		XML: 'xml',
		YAML: 'yaml',
		YML: 'yml',
	},
	FILE_NAMES: {
		DEPLOY: 'deploy',
		MANIFEST: 'manifest',
	},
	APPLICATION_XML: 'application.xml',
	DELIMITER: '.',
	HIDING_PREFERENCE_XML: 'hiding.xml',
	LOCKING_PREFERENCE_XML: 'locking.xml',
	PROJECT_JSON_XML: 'project.json',
	STATUS_XML: 'status.xml',
	SUITECLOUD_CONFIG_JS: 'suitecloud.config.js',
} as const;

export const FOLDERS = {
	FILE_CABINET: 'FileCabinet',
	INSTALLATION_PREFERENCES: 'InstallationPreferences',
	OBJECTS: 'Objects',
	SEPARATOR: '/',
	SUITE_APPS: 'SuiteApps',
	SUITE_SCRIPTS: 'SuiteScripts',
	WEB_SITE_HOSTING_FILES: 'Web Site Hosting Files',
} as const;

export const PROJECT_TYPES = {
	ACP: 'ACCOUNTCUSTOMIZATION',
	SUITEAPP: 'SUITEAPP',
} as const;

export const SDF_FRAMEWORK_VERSIONS = {
	SDFv1: '1.0',
	SDFv2: '2.0',
} as const;

export const XML_TAGS = {
	CONFIGURATION: 'configuration',
	DEPLOY: FILES.FILE_NAMES.DEPLOY,
	DEPLOYMENT: 'deployment',
	FILES: 'files',
	FRAMEWORK_VERSION: 'frameworkversion',
	MANIFEST: FILES.FILE_NAMES.MANIFEST,
	OBJECTS: 'objects',
	PATH: 'path',
	PROJECT_ID: 'projectid',
	PROJECT_NAME: 'projectname',
	PROJECT_TYPE: 'projecttype',
	PROJECT_VERSION: 'projectversion',
	PUBLISHER_ID: 'publisherid',
	RUN: 'run',
	SCRIPT: 'script',
	SCRIPT_FILE: 'scriptfile',
	SDF_INSTALLATION_SCRIPT: 'sdfinstallationscript',
	TRANSLATION_IMPORTS: 'translationimports',
} as const;
