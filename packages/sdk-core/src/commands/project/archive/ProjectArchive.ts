/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { randomBytes } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createZipArchive } from '../../../services/archive/ZipArchive';
import { PROJECT_API } from '../../../services/translation/TranslationKeys';
import { translationService } from '../../../services/translation/TranslationService';
import { createPackageArchivePlan } from './ProjectArchivePlan';

const PROJECT_ARCHIVE_PREFIX = 'suitecloud-project';

export async function createProjectArchive(projectFolder: string): Promise<string> {
	const fileName = `${PROJECT_ARCHIVE_PREFIX}-${Date.now()}-${randomBytes(4).toString('hex')}.zip`;
	const projectArchivePath = join(tmpdir(), fileName);

	try {
		const archivePlan = await createPackageArchivePlan(projectFolder);
		await createZipArchive(projectFolder, projectArchivePath, archivePlan.entries);
		return projectArchivePath;
	} catch (error: unknown) {
		throw new Error(
			translationService.getMessage(PROJECT_API.ERROR.ARCHIVE_FAILED, projectFolder, toErrorMessage(error))
		);
	}
}

export async function deleteProjectArchiveQuietly(archivePath: string): Promise<void> {
	try {
		await unlink(archivePath);
	} catch {
		// Cleanup is intentionally best-effort and must not hide the command result.
	}
}

function toErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
