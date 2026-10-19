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


export type SdfControlFileMetadata = {
	type: SdfControlFileType;
	fileName: string;
	filePath: string;
	fileFormat: SdfSupportedFileFormat;
};

export type SdfProjectControlFilesMetadata = {
	manifest: SdfControlFileMetadata;
	deploy: SdfControlFileMetadata;
	application?: SdfControlFileMetadata;
};

export type ProjectContext = {
	controlFilesMetadata: SdfProjectControlFilesMetadata;
	manifest: ProjectManifest;
	deploy: ProjectDeploy;
};

/** Partial normalized data: widen string literals and recursively make object fields optional. */
export type Skeleton<T> =
	T extends string ? string :
	T extends readonly (infer Item)[] ? Skeleton<Item>[] :
	T extends object ? {
		[Key in keyof T]?: Skeleton<NonNullable<T[Key]>>;
	} :
	T;

export type ProjectManifestSkeleton = Skeleton<Omit<ProjectManifest, 'getApplicationId'>> & Pick<ProjectManifest, 'getApplicationId'>;

export type ProjectManifest = {
	projectType: SdfProjectType;
	projectName: string;
	publisherId?: string;
	projectId?: string;
	projectVersion?: string;
	frameworkVersion: SdfFrameworkVersion;
	dependencies?: ManifestDependencies;
	
	getApplicationId(): string | undefined;
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
export type ProjectDeploySkeleton = Skeleton<ProjectDeploy>;

export type ProjectDeploy = {
	files?: string[];
	objects?: string[];
	run?: DeployScript[];
	translationimports?: string[];
	configurations?: string[];
};

export type DeployScript = {
	path: string;
	deployment: string;
};
