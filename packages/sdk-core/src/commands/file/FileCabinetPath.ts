/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { isSuiteCloudPathWithinRoot } from '../../services/project/ProjectPathResolver';
import { FILE } from '../../services/translation/TranslationKeys';
import { translationService } from '../../services/translation/TranslationService';

const TEMPLATES_ROOT = '/Templates';
const SUITEAPPS_ROOT = '/SuiteApps';
const ALLOWED_FILE_CABINET_PATHS = [
	'/SuiteScripts',
	'/Templates/E-mail Templates',
	'/Templates/Marketing Templates',
	'/Web Site Hosting Files',
] as const;

export function isValidFileCabinetPath(fileCabinetPath: string): boolean {
	if (!fileCabinetPath) {
		return false;
	}

	const normalizedPath = fileCabinetPath.replace(/\\/g, '/').trim();
	return normalizedPath === TEMPLATES_ROOT || ALLOWED_FILE_CABINET_PATHS.some((allowedPath) =>
		isSuiteCloudPathWithinRoot(normalizedPath, allowedPath)
	);
}

export function isValidImportFileCabinetPath(fileCabinetPath: string, allowSuiteAppPaths = false): boolean {
	if (isValidFileCabinetPath(fileCabinetPath)) {
		return true;
	}
	if (!allowSuiteAppPaths || !fileCabinetPath) {
		return false;
	}

	const normalizedPath = fileCabinetPath.replace(/\\/g, '/').trim();
	return isSuiteCloudPathWithinRoot(normalizedPath, SUITEAPPS_ROOT);
}

export function getInvalidFileCabinetPathMessage(fileCabinetPath: string, allowSuiteAppPaths = false): string {
	const allowedPaths = allowSuiteAppPaths
		? [...ALLOWED_FILE_CABINET_PATHS, SUITEAPPS_ROOT]
		: ALLOWED_FILE_CABINET_PATHS;
	return translationService.getMessage(
		FILE.ERROR.INVALID_FILE_CABINET_PATH,
		fileCabinetPath,
		allowedPaths.join(',')
	);
}
