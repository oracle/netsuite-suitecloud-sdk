/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import {
	FILE_COMMAND_STATUS,
	type ImportFilesOperationResult,
	type ImportFilesExecutionInput,
} from '../../../api/file/FileCommand';
import { extractZipArchive } from '../../../services/archive/ZipArchive';
import { PathOutsideRootError } from '../../../services/project/ProjectPathResolver';
import { FILE } from '../../../services/translation/TranslationKeys';
import { translationService } from '../../../services/translation/TranslationService';
import { getInvalidFileCabinetPathMessage, isValidImportFileCabinetPath } from '../FileCabinetPath';
import { getHttpErrorMessage, looksLikeIdeResponse, sendIdeRequest } from '../FileCommandClient';
import {
	buildImportFilesXml,
	extractIdeErrorMessage,
	parseImportStatus,
} from '../FileCommandXml';
import { copyImportedFiles } from './ImportedFilesWriter';

const IMPORT_FILES_STATUS_FILENAME = 'status.xml';
const IDE_ACTION_IMPORT_FILES = 'ImportFiles';
const SDF_ACTION_IMPORT_FILES = 'importfiles';

export async function executeImportFiles(input: ImportFilesExecutionInput): Promise<ImportFilesOperationResult> {
	if (!Array.isArray(input.filePaths) || input.filePaths.length === 0) {
		return errorResultWithMessage(translationService.getMessage(FILE.ERROR.IMPORT_FILE_PATHS_REQUIRED), undefined);
	}

	for (const filePath of input.filePaths) {
		if (!isValidImportFileCabinetPath(filePath, input.allowSuiteAppPaths)) {
			return errorResultWithMessage(getInvalidFileCabinetPathMessage(filePath, input.allowSuiteAppPaths), undefined);
		}
	}

	let tempDirectory: string | undefined;

	try {
		tempDirectory = await mkdtemp(join(tmpdir(), 'suitecloud-import-files-'));
		const zipFilePath = join(tempDirectory, `importfiles-${Date.now()}-${randomBytes(4).toString('hex')}.zip`);

		const importResponse = await sendIdeRequest(input, SDF_ACTION_IMPORT_FILES, IDE_ACTION_IMPORT_FILES, {
			files: buildImportFilesXml(input.filePaths, input.excludeProperties),
		});

		if (importResponse.statusCode === 401 || importResponse.statusCode === 403) {
			return errorResultWithMessage(getHttpErrorMessage(importResponse), importResponse.statusCode);
		}
		if (importResponse.statusCode < 200 || importResponse.statusCode >= 300) {
			return errorResultWithMessage(getHttpErrorMessage(importResponse), importResponse.statusCode);
		}

		const responseText = importResponse.body.toString('utf8');
		if (looksLikeIdeResponse(responseText)) {
			const ideError = await extractIdeErrorMessage(responseText);
			return errorResultWithMessage(
				ideError ?? translationService.getMessage(FILE.ERROR.UNKNOWN_SERVER_RESPONSE),
				importResponse.statusCode
			);
		}

		await writeFile(zipFilePath, importResponse.body);
		const unzipTargetFolder = join(tempDirectory, 'unzip');
		await mkdir(unzipTargetFolder, { recursive: true });
		await unzipArchive(zipFilePath, unzipTargetFolder);

		const statusFilePath = join(unzipTargetFolder, IMPORT_FILES_STATUS_FILENAME);
		const statusFileContents = await readOptionalFile(statusFilePath);
		if (!statusFileContents) {
			return errorResultWithMessage(translationService.getMessage(FILE.WARNING.IMPORT_UNEXPECTED_ERROR), undefined);
		}

		const importStatus = await parseImportStatus(statusFileContents);
		await copyImportedFiles(unzipTargetFolder, input.projectFolder, importStatus.results);

		return {
			status: FILE_COMMAND_STATUS.SUCCESS,
			data: importStatus,
		};
	} catch (error: unknown) {
		return errorResultWithMessage(toErrorMessage(error), undefined);
	} finally {
		if (tempDirectory) {
			await removeDirectoryQuietly(tempDirectory);
		}
	}
}

async function unzipArchive(zipFilePath: string, destinationFolder: string): Promise<void> {
	try {
		await extractZipArchive(zipFilePath, destinationFolder);
	} catch (error: unknown) {
		throw new Error(translationService.getMessage(FILE.ERROR.UNZIP_IMPORT_FAILED, toErrorMessage(error)));
	}
}

async function readOptionalFile(filePath: string): Promise<string | undefined> {
	try {
		return await readFile(filePath, 'utf8');
	} catch (error: unknown) {
		return undefined;
	}
}

async function removeDirectoryQuietly(directoryPath: string): Promise<void> {
	try {
		await rm(directoryPath, { recursive: true, force: true });
	} catch (error: unknown) {
		// Temp cleanup errors are non-fatal.
	}
}

function errorResultWithMessage(errorMessage: string, httpStatusCode: number | undefined): ImportFilesOperationResult {
	return {
		status: FILE_COMMAND_STATUS.ERROR,
		...(httpStatusCode ? { httpStatusCode } : {}),
		errorMessages: [errorMessage],
	};
}

function toErrorMessage(error: unknown): string {
	if (error instanceof PathOutsideRootError) {
		return translationService.getMessage(FILE.ERROR.PATH_OUTSIDE_FILE_CABINET, error.candidatePath);
	}
	if (error instanceof Error) {
		return error.message;
	}
	return String(error);
}
