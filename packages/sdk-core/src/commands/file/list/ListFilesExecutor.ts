/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import {
	FILE_COMMAND_STATUS,
	type FileCommandAuthInput,
	type FileCommandOperationResult,
	type ListFilesExecutionInput,
	type ListFoldersExecutionInput,
} from '../../../api/file/FileCommand';
import { FILE } from '../../../services/translation/TranslationKeys';
import { translationService } from '../../../services/translation/TranslationService';
import { getInvalidFileCabinetPathMessage, isValidFileCabinetPath } from '../FileCabinetPath';
import { getHttpErrorMessage, looksLikeIdeResponse, sendIdeRequest } from '../FileCommandClient';
import {
	collectFiles,
	collectFolders,
	extractIdeErrorMessage,
	extractMediaXml,
	parseMediaFolders,
} from '../FileCommandXml';

const IDE_ACTION_QUERY_FILE_STRUCTURE = 'ListFileStructure';
const SDF_ACTION_LIST_FILES = 'listfiles';
const LIST_FOLDERS_ROOTS = ['/SuiteScripts', '/Templates', '/Web Site Hosting Files'] as const;

const RESOURCE_KIND = {
	FILE: 'file',
	FOLDER: 'folder',
} as const;

type ResourceKind = (typeof RESOURCE_KIND)[keyof typeof RESOURCE_KIND];

export async function executeListFiles(input: ListFilesExecutionInput): Promise<FileCommandOperationResult> {
	if (!input.folderPath || !isValidFileCabinetPath(input.folderPath)) {
		return errorResult(getInvalidFileCabinetPathMessage(input.folderPath));
	}

	try {
		const fileList = await queryFileCabinetResources(input, input.folderPath, RESOURCE_KIND.FILE);
		const supportedFileList = fileList.filter(isValidFileCabinetPath);
		return {
			status: FILE_COMMAND_STATUS.SUCCESS,
			data: supportedFileList,
			resultMessage: supportedFileList.length ? '' : translationService.getMessage(FILE.INFO.NO_FILES_FOUND),
		};
	} catch (error: unknown) {
		if (error instanceof HttpStatusError && (error.statusCode === 401 || error.statusCode === 403)) {
			return errorResult(error.message, error.statusCode);
		}
		return {
			status: FILE_COMMAND_STATUS.SUCCESS,
			data: [],
			resultMessage: translationService.getMessage(FILE.INFO.NO_FILES_FOUND),
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
			resultMessage: folderList.length ? '' : translationService.getMessage(FILE.INFO.NO_FOLDERS_FOUND),
		};
	} catch (error: unknown) {
		if (error instanceof HttpStatusError && (error.statusCode === 401 || error.statusCode === 403)) {
			return errorResult(error.message, error.statusCode);
		}
		return {
			status: FILE_COMMAND_STATUS.SUCCESS,
			data: [],
			resultMessage: translationService.getMessage(FILE.INFO.NO_FOLDERS_FOUND),
		};
	}
}

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
		throw new Error(translationService.getMessage(FILE.ERROR.UNKNOWN_SERVER_RESPONSE));
	}

	const ideError = await extractIdeErrorMessage(responseText);
	if (ideError?.trim()) {
		throw new Error(ideError);
	}

	const mediaXml = await extractMediaXml(responseText);
	if (!mediaXml) {
		return [];
	}

	const folderTree = await parseMediaFolders(mediaXml);
	const resources = resourceKind === RESOURCE_KIND.FILE
		? collectFiles('', folderTree)
		: collectFolders('', folderTree);
	return resources.sort((left, right) => left.localeCompare(right));
}

function errorResult(errorMessage: string, httpStatusCode?: number): FileCommandOperationResult {
	return {
		status: FILE_COMMAND_STATUS.ERROR,
		...(httpStatusCode ? { httpStatusCode } : {}),
		errorMessages: [errorMessage],
	};
}

class HttpStatusError extends Error {
	constructor(public readonly statusCode: number, message: string) {
		super(message);
	}
}
