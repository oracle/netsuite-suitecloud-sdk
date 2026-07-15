/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { readFile } from 'node:fs/promises';

import { SDK_OPERATION_STATUS, type OperationResult } from '../../../api/OperationResult';
import type { ImportFileResult } from '../../../api/file/FileCommand';
import type {
	ImportObjectsExecutionInput,
	ObjectImportResultItem,
} from '../../../api/object/ObjectCommand';
import { OBJECT } from '../../../services/translation/TranslationKeys';
import { translationService } from '../../../services/translation/TranslationService';
import { executeImportFiles } from '../../file/import/ImportFilesExecutor';
import { findObjectFileByScriptId } from '../ObjectFiles';
import { extractScriptFileReferences } from '../ObjectCommandXml';

const SUITESCRIPTS_PREFIX = '/SuiteScripts/';

export async function importReferencedFiles(
	input: ImportObjectsExecutionInput,
	successfulObjectImports: ObjectImportResultItem[]
): Promise<OperationResult<void>> {
	for (const objectImport of successfulObjectImports) {
		const objectFile = await findObjectFileByScriptId(
			input.projectFolder,
			objectImport.customObject.id,
			input.targetFolder
		);
		if (!objectFile) {
			continue;
		}

		const referencedPaths = extractScriptFileReferences(await readFile(objectFile, 'utf8'));
		const validPaths = collectValidPaths(referencedPaths, objectImport);
		if (validPaths.length === 0) {
			continue;
		}

		const importResult = await executeImportFiles({
			hostName: input.hostName,
			accessToken: input.accessToken,
			projectFolder: input.projectFolder,
			filePaths: validPaths,
			excludeProperties: false,
			userAgent: input.userAgent,
			timeoutMs: input.timeoutMs,
		});

		if (importResult.status === SDK_OPERATION_STATUS.ERROR) {
			return {
				status: SDK_OPERATION_STATUS.ERROR,
				httpStatusCode: importResult.httpStatusCode,
				errorMessages: importResult.errorMessages,
			};
		}

		appendImportResults(importResult.data.results, objectImport);
	}

	return { status: SDK_OPERATION_STATUS.SUCCESS };
}

function collectValidPaths(
	referencedPaths: string[],
	objectImport: ObjectImportResultItem
): string[] {
	return referencedPaths.filter((filePath) => {
		if (filePath.startsWith(SUITESCRIPTS_PREFIX)) {
			return true;
		}

		objectImport.referencedFileImportResult.failedImports.push({
			path: filePath,
			message: translationService.getMessage(OBJECT.ERROR.INVALID_REFERENCED_FILE_PATH),
		});
		return false;
	});
}

function appendImportResults(importResults: ImportFileResult[], objectImport: ObjectImportResultItem): void {
	for (const importResult of importResults) {
		if (!importResult.path) {
			continue;
		}

		if (importResult.loaded) {
			objectImport.referencedFileImportResult.successfulImports.push({ path: importResult.path });
		} else {
			objectImport.referencedFileImportResult.failedImports.push({
				path: importResult.path,
				message: importResult.message,
			});
		}
	}
}
