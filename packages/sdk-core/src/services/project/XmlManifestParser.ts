/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import type { ProjectManifest } from './SuiteCloudControlFileTypes';
import { XML_TAGS } from './SuiteCloudProjectConstants';
import { parseXmlRoot, xmlText } from './XmlControlFileParser';

export function parseXmlManifest(contents: string, filename: string): ProjectManifest {
	const manifest = parseXmlRoot(contents, filename, XML_TAGS.MANIFEST);
	const publisherId = xmlText(manifest[XML_TAGS.PUBLISHER_ID]);
	const projectId = xmlText(manifest[XML_TAGS.PROJECT_ID]);
	const rootPath = `/${XML_TAGS.MANIFEST}`;
	return {
		projectType: xmlText(manifest.$?.[XML_TAGS.PROJECT_TYPE]),
		projectName: xmlText(manifest[XML_TAGS.PROJECT_NAME]),
		publisherId,
		projectId,
		applicationId: publisherId && projectId ? `${publisherId}.${projectId}` : undefined,
		projectVersion: xmlText(manifest[XML_TAGS.PROJECT_VERSION]),
		frameworkVersion: xmlText(manifest[XML_TAGS.FRAMEWORK_VERSION]),
		source: { file: filename, propertyPath: rootPath },
		propertyPaths: {
			projectType: `${rootPath}/@${XML_TAGS.PROJECT_TYPE}`,
			projectName: `${rootPath}/${XML_TAGS.PROJECT_NAME}`,
			publisherId: `${rootPath}/${XML_TAGS.PUBLISHER_ID}`,
			projectId: `${rootPath}/${XML_TAGS.PROJECT_ID}`,
			projectVersion: `${rootPath}/${XML_TAGS.PROJECT_VERSION}`,
			frameworkVersion: `${rootPath}/${XML_TAGS.FRAMEWORK_VERSION}`,
		},
	};
}
