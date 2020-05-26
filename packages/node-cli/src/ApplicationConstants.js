/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

module.exports = {
	SDK_COMMANDS_METADATA_FILE: 'metadata/SdkCommandsMetadata.json',
	NODE_COMMANDS_METADATA_FILE: 'metadata/NodeCommandsMetadata.json',
	COMMAND_GENERATORS_METADATA_FILE: 'metadata/CommandGenerators.json',
	SDK_FILENAME: 'cli-2020.1.1.jar',
	SDK_REQUIRED_JAVA_VERSION: '11',
	SDK_INTEGRATION_MODE_JVM_OPTION: '-DintegrationMode',
	SDK_DEVELOPMENT_MODE_JVM_OPTION: '-DdevelopmentMode',
	SDK_CLIENT_PLATFORM_VERSION_JVM_OPTION: '-DclientPlatformVersion',
	SDK_PROXY_JVM_OPTIONS: {
		PROTOCOL: '-DproxyProtocol',
		HOST: '-DproxyHost',
		PORT: '-DproxyPort',
	},
	FILES: {
		PROJECT_JSON: 'project.json',
		HIDING_PREFERENCE: 'hiding.xml',
		LOCKING_PREFERENCE: 'locking.xml',
		MANIFEST_XML: 'manifest.xml',
		CLI_SETTINGS: 'nodejs-cli-settings.json'
	},
	FOLDERS: {
		FILE_CABINET: '/FileCabinet',
		INSTALLATION_PREFERENCES: '/InstallationPreferences',
		OBJECTS: '/Objects',
		SUITECLOUD_SDK: '.suitecloud-sdk',
		NODE_CLI: 'cli'
	},
	DEFAULT_MESSAGES_FILE: '../../messages.json',
	PROJECT_ACP: 'ACCOUNTCUSTOMIZATION',
	PROJECT_SUITEAPP: 'SUITEAPP',
	PROD_ENVIRONMENT_ADDRESS: 'https://system.netsuite.com',
	HTTP_PROTOCOL: 'http://',
	REST_ROLES_URL: '/rest/roles',
	LINKS: {
		HOW_TO: {
			CREATE_HIDDING_XML:
				'https://system.netsuite.com/app/help/helpcenter.nl?fid=section_1515950176.html',
			CREATE_LOCKING_XML:
				'https://system.netsuite.com/app/help/helpcenter.nl?fid=section_1543865613.html',
			ISSUE_A_TOKEN:
				'https://system.netsuite.com/app/help/helpcenter.nl?fid=bridgehead_4254083671.html',
		},
	},
};
