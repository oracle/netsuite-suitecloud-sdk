/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import type { ProjectDeploySkeleton } from '../SuiteCloudControlFileTypes';
import { CONTROL_FILE_FIELDS } from '../SuiteCloudProjectConstants';
import { PROJECT_CONTROL } from '../../translation/TranslationKeys';
import { translationService } from '../../translation/TranslationService';

const { DEPLOY } = CONTROL_FILE_FIELDS;

export function createProjectDeploySkeleton(): ProjectDeploySkeleton {
	return { files: [], objects: [], run: [], translationimports: [], configurations: [] };
}

export function getDeployPathGroup(
	deploy: ProjectDeploySkeleton,
	kind: string,
	filename: string,
	propertyPath: string
): string[] {
	switch (kind) {
		case DEPLOY.FILES:
		case DEPLOY.OBJECTS:
		case DEPLOY.TRANSLATION_IMPORTS:
			return deploy[kind];
		case DEPLOY.CONFIGURATION:
			return deploy.configurations;
		default:
			throw new Error(translationService.getMessage(
				PROJECT_CONTROL.ERROR.STRUCTURE_INVALID, filename, propertyPath,
				`a supported deploy group (${[DEPLOY.FILES, DEPLOY.OBJECTS, DEPLOY.RUN, DEPLOY.TRANSLATION_IMPORTS, DEPLOY.CONFIGURATION].join(', ')})`
			));
	}
}
