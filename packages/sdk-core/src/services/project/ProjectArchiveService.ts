/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { randomBytes } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createZipArchive } from '../archive/ArchiveService';
import { createProjectUploadArchiveEntries } from './ProjectArchivePlan';

export interface ProjectArchiveService {
	create(projectFolder: string): Promise<string>;
	remove(archivePath: string): Promise<void>;
}

const PROJECT_ARCHIVE_PREFIX = 'suitecloud-project';

export class DefaultProjectArchiveService implements ProjectArchiveService {
	async create(projectFolder: string): Promise<string> {
		const fileName = `${PROJECT_ARCHIVE_PREFIX}-${Date.now()}-${randomBytes(4).toString('hex')}.zip`;
		const projectArchivePath = join(tmpdir(), fileName);

		try {
			const archiveEntries = await createProjectUploadArchiveEntries(projectFolder);
			await createZipArchive(projectFolder, projectArchivePath, archiveEntries);
			return projectArchivePath;
		} catch (error: unknown) {
			throw new Error(
				`Unable to archive project folder "${projectFolder}": ${toErrorMessage(error)}`
			);
		}
	}

	async remove(archivePath: string): Promise<void> {
		try {
			await unlink(archivePath);
		} catch {
			// Cleanup is intentionally best-effort and must not hide the command result.
		}
	}
}

const defaultProjectArchiveService = new DefaultProjectArchiveService();

export function createDefaultProjectArchive(projectFolder: string): Promise<string> {
	return defaultProjectArchiveService.create(projectFolder);
}

export function deleteFileQuietly(filepath: string): Promise<void> {
	return defaultProjectArchiveService.remove(filepath);
}

function toErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
