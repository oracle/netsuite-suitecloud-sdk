/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import type { ProjectManifest } from '../SuiteCloudControlFileTypes';
import { CONTROL_FILE_FIELDS } from '../SuiteCloudProjectConstants';
import { getXmlRoot, xmlText } from './XmlControlFileParser';

export function normalizeXmlManifest(document: unknown, filename: string): ProjectManifest {
	const manifest = getXmlRoot(document, filename, CONTROL_FILE_FIELDS.MANIFEST);
	const publisherId = xmlText(manifest[CONTROL_FILE_FIELDS.PUBLISHER_ID]);
	const projectId = xmlText(manifest[CONTROL_FILE_FIELDS.PROJECT_ID]);
	const rootPath = `/${CONTROL_FILE_FIELDS.MANIFEST}`;
	return {
		projectType: xmlText(manifest.$?.[CONTROL_FILE_FIELDS.PROJECT_TYPE]),
		projectName: xmlText(manifest[CONTROL_FILE_FIELDS.PROJECT_NAME]),
		publisherId,
		projectId,
		applicationId: publisherId && projectId ? `${publisherId}.${projectId}` : undefined,
		projectVersion: xmlText(manifest[CONTROL_FILE_FIELDS.PROJECT_VERSION]),
		frameworkVersion: xmlText(manifest[CONTROL_FILE_FIELDS.FRAMEWORK_VERSION]),
		source: { file: filename, propertyPath: rootPath },
		propertyPaths: {
			projectType: `${rootPath}/@${CONTROL_FILE_FIELDS.PROJECT_TYPE}`,
			projectName: `${rootPath}/${CONTROL_FILE_FIELDS.PROJECT_NAME}`,
			publisherId: `${rootPath}/${CONTROL_FILE_FIELDS.PUBLISHER_ID}`,
			projectId: `${rootPath}/${CONTROL_FILE_FIELDS.PROJECT_ID}`,
			projectVersion: `${rootPath}/${CONTROL_FILE_FIELDS.PROJECT_VERSION}`,
			frameworkVersion: `${rootPath}/${CONTROL_FILE_FIELDS.FRAMEWORK_VERSION}`,
		},
	};
}
