/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import type { ImportFileResult } from '../../../api/file/FileCommand';
import {
	assertCreatablePathWithin,
	assertPathWithin,
	assertRealPathWithin,
	resolveSuiteCloudPath,
} from '../../../services/project/ProjectPathResolver';

const FILE_CABINET_ROOT_FOLDER = 'FileCabinet';

export async function copyImportedFiles(
	unzipTargetFolder: string,
	projectFolder: string,
	results: ImportFileResult[]
): Promise<void> {
	for (const result of results) {
		if (!result.loaded) {
			continue;
		}

		const sourceRoot = join(unzipTargetFolder, FILE_CABINET_ROOT_FOLDER);
		const targetRoot = join(projectFolder, FILE_CABINET_ROOT_FOLDER);
		const sourceFilePath = await assertRealPathWithin(
			sourceRoot,
			resolveSuiteCloudPath(sourceRoot, result.path)
		);
		const unresolvedTargetFilePath = assertPathWithin(
			targetRoot,
			resolveSuiteCloudPath(targetRoot, result.path)
		);
		const targetFilePath = await assertCreatablePathWithin(projectFolder, unresolvedTargetFilePath);

		await mkdir(dirname(targetFilePath), { recursive: true });
		await copyFile(sourceFilePath, targetFilePath);
	}
}
