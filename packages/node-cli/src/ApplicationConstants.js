/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

module.exports = {
	AUTHORIZATION_PROPERTIES_KEYS: {
		NEEDS_REAUTHORIZATION: 'needsReauthorization',
		SKIP_AUHTORIZATION_CHECK: 'skipAuthorizationCheck'
	},
	SDK_COMMANDS_METADATA_FILE: 'metadata/SdkCommandsMetadata.json',
	SDK_COMMANDS_METADATA_PATCH_FILE: 'metadata/SdkCommandsMetadataPatch.json', //Overwrites selected properties in SdkCommandsMetadata.json file that are specific for SuiteCloud CLI for Node.js
	NODE_COMMANDS_METADATA_FILE: 'metadata/NodeCommandsMetadata.json',
	COMMAND_GENERATORS_METADATA_FILE: 'metadata/CommandGenerators.json',
	SDK_COMPATIBLE_JAVA_VERSIONS: ['17', '21'],
	SDK_INTEGRATION_MODE_JVM_OPTION: '-DintegrationMode --add-opens java.base/java.io=ALL-UNNAMED',
	SDK_CLIENT_PLATFORM: 'SuiteCloudCLIforNode.js',
	SDK_CLIENT_PLATFORM_JVM_OPTION: '-DclientPlatform',
	SDK_CLIENT_PLATFORM_VERSION_JVM_OPTION: '-DclientPlatformVersion',
	FILES: {
		PROJECT_JSON: 'project.json',
		HIDING_PREFERENCE: 'hiding.xml',
		LOCKING_PREFERENCE: 'locking.xml',
		MANIFEST_XML: 'manifest.xml',
		SDK_SETTINGS: 'suitecloud-sdk-settings.json',
	},
	FOLDERS: {
		FILE_CABINET: '/FileCabinet',
		INSTALLATION_PREFERENCES: '/InstallationPreferences',
		OBJECTS: '/Objects',
		SUITEAPPS: '/SuiteApps',
		SUITECLOUD_SDK: '.suitecloud-sdk',
		NODE_CLI: 'cli',
	},
	DEFAULT_MESSAGES_FILE: '../../messages.json',
	PROJECT_ACP: 'ACCOUNTCUSTOMIZATION',
	PROJECT_SUITEAPP: 'SUITEAPP',
	PROJECT_FOLDER_ARG: '--projectFolder',
	DOMAIN: {
		PRODUCTION: {
			GENERIC_NETSUITE_DOMAIN: 'system.netsuite.com',
			PRODUCTION_DOMAIN_REGEX: '^system\\.(\\w+\\.)*netsuite\\.com$',
			PRODUCTION_ACCOUNT_SPECIFIC_DOMAIN_REGEX: '^(\\w+)\\.app\\.netsuite\\.com$',
		},
		NON_PRODUCTION: {
			F_DOMAIN_REGEX: '^system\\.f\\.netsuite\\.com$',
			F_ACCOUNT_SPECIFIC_DOMAIN_REGEX: '^(\\w+)\\.app\\.f\\.netsuite\\.com$',
			SNAP_DOMAIN_REGEX: '^system\\.snap\\.netsuite\\.com$',
			SNAP_ACCOUNT_SPECIFIC_DOMAIN_REGEX: '^(\\w+)\\.app\\.snap\\.netsuite\\.com$',
		}
	},
	LINKS: {
		INFO: {
			PROJECT_STRUCTURE: 'https://system.netsuite.com/app/help/helpcenter.nl?fid=section_155931221634.html',
		},
		HOW_TO: {
			CREATE_HIDDING_XML: 'https://system.netsuite.com/app/help/helpcenter.nl?fid=section_1515950176.html',
			CREATE_LOCKING_XML: 'https://system.netsuite.com/app/help/helpcenter.nl?fid=section_1543865613.html',
			CREATE_INSTALLATION_PREFERENCES: 'https://system.netsuite.com/app/help/helpcenter.nl?fid=section_1515948480.html',
		},
		ERRORS: {
			AUTHENTICATION_INFO: 'https://system.netsuite.com/app/help/helpcenter.nl?fid=article_0113125121.html',
			AUTHENTICATION_FALLBACK_INFO: 'https://system.netsuite.com/app/help/helpcenter.nl?fid=article_1024042128.html#subsect_83104357122'
		}
	},
	ENV_VARS: {
		SUITECLOUD_CI: 'SUITECLOUD_CI',
		SUITECLOUD_CI_PASSKEY: 'SUITECLOUD_CI_PASSKEY',
		SUITECLOUD_FALLBACK_PASSKEY: 'SUITECLOUD_FALLBACK_PASSKEY'
	},
	HTTP_RESPONSE_CODE: {
		UNAUTHORIZED: 401,
		FORBIDDEN: 403,
		INTERNAL_SERVER_ERROR: 500,
		SERVICE_UNAVAILABLE: 503,
	},
};
