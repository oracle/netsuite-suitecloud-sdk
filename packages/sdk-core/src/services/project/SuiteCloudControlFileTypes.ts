/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { FILES, SDF_FRAMEWORK_VERSIONS, SDF_PROJECT_TYPES, SDF_SUPPORTED_FILE_FORMATS } from './SuiteCloudProjectConstants';

export type SdfSupportedFileFormat = `${SDF_SUPPORTED_FILE_FORMATS}`;
export type SdfFrameworkVersion = `${SDF_FRAMEWORK_VERSIONS}`;
export type SdfProjectType = `${SDF_PROJECT_TYPES}`;
export type SdfControlFileType = typeof FILES.CONTROL_FILES[keyof typeof FILES.CONTROL_FILES];


export type SdfProjectControlFile = {
	type: SdfControlFileType;
	fileName: string;
	filePath: string;
	fileFormat: SdfSupportedFileFormat;
};

export type ProjectContext = {
	controlFiles: SdfProjectControlFiles;
	manifest: ProjectManifest;
	deploy: ProjectDeploy;
};

export type SdfProjectControlFiles = {
	manifest: SdfProjectControlFile;
	deploy: SdfProjectControlFile;
	application?: SdfProjectControlFile;
};

export type ProjectManifestSkeleton = {
	[Key in keyof ProjectManifest]: ProjectManifest[Key] extends string | undefined ? string : ProjectManifest[Key];
};

export type ProjectManifest = {
	projectType: SdfProjectType;
	projectName: string;
	publisherId?: string;
	projectId?: string;
	applicationId?: string;
	projectVersion?: string;
	frameworkVersion: SdfFrameworkVersion;
	dependencies?: ManifestDependencies;
};

// As of writing this, ManifestDependencies is always left undefined
// TODO: Implement support for ManifestDependencies validation && normalization.

export type ManifestDependencies = {
	features?: ManifestFeatureDependency[];
	applications?: ManifestApplicationDependency[];
	bundles?: ManifestBundleDependency[];
	files?: string[];
	folders?: string[];
	objects?: string[];
	platformextensions?: string[];
};

export type ManifestFeatureDependency = {
	name: string;
	required: boolean;
};

export type ManifestApplicationDependency = {
	id: string;
	objects?: string[];
	platformextensions?: string[];
};

export type ManifestBundleDependency = {
	id: string;
	objects?: string[];
};


// Deploy fields do not need additional type narrowing at this stage.
export type ProjectDeploySkeleton = ProjectDeploy;

export type ProjectDeploy = {
	files: string[];
	objects: string[];
	run: DeployScript[];
	translationimports: string[];
	configurations: string[];
};

export type DeployScript = {
	path: string;
	deployment: string;
};
