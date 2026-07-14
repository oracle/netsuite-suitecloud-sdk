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
	type FileCommandAuthInput,
	type FileCommandOperationResult,
	type ImportFilesExecutionInput,
	type ListFilesExecutionInput,
	type ListFoldersExecutionInput,
} from '../../api/file/FileCommand';
import { extractZipArchive } from '../archive/ArchiveService';
import {
	isSuiteCloudPathWithinRoot,
	PathOutsideRootError,
} from '../project/ProjectPathResolver';
import { copyImportedFiles } from './ProjectFileService';
import {
	getHttpErrorMessage,
	looksLikeIdeResponse,
	sendIdeRequest,
} from './FileCommandClient';
import {
	buildImportFilesXml,
	collectFiles,
	collectFolders,
	extractIdeErrorMessage,
	extractMediaXml,
	parseImportStatus,
	parseMediaFolders,
} from './FileXmlService';

export * from '../../api/file/FileCommand';
export { executeUploadFiles } from './UploadFilesService';

const IMPORT_FILES_STATUS_FILENAME = 'status.xml';
const IDE_ACTION_QUERY_FILE_STRUCTURE = 'ListFileStructure';
const IDE_ACTION_IMPORT_FILES = 'ImportFiles';
const SDF_ACTION_LIST_FILES = 'listfiles';
const SDF_ACTION_IMPORT_FILES = 'importfiles';
const IMPORT_UNEXPECTED_ERROR_MESSAGE = 'Some files could not be imported.\nThere was an error when communicating with the server. Try importing a different set of files. If the problem persists, contact customer support.';
const UNKNOWN_SERVER_RESPONSE_MESSAGE = 'Unable to recognize the response from server.';
const NO_FILES_FOUND_MESSAGE = 'No files found.';
const NO_FOLDERS_FOUND_MESSAGE = 'No folders found.';
const FILE_CABINET_PATH_TEMPLATES = '/Templates';
const ALLOWED_FILE_CABINET_PATHS = [
	'/SuiteScripts',
	'/Templates/E-mail Templates',
	'/Templates/Marketing Templates',
	'/Web Site Hosting Files',
] as const;
const LIST_FOLDERS_ROOTS = ['/SuiteScripts', '/Templates', '/Web Site Hosting Files'] as const;

export async function executeListFiles(input: ListFilesExecutionInput): Promise<FileCommandOperationResult> {
	if (!input.folderPath || !isValidFileCabinetPath(input.folderPath)) {
		return errorResultWithMessage(
			buildInvalidFileCabinetPathMessage(input.folderPath),
			undefined
		);
	}

	try {
		const fileList = await queryFileCabinetResources(input, input.folderPath, RESOURCE_KIND.FILE);
		const supportedFileList = fileList.filter(isValidFileCabinetPath);
		return {
			status: FILE_COMMAND_STATUS.SUCCESS,
			data: supportedFileList,
			resultMessage: supportedFileList.length ? '' : NO_FILES_FOUND_MESSAGE,
		};
	} catch (error: unknown) {
		const statusCode = extractStatusCode(error);
		if (statusCode === 401 || statusCode === 403) {
			return errorResultWithMessage(toErrorMessage(error), statusCode);
		}
		return {
			status: FILE_COMMAND_STATUS.SUCCESS,
			data: [],
			resultMessage: NO_FILES_FOUND_MESSAGE,
		};
	}
}

export async function executeListFolders(input: ListFoldersExecutionInput): Promise<FileCommandOperationResult> {
	try {
		const foldersByRoot = await Promise.all(
			LIST_FOLDERS_ROOTS.map((rootPath) => queryFileCabinetResources(input, rootPath, RESOURCE_KIND.FOLDER))
		);
		const folderList = foldersByRoot.flat().sort((left, right) => left.localeCompare(right));
		return {
			status: FILE_COMMAND_STATUS.SUCCESS,
			data: folderList,
			resultMessage: folderList.length ? '' : NO_FOLDERS_FOUND_MESSAGE,
		};
	} catch (error: unknown) {
		const statusCode = extractStatusCode(error);
		if (statusCode === 401 || statusCode === 403) {
			return errorResultWithMessage(toErrorMessage(error), statusCode);
		}
		return {
			status: FILE_COMMAND_STATUS.SUCCESS,
			data: [],
			resultMessage: NO_FOLDERS_FOUND_MESSAGE,
		};
	}
}

export async function executeImportFiles(input: ImportFilesExecutionInput): Promise<FileCommandOperationResult> {
	if (!Array.isArray(input.filePaths) || input.filePaths.length === 0) {
		return errorResultWithMessage(
			'Missing required file paths for file import.',
			undefined
		);
	}

	for (const filePath of input.filePaths) {
		if (!isValidFileCabinetPath(filePath)) {
			return errorResultWithMessage(buildInvalidFileCabinetPathMessage(filePath), undefined);
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
			return errorResultWithMessage(ideError ?? UNKNOWN_SERVER_RESPONSE_MESSAGE, importResponse.statusCode);
		}

		await writeFile(zipFilePath, importResponse.body);
		const unzipTargetFolder = join(tempDirectory, 'unzip');
		await mkdir(unzipTargetFolder, { recursive: true });
		await unzipArchive(zipFilePath, unzipTargetFolder);

		const statusFilePath = join(unzipTargetFolder, IMPORT_FILES_STATUS_FILENAME);
		const statusFileContents = await readOptionalFile(statusFilePath);
		if (!statusFileContents) {
			return errorResultWithMessage(IMPORT_UNEXPECTED_ERROR_MESSAGE, undefined);
		}

		const importStatus = await parseImportStatus(statusFileContents);
		await copyImportedFiles(unzipTargetFolder, input.projectFolder, importStatus.results);

		return {
			status: FILE_COMMAND_STATUS.SUCCESS,
			data: importStatus,
		};
	} catch (error: unknown) {
		return errorResultWithMessage(toErrorMessage(error), extractStatusCode(error));
	} finally {
		if (tempDirectory) {
			await removeDirectoryQuietly(tempDirectory);
		}
	}
}

const RESOURCE_KIND = {
	FILE: 'file',
	FOLDER: 'folder',
} as const;

type ResourceKind = (typeof RESOURCE_KIND)[keyof typeof RESOURCE_KIND];

async function queryFileCabinetResources(
	input: FileCommandAuthInput,
	folderPath: string,
	resourceKind: ResourceKind
): Promise<string[]> {
	const response = await sendIdeRequest(input, SDF_ACTION_LIST_FILES, IDE_ACTION_QUERY_FILE_STRUCTURE, {
		path: folderPath,
	});

	if (response.statusCode === 401 || response.statusCode === 403) {
		throw new HttpStatusError(response.statusCode, getHttpErrorMessage(response));
	}
	if (response.statusCode < 200 || response.statusCode >= 300) {
		throw new Error(getHttpErrorMessage(response));
	}

	const responseText = response.body.toString('utf8');
	if (!looksLikeIdeResponse(responseText)) {
		throw new Error(UNKNOWN_SERVER_RESPONSE_MESSAGE);
	}

	const ideError = await extractIdeErrorMessage(responseText);
	if (ideError && ideError.trim()) {
		throw new Error(ideError);
	}

	const mediaXml = await extractMediaXml(responseText);
	if (!mediaXml) {
		return [];
	}

	const folderTree = await parseMediaFolders(mediaXml);
	if (resourceKind === RESOURCE_KIND.FILE) {
		return collectFiles('', folderTree).sort((left, right) => left.localeCompare(right));
	}
	return collectFolders('', folderTree).sort((left, right) => left.localeCompare(right));
}

function normalizeFileCabinetPath(filePath: string): string {
	return filePath.replace(/\\/g, '/').trim();
}

async function unzipArchive(zipFilePath: string, destinationFolder: string): Promise<void> {
	try {
		await extractZipArchive(zipFilePath, destinationFolder);
	} catch (error: unknown) {
		throw new Error(
			`Unable to extract imported files: ${toErrorMessage(error)}`
		);
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

function isValidFileCabinetPath(fileCabinetPath: string): boolean {
	if (!fileCabinetPath) {
		return false;
	}
	const normalizedPath = normalizeFileCabinetPath(fileCabinetPath);
	if (normalizedPath === FILE_CABINET_PATH_TEMPLATES) {
		return true;
	}
	return ALLOWED_FILE_CABINET_PATHS.some((allowedPath) =>
		isSuiteCloudPathWithinRoot(normalizedPath, allowedPath)
	);
}

function buildInvalidFileCabinetPathMessage(fileCabinetPath: string): string {
	return `The "${fileCabinetPath}" path is invalid. The path can only start with: "${ALLOWED_FILE_CABINET_PATHS.join(',')}".`;
}

function errorResultWithMessage(errorMessage: string, httpStatusCode: number | undefined): FileCommandOperationResult {
	return {
		status: FILE_COMMAND_STATUS.ERROR,
		...(httpStatusCode ? { httpStatusCode } : {}),
		errorMessages: [errorMessage],
	};
}

function extractStatusCode(error: unknown): number | undefined {
	if (error instanceof HttpStatusError) {
		return error.statusCode;
	}
	return undefined;
}

function toErrorMessage(error: unknown): string {
	if (error instanceof PathOutsideRootError) {
		return `Invalid path "${error.candidatePath}". Path must remain inside the project's FileCabinet folder.`;
	}
	if (error instanceof Error) {
		return error.message;
	}
	return String(error);
}

class HttpStatusError extends Error {
	public readonly statusCode: number;

	constructor(statusCode: number, message: string) {
		super(message);
		this.statusCode = statusCode;
	}
}
