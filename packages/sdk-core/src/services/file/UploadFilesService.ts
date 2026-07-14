/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { randomBytes } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

import {
	FILE_COMMAND_STATUS,
	type FileCommandOperationResult,
	type UploadFilesExecutionInput,
} from '../../api/file/FileCommand';
import {
	assertRealPathWithin,
	PathOutsideRootError,
	resolveSuiteCloudPath,
} from '../project/ProjectPathResolver';
import { FILE } from '../translation/TranslationKeys';
import { translationService } from '../translation/TranslationService';
import {
	getHttpErrorMessage,
	sendFileCommandRequest,
	type FileCommandHttpResponse,
} from './FileCommandClient';

const FILE_CABINET_UPLOAD_ENDPOINT_PATH = '/app/suiteapp/devframework/fileupload/filecabinetupload.nl';
const FILE_CABINET_ROOT_FOLDER = 'FileCabinet';
const HEADER_USER_AGENT = 'User-Agent';
const HEADER_ACCEPT = 'Accept';
const HEADER_CONTENT_TYPE = 'Content-Type';
const HEADER_CONTENT_LENGTH = 'Content-Length';
const CONTENT_TYPE_JSON = 'application/json';
const CONTENT_TYPE_MULTIPART_PREFIX = 'multipart/form-data; boundary=';
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;
const MULTIPART_EOL = '\r\n';
const UPLOAD_MULTIPART_FILE_FIELD_NAME = 'file';
const FILE_CABINET_UPLOAD_QUERY_PARENT_FOLDER = 'parentFolder';
const UPLOAD_RESULT_TYPE_SUCCESS = 'SUCCESS';
const UPLOAD_RESULT_TYPE_ERROR = 'ERROR';

export async function executeUploadFiles(input: UploadFilesExecutionInput): Promise<FileCommandOperationResult> {
	if (!Array.isArray(input.filePaths) || input.filePaths.length === 0) {
		return errorResultWithMessage(translationService.getMessage(FILE.ERROR.UPLOAD_FILE_PATHS_REQUIRED));
	}

	try {
		const uploadResults: Array<{ file: { path: string }; type: string; errorMessage?: string }> = [];
		const fileCabinetRoot = join(input.projectFolder, FILE_CABINET_ROOT_FOLDER);
		for (const filePath of input.filePaths) {
			const localFilePath = resolveSuiteCloudPath(fileCabinetRoot, filePath);
			const uploadResult = await uploadSingleFile(
				input,
				getParentFolderPath(filePath),
				localFilePath,
				fileCabinetRoot
			);
			if (uploadResult.status === FILE_COMMAND_STATUS.ERROR) {
				return uploadResult;
			}
			uploadResults.push(uploadResult.data as { file: { path: string }; type: string; errorMessage?: string });
		}

		return {
			status: FILE_COMMAND_STATUS.SUCCESS,
			data: uploadResults,
			resultMessage: translationService.getMessage(FILE.INFO.UPLOAD_COMPLETED),
		};
	} catch (error: unknown) {
		return errorResultWithMessage(toErrorMessage(error));
	}
}

async function uploadSingleFile(
	input: UploadFilesExecutionInput,
	parentFolderPath: string,
	localFilePath: string,
	fileCabinetRoot: string
): Promise<FileCommandOperationResult> {
	let localFileStats;
	try {
		localFileStats = await stat(localFilePath);
	} catch (error: unknown) {
		if (!isMissingPathError(error)) {
			throw error;
		}
		return {
			status: FILE_COMMAND_STATUS.SUCCESS,
			data: {
				file: { path: localFilePath },
				type: UPLOAD_RESULT_TYPE_ERROR,
				errorMessage: translationService.getMessage(
					FILE.ERROR.LOCAL_PATH_NOT_FOUND,
					parentFolderPath,
					basename(localFilePath)
				),
			},
		};
	}
	if (!localFileStats.isFile()) {
		return errorResultWithMessage(translationService.getMessage(FILE.ERROR.UPLOAD_DIRECTORY));
	}

	const canonicalLocalFilePath = await assertRealPathWithin(fileCabinetRoot, localFilePath);
	const fileBuffer = await readFile(canonicalLocalFilePath);
	const boundary = `suitecloudboundary${randomBytes(10).toString('hex')}`;
	const multipartBody = buildUploadMultipartBody(boundary, basename(localFilePath), fileBuffer);
	const query = new URLSearchParams({ [FILE_CABINET_UPLOAD_QUERY_PARENT_FOLDER]: parentFolderPath });
	const response = await sendFileCommandRequest({
		hostName: input.hostName,
		accessToken: input.accessToken,
		method: 'POST',
		path: `${FILE_CABINET_UPLOAD_ENDPOINT_PATH}?${query.toString()}`,
		headers: {
			[HEADER_ACCEPT]: CONTENT_TYPE_JSON,
			[HEADER_CONTENT_TYPE]: `${CONTENT_TYPE_MULTIPART_PREFIX}${boundary}`,
			[HEADER_CONTENT_LENGTH]: String(multipartBody.length),
			...(input.userAgent ? { [HEADER_USER_AGENT]: input.userAgent } : {}),
		},
		body: multipartBody,
		timeoutMs: input.timeoutMs ?? DEFAULT_TIMEOUT_MS,
	});

	if (response.statusCode === 401 || response.statusCode === 403) {
		return {
			status: FILE_COMMAND_STATUS.ERROR,
			httpStatusCode: response.statusCode,
			errorMessages: [getHttpErrorMessage(response)],
		};
	}

	const parsedResponse = parseUploadResponse(response);
	return {
		status: FILE_COMMAND_STATUS.SUCCESS,
		data: parsedResponse.errorMessage
			? { file: { path: localFilePath }, type: UPLOAD_RESULT_TYPE_ERROR, errorMessage: parsedResponse.errorMessage }
			: { file: { path: localFilePath }, type: UPLOAD_RESULT_TYPE_SUCCESS },
	};
}

function parseUploadResponse(response: FileCommandHttpResponse): { errorMessage?: string } {
	if (response.statusCode < 200 || response.statusCode >= 300) {
		return { errorMessage: getHttpErrorMessage(response) };
	}
	const responseText = response.body.toString('utf8').trim();
	if (!responseText) {
		return {};
	}
	try {
		const parsedResponse = JSON.parse(responseText);
		return parsedResponse?.error && typeof parsedResponse.error.message === 'string'
			? { errorMessage: parsedResponse.error.message }
			: {};
	} catch {
		return { errorMessage: responseText };
	}
}

function buildUploadMultipartBody(boundary: string, filename: string, fileBuffer: Buffer): Buffer {
	return Buffer.concat([
		Buffer.from(`--${boundary}${MULTIPART_EOL}`),
		Buffer.from(
			`Content-Disposition: form-data; name="${UPLOAD_MULTIPART_FILE_FIELD_NAME}"; filename="${filename}"${MULTIPART_EOL}` +
				`Content-Type: application/octet-stream${MULTIPART_EOL}${MULTIPART_EOL}`
		),
		fileBuffer,
		Buffer.from(`${MULTIPART_EOL}--${boundary}--${MULTIPART_EOL}`),
	]);
}

function getParentFolderPath(filePath: string): string {
	const parentPath = dirname(filePath.replace(/\\/g, '/').trim()).replace(/\\/g, '/');
	return parentPath === '.' ? '/' : parentPath;
}

function errorResultWithMessage(errorMessage: string): FileCommandOperationResult {
	return { status: FILE_COMMAND_STATUS.ERROR, errorMessages: [errorMessage] };
}

function toErrorMessage(error: unknown): string {
	if (error instanceof PathOutsideRootError) {
		return translationService.getMessage(FILE.ERROR.PATH_OUTSIDE_FILE_CABINET, error.candidatePath);
	}
	return error instanceof Error ? error.message : String(error);
}

function isMissingPathError(error: unknown): boolean {
	return !!error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT';
}
