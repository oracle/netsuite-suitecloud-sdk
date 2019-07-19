/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

module.exports = {
	SDK_COMMANDS_METADATA_FILE: 'metadata/SDKCommandsMetadata.json',
	NODE_COMMANDS_METADATA_FILE: 'metadata/NodeCommandsMetadata.json',
	COMMAND_GENERATORS_METADATA_FILE: 'metadata/CommandGenerators.json',
	ACCOUNT_DETAILS_FILENAME: 'account.json',
	SDF_SDK_PATHNAME: '../bin/cli-2019.2.0-SNAPSHOT.jar',
	SDK_INTEGRATION_MODE_JVM_OPTION: '-DintegrationMode',
	SDK_PROXY_JVM_OPTIONS: {
		PROTOCOL: '-DproxyProtocol',
		HOST: '-DproxyHost',
		PORT: '-DproxyPort',
	},
	FILE_NAMES: {
		HIDING_PREFERENCE: 'hiding.xml',
		LOCKING_PREFERENCE: 'locking.xml',
	},
	FOLDER_NAMES: {
		FILE_CABINET: '/FileCabinet',
		INSTALLATION_PREFERENCES: '/InstallationPreferences',
		OBJECTS: '/Objects',
	},
	DEFAULT_MESSAGES_FILE: '../../messages.json',
	MANIFEST_XML: 'manifest.xml',
	PROJECT_ACP: 'ACCOUNTCUSTOMIZATION',
	PROJECT_SUITEAPP: 'SUITEAPP',
	REST_ROLES_URL: 'https://system.netsuite.com/rest/roles',
	REST_ISSUE_TOKEN_URL: 'https://system.netsuite.com/rest/issuetoken',
	LINKS: {
		HOW_TO: {
			CREATE_HIDDING_XML: 'https://system.netsuite.com/app/help/helpcenter.nl?fid=section_1515950176.html',
			CREATE_LOCKING_XML: 'https://system.netsuite.com/app/help/helpcenter.nl?fid=section_1543865613.html',
			ISSUE_A_TOKEN: 'https://system.netsuite.com/app/help/helpcenter.nl?fid=bridgehead_4254083671.html',
		}
	},
	CONSUMER_REQUEST_PARAM:{
		KEY: 'consumerKey',
		VALUE: 'NmRhNTdiZjA1YTYyNDdmYzg3NmM2ZDIyODE4NGZmNDg3NzYwYTM4MmE0M2FjN2U5M2VhZmY3NDM4MDNkMjJhYw==',
	},
};
