/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';


export enum SDF_PROJECT_TYPES {
	ACP = 'ACCOUNTCUSTOMIZATION',
	SUITEAPP = 'SUITEAPP',
}

export enum SDF_FRAMEWORK_VERSIONS {
	SDFv1 = '1.0',
	SDFv2 = '2.0',
}

export enum SDF_SUPPORTED_FILE_FORMATS  {
	JSON = 'json',
	XML = 'xml',
	YAML = 'yaml',
	YML = 'yml',
}

export const FILES = {
	CONTROL_FILES: {
		APPLICATION: 'application',
		DEPLOY: 'deploy',
		MANIFEST: 'manifest',
	},
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


// XML, JSON, and YAML control files use the same field IDs.
export const CONTROL_FILE_FIELDS = {
	MANIFEST: {
		ROOT: FILES.CONTROL_FILES.MANIFEST,
		APPLICATION: 'application',
		APPLICATIONS: 'applications',
		BUNDLE: 'bundle',
		BUNDLES: 'bundles',
		DEPENDENCIES: 'dependencies',
		FEATURE: 'feature',
		FEATURES: 'features',
		FILE: 'file',
		FILES: 'files',
		FOLDER: 'folder',
		FOLDERS: 'folders',
		FRAMEWORK_VERSION: 'frameworkversion',
		ID: 'id',
		NAME: 'name',
		OBJECT: 'object',
		OBJECTS: 'objects',
		PLATFORM_EXTENSION: 'platformextension',
		PLATFORM_EXTENSIONS: 'platformextensions',
		PROJECT_ID: 'projectid',
		PROJECT_NAME: 'projectname',
		PROJECT_TYPE: 'projecttype',
		PROJECT_VERSION: 'projectversion',
		PUBLISHER_ID: 'publisherid',
		REQUIRED: 'required',
	},
	DEPLOY: {
		ROOT: FILES.CONTROL_FILES.DEPLOY,
		CONFIGURATION: 'configuration',
		DEPLOYMENT: 'deployment',
		FILES: 'files',
		OBJECTS: 'objects',
		PATH: 'path',
		RUN: 'run',
		SCRIPT: 'script',
		SCRIPT_FILE: 'scriptfile',
		SDF_INSTALLATION_SCRIPT: 'sdfinstallationscript',
		TRANSLATION_IMPORTS: 'translationimports',
	},
} as const;
