/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { execFile } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { TranslationKeys } from '../translation/TranslationKeys';
import { translationService } from '../translation/TranslationService';

export interface ProjectArchiveService {
	create(projectFolder: string): Promise<string>;
	remove(archivePath: string): Promise<void>;
}

const execFileAsync = promisify(execFile);
const PROJECT_ARCHIVE_PREFIX = 'suitecloud-project';
const ZIP_BINARY_NAME = 'zip';
const ZIP_EXCLUDES = ['.git/*', 'node_modules/*', '.DS_Store', 'build/*'];

export class DefaultProjectArchiveService implements ProjectArchiveService {
	async create(projectFolder: string): Promise<string> {
		const fileName = `${PROJECT_ARCHIVE_PREFIX}-${Date.now()}-${randomBytes(4).toString('hex')}.zip`;
		const projectArchivePath = join(tmpdir(), fileName);
		const zipCommandArgs = ['-r', '-q', projectArchivePath, '.', '-x', ...ZIP_EXCLUDES];

		try {
			await execFileAsync(ZIP_BINARY_NAME, zipCommandArgs, { cwd: projectFolder });
			return projectArchivePath;
		} catch {
			throw new Error(
				translationService.getMessage(
					TranslationKeys.PROJECT_COMMAND.ERROR.ARCHIVE_FAILED,
					projectFolder,
					ZIP_BINARY_NAME
				)
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
