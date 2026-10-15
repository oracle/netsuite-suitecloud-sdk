/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { CONTROL_FILE_FIELDS } from '../SuiteCloudProjectConstants';
import { normalizeManifestDependencies } from '../sdf_commons/ManifestDependenciesNormalizer';
import { getXmlRoot, xmlText, xmlChildren, type XmlNode } from './XmlControlFileParser';
import type { ManifestDependencies, ProjectManifestSkeleton } from '../SuiteCloudControlFileTypes';

const { MANIFEST } = CONTROL_FILE_FIELDS;

export function normalizeXmlManifest(document: unknown, filename: string): ProjectManifestSkeleton {
	const manifest = getXmlRoot(document, filename, MANIFEST.ROOT);
	const publisherId = xmlText(manifest[MANIFEST.PUBLISHER_ID]);
	const projectId = xmlText(manifest[MANIFEST.PROJECT_ID]);
	return {
		projectType: xmlText(manifest.$?.[MANIFEST.PROJECT_TYPE]),
		projectName: xmlText(manifest[MANIFEST.PROJECT_NAME]),
		publisherId,
		projectId,
		applicationId: publisherId && projectId ? `${publisherId}.${projectId}` : undefined,
		projectVersion: xmlText(manifest[MANIFEST.PROJECT_VERSION]),
		frameworkVersion: xmlText(manifest[MANIFEST.FRAMEWORK_VERSION]),
		dependencies: normalizeXmlDependencies(manifest, filename),
	};
}

function normalizeXmlDependencies(manifest: XmlNode, filename: string): ManifestDependencies | undefined {
	const dependencies = xmlChildren(manifest, MANIFEST.DEPENDENCIES)[0];
	if (!dependencies) {
		return undefined;
	}
	return normalizeManifestDependencies({
		features: selections(dependencies, MANIFEST.FEATURES, MANIFEST.FEATURE)?.map((feature) => ({
			name: xmlText(feature), required: xmlText(feature.$?.[MANIFEST.REQUIRED]),
		})),
		applications: selections(dependencies, MANIFEST.APPLICATIONS, MANIFEST.APPLICATION)?.map((application) => ({
			id: xmlText(application.$?.[MANIFEST.ID]),
			objects: selections(application, MANIFEST.OBJECTS, MANIFEST.OBJECT)?.map(xmlText),
			platformextensions: selections(application, MANIFEST.PLATFORM_EXTENSIONS, MANIFEST.PLATFORM_EXTENSION)?.map(xmlText),
		})),
		bundles: selections(dependencies, MANIFEST.BUNDLES, MANIFEST.BUNDLE)?.map((bundle) => ({
			id: xmlText(bundle.$?.[MANIFEST.ID]), objects: selections(bundle, MANIFEST.OBJECTS, MANIFEST.OBJECT)?.map(xmlText),
		})),
		files: selections(dependencies, MANIFEST.FILES, MANIFEST.FILE)?.map(xmlText),
		folders: selections(dependencies, MANIFEST.FOLDERS, MANIFEST.FOLDER)?.map(xmlText),
		objects: selections(dependencies, MANIFEST.OBJECTS, MANIFEST.OBJECT)?.map(xmlText),
		platformextensions: selections(dependencies, MANIFEST.PLATFORM_EXTENSIONS, MANIFEST.PLATFORM_EXTENSION)?.map(xmlText),
	}, filename);
}

function selections(node: XmlNode, wrapper: string, item: string): XmlNode[] | undefined {
	const group = xmlChildren(node, wrapper)[0];
	return group ? xmlChildren(group, item) : undefined;
}
