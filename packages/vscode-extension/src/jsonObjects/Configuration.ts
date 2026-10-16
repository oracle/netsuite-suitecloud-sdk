/*
 ** Copyright (c) 2026 Oracle and/or its affiliates. All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

export const JSON_OBJECTS = {
	CONFIGURATION: 'suitecloud.jsonObjects',
	ENABLED: 'enabled',
	SCHEMA_URL: 'schemaUrl',
	REGISTRY_SCHEME: 'suitecloud-schema',
	REGISTRY_URI: 'suitecloud-schema://registry/associations.json',
	DISCOVERY_EXCLUDE: '**/{node_modules,.git,.vscode-test,.suitecloud-sdk}/**',
	REFRESH_DELAY_MS: 250,
	YAML_EXTENSION: 'redhat.vscode-yaml',
	YAML_SCHEMA_SCHEME: 'suitecloud-yaml',
};

export interface ObjectProject {
	root: string;
	source: string;
	objects: string;
	schemaUrl: string;
}

export interface SchemaAssociation {
	url: string;
	fileMatch: string[];
}
