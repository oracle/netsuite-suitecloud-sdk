/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { isSuiteCloudPathWithinRoot } from '../../services/project/ProjectPathResolver';
import { FILE } from '../../services/translation/TranslationKeys';
import { translationService } from '../../services/translation/TranslationService';

const TEMPLATES_ROOT = '/Templates';
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

export function getInvalidFileCabinetPathMessage(fileCabinetPath: string): string {
	return translationService.getMessage(
		FILE.ERROR.INVALID_FILE_CABINET_PATH,
		fileCabinetPath,
		ALLOWED_FILE_CABINET_PATHS.join(',')
	);
}
