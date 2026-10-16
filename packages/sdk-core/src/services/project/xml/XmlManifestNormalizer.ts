/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { CONTROL_FILE_FIELDS } from '../SuiteCloudProjectConstants';
import { getXmlRoot, xmlText } from './XmlControlFileParser';
import type { ProjectManifestSkeleton } from '../SuiteCloudControlFileTypes';

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
		// TODO: Implement ManifestDependencies Normalization (as of now it's not required).
		dependencies: undefined,
	};
}
