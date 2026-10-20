/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import type { ProjectDeploySkeleton } from '../../SuiteCloudControlFileTypes';
import { CONTROL_FILE_FIELDS } from '../../SuiteCloudProjectConstants';
import { PROJECT_CONTROL } from '../../../translation/TranslationKeys';
import { translationService } from '../../../translation/TranslationService';

const { DEPLOY } = CONTROL_FILE_FIELDS;

export function getDeployPathGroup(
	deploy: ProjectDeploySkeleton,
	groupId: string,
	filename: string,
	propertyPath: string
): string[] {
	switch (groupId) {
		case DEPLOY.FILES:
		case DEPLOY.OBJECTS:
		case DEPLOY.TRANSLATION_IMPORTS:
			return deploy[groupId] ??= [];
		case DEPLOY.CONFIGURATION:
			return deploy.configurations ??= [];
		default: {
			const reason = translationService.getMessage(PROJECT_CONTROL.ERROR.UNSUPPORTED_DEPLOY_GROUP, groupId);
			throw new Error(translationService.getMessage(
				PROJECT_CONTROL.ERROR.STRUCTURE_INVALID, filename, propertyPath, reason
			));
		}
	}
}
