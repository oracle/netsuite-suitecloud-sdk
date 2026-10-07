/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { FILES, SDF_FRAMEWORK_VERSIONS } from './SuiteCloudProjectConstants';

export type FileFormat = typeof FILES.FILE_FORMATS[keyof typeof FILES.FILE_FORMATS];
export type SdfFrameworkVersion = typeof SDF_FRAMEWORK_VERSIONS[keyof typeof SDF_FRAMEWORK_VERSIONS];
export type SuiteCloudControlFileKind = typeof FILES.FILE_NAMES[keyof typeof FILES.FILE_NAMES];

// TODO: Rethink this type. Is it needed? Is there a better way of doing things
export type SuiteCloudControlFile = {
	kind: SuiteCloudControlFileKind;
	filename: string;
	filepath: string;
	format: FileFormat;
};

export type SdfProjectControlFiles = {
	sdfFrameworkVersion: SdfFrameworkVersion;
	manifest: SuiteCloudControlFile;
	deploy: SuiteCloudControlFile;
};

// TODO: Is this necessary
export type SourceLocation = { file: string; propertyPath: string };

export type ProjectManifest = {
	projectType: string;
	projectName: string;
	publisherId?: string;
	projectId?: string;
	applicationId?: string;
	projectVersion?: string;
	frameworkVersion: string;

	// TODO: are "SourceLocation" and "propertyPaths" required?
	source: SourceLocation;
	propertyPaths: Record<'projectType' | 'projectName' | 'publisherId' | 'projectId' | 'projectVersion' | 'frameworkVersion', string>;
};

export type DeployPath = { value: string; source: SourceLocation };
export type DeployScript = {
	path: DeployPath;
	deployment: string;
	deploymentSource: SourceLocation;
	source: SourceLocation;
};
export type DeployGroup = {
	kind: string;
	paths: DeployPath[];
	scripts: DeployScript[];
	source: SourceLocation;
};

export type ProjectDescription = {
	controlFiles: SdfProjectControlFiles;
	manifest: ProjectManifest;
	deployGroups: DeployGroup[];
};
