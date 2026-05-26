/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { Agent, request as httpsRequest, type RequestOptions } from 'node:https';
import { basename, dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { access, copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { execFile } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { promisify } from 'node:util';
import { parseStringPromise } from 'xml2js';

const execFileAsync = promisify(execFile);

export const FILE_COMMAND_STATUS = {
	SUCCESS: 'SUCCESS',
	ERROR: 'ERROR',
} as const;

type FileCommandStatus = (typeof FILE_COMMAND_STATUS)[keyof typeof FILE_COMMAND_STATUS];

export type FileCommandOperationResult = {
	status: FileCommandStatus;
	data?: unknown;
	resultMessage?: string;
	httpStatusCode?: number;
	errorMessages?: string[];
};

export type FileCommandAuthInput = {
	hostName: string;
	accessToken: string;
	userAgent?: string;
	timeoutMs?: number;
};

export type ListFilesExecutionInput = FileCommandAuthInput & {
	folderPath: string;
};

export type ListFoldersExecutionInput = FileCommandAuthInput;

export type ImportFilesExecutionInput = FileCommandAuthInput & {
	projectFolder: string;
	filePaths: string[];
	excludeProperties: boolean;
};

export type UploadFilesExecutionInput = FileCommandAuthInput & {
	projectFolder: string;
	filePaths: string[];
};

type FileCabinetFolderTree = {
	name: string;
	folders: FileCabinetFolderTree[];
	files: string[];
};

type HttpResponse = {
	statusCode: number;
	body: Buffer;
};

const IDE_ENDPOINT_PATH = '/app/ide/ide.nl';
const FILE_CABINET_UPLOAD_ENDPOINT_PATH = '/app/suiteapp/devframework/fileupload/filecabinetupload.nl';
const FILE_CABINET_ROOT_FOLDER = 'FileCabinet';
const IMPORT_FILES_STATUS_FILENAME = 'status.xml';
const IDE_ACTION_QUERY_FILE_STRUCTURE = 'ListFileStructure';
const IDE_ACTION_IMPORT_FILES = 'ImportFiles';
const SDF_ACTION_LIST_FILES = 'listfiles';
const SDF_ACTION_IMPORT_FILES = 'importfiles';
const HEADER_SDF_ACTION = 'Sdf-Action';
const HEADER_USER_AGENT = 'User-Agent';
const HEADER_AUTHORIZATION = 'Authorization';
const HEADER_ACCEPT = 'Accept';
const HEADER_CONTENT_TYPE = 'Content-Type';
const HEADER_CONTENT_LENGTH = 'Content-Length';
const CONTENT_TYPE_FORM_URLENCODED = 'application/x-www-form-urlencoded';
const CONTENT_TYPE_JSON = 'application/json';
const CONTENT_TYPE_MULTIPART_PREFIX = 'multipart/form-data; boundary=';
const VM_ENG_HOST_SUFFIX = 'vm.eng';
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;
const UNZIP_BINARY_NAME = 'unzip';
const MULTIPART_EOL = '\r\n';
const UPLOAD_MULTIPART_FILE_FIELD_NAME = 'file';
const FILE_CABINET_UPLOAD_QUERY_PARENT_FOLDER = 'parentFolder';
const UPLOAD_RESULT_TYPE_SUCCESS = 'SUCCESS';
const UPLOAD_RESULT_TYPE_ERROR = 'ERROR';
const IMPORT_UNEXPECTED_ERROR_MESSAGE =
	'Some files could not be imported.\nThere was an error when communicating with the server. Try importing a different set of files. If the problem persists, contact customer support.';
const UNKNOWN_SERVER_RESPONSE_MESSAGE = 'Unable to recognize the response from server.';
const NO_FILES_FOUND_MESSAGE = 'No files found.';
const NO_FOLDERS_FOUND_MESSAGE = 'No folders found.';
const UPLOAD_COMPLETED_MESSAGE = 'The uploading process has finished.';
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
		return errorResultWithMessage('Missing required file paths for file import.', undefined);
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

export async function executeUploadFiles(input: UploadFilesExecutionInput): Promise<FileCommandOperationResult> {
	if (!Array.isArray(input.filePaths) || input.filePaths.length === 0) {
		return errorResultWithMessage('Missing required file paths for file upload.', undefined);
	}

	try {
		const uploadResults: Array<{ file: { path: string }; type: string; errorMessage?: string }> = [];
		for (const filePath of input.filePaths) {
			const localFilePath = resolveLocalFileCabinetPath(input.projectFolder, filePath);
			const parentFolderPath = getParentFolderPath(filePath);
			const uploadResult = await uploadSingleFile(input, parentFolderPath, localFilePath);

			if (uploadResult.status === FILE_COMMAND_STATUS.ERROR) {
				return uploadResult;
			}

			uploadResults.push(uploadResult.data);
		}

		return {
			status: FILE_COMMAND_STATUS.SUCCESS,
			data: uploadResults,
			resultMessage: UPLOAD_COMPLETED_MESSAGE,
		};
	} catch (error: unknown) {
		return errorResultWithMessage(toErrorMessage(error), extractStatusCode(error));
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

async function uploadSingleFile(
	input: UploadFilesExecutionInput,
	parentFolderPath: string,
	localFilePath: string
): Promise<FileCommandOperationResult> {
	try {
		await access(localFilePath, fsConstants.F_OK);
	} catch (error: unknown) {
		return {
			status: FILE_COMMAND_STATUS.SUCCESS,
			data: {
				file: { path: localFilePath },
				type: UPLOAD_RESULT_TYPE_ERROR,
				errorMessage: `The "${parentFolderPath}/${basename(localFilePath)}" path does not exist.`,
			},
		};
	}

	const fileBuffer = await readFile(localFilePath);
	const boundary = `suitecloudboundary${randomBytes(10).toString('hex')}`;
	const multipartBody = buildUploadMultipartBody(boundary, basename(localFilePath), fileBuffer);

	const query = new URLSearchParams();
	query.set(FILE_CABINET_UPLOAD_QUERY_PARENT_FOLDER, parentFolderPath);
	const uploadPath = `${FILE_CABINET_UPLOAD_ENDPOINT_PATH}?${query.toString()}`;

	const response = await sendHttpRequest({
		hostName: input.hostName,
		accessToken: input.accessToken,
		method: 'POST',
		path: uploadPath,
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
		return errorResultWithMessage(getHttpErrorMessage(response), response.statusCode);
	}

	const parsedResponse = parseUploadResponse(response);
	if (parsedResponse.errorMessage) {
		return {
			status: FILE_COMMAND_STATUS.SUCCESS,
			data: {
				file: { path: localFilePath },
				type: UPLOAD_RESULT_TYPE_ERROR,
				errorMessage: parsedResponse.errorMessage,
			},
		};
	}

	return {
		status: FILE_COMMAND_STATUS.SUCCESS,
		data: {
			file: { path: localFilePath },
			type: UPLOAD_RESULT_TYPE_SUCCESS,
		},
	};
}

function parseUploadResponse(response: HttpResponse): { errorMessage?: string } {
	if (response.statusCode < 200 || response.statusCode >= 300) {
		return { errorMessage: getHttpErrorMessage(response) };
	}

	const responseText = response.body.toString('utf8').trim();
	if (!responseText) {
		return {};
	}

	try {
		const parsedResponse = JSON.parse(responseText);
		if (parsedResponse && parsedResponse.error && typeof parsedResponse.error.message === 'string') {
			return { errorMessage: parsedResponse.error.message };
		}
		return {};
	} catch (error: unknown) {
		return { errorMessage: responseText };
	}
}

function buildUploadMultipartBody(boundary: string, filename: string, fileBuffer: Buffer): Buffer {
	const parts: Buffer[] = [];
	parts.push(Buffer.from(`--${boundary}${MULTIPART_EOL}`));
	parts.push(
		Buffer.from(
			`Content-Disposition: form-data; name="${UPLOAD_MULTIPART_FILE_FIELD_NAME}"; filename="${filename}"${MULTIPART_EOL}` +
				`Content-Type: application/octet-stream${MULTIPART_EOL}${MULTIPART_EOL}`
		)
	);
	parts.push(fileBuffer);
	parts.push(Buffer.from(`${MULTIPART_EOL}--${boundary}--${MULTIPART_EOL}`));
	return Buffer.concat(parts);
}

function getParentFolderPath(filePath: string): string {
	const normalizedPath = normalizeFileCabinetPath(filePath);
	const parentPath = dirname(normalizedPath).replace(/\\/g, '/');
	return parentPath === '.' ? '/' : parentPath;
}

function resolveLocalFileCabinetPath(projectFolder: string, filePath: string): string {
	const normalizedPath = normalizeFileCabinetPath(filePath).replace(/^\/+/, '');
	return join(projectFolder, FILE_CABINET_ROOT_FOLDER, normalizedPath);
}

function normalizeFileCabinetPath(filePath: string): string {
	return filePath.replace(/\\/g, '/').trim();
}

function buildImportFilesXml(filePaths: string[], excludeProperties: boolean): string {
	const filesXml = filePaths
		.map((filePath) => {
			const escapedFilePath = escapeXml(filePath);
			return [
				'<file>',
				`<path>${escapedFilePath}</path>`,
				'<content>true</content>',
				`<attributes>${excludeProperties ? 'false' : 'true'}</attributes>`,
				'</file>',
			].join('');
		})
		.join('');

	return `<media><files>${filesXml}</files></media>`;
}

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

async function copyImportedFiles(
	unzipTargetFolder: string,
	projectFolder: string,
	results: Array<{ path: string; loaded: boolean; message: string }>
): Promise<void> {
	for (const result of results) {
		if (!result.loaded) {
			continue;
		}

		const normalizedRelativePath = normalizeFileCabinetPath(result.path).replace(/^\/+/, '');
		const sourceFilePath = join(unzipTargetFolder, FILE_CABINET_ROOT_FOLDER, normalizedRelativePath);
		const targetFilePath = join(projectFolder, FILE_CABINET_ROOT_FOLDER, normalizedRelativePath);

		await mkdir(dirname(targetFilePath), { recursive: true });
		await copyFile(sourceFilePath, targetFilePath);
	}
}

async function parseImportStatus(statusXml: string): Promise<{ results: Array<{ path: string; loaded: boolean; message: string }> }> {
	const parsedStatus = await parseStringPromise(statusXml, { explicitArray: false, trim: true });
	const resultNodes = ensureArray(parsedStatus?.status?.result);
	const results = resultNodes.map((resultNode) => ({
		path: asString(resultNode?.path),
		loaded: asBoolean(resultNode?.loaded),
		message: asString(resultNode?.message),
	}));
	return { results };
}

function asBoolean(value: unknown): boolean {
	if (typeof value === 'boolean') {
		return value;
	}
	if (typeof value === 'string') {
		return value.trim().toLowerCase() === 'true';
	}
	return false;
}

function collectFiles(parentPath: string, folders: FileCabinetFolderTree[]): string[] {
	const files: string[] = [];
	for (const folder of folders) {
		const folderPath = `${parentPath}/${folder.name}`;
		folder.files.forEach((fileName) => files.push(`${folderPath}/${fileName}`));
		files.push(...collectFiles(folderPath, folder.folders));
	}
	return files;
}

function collectFolders(parentPath: string, folders: FileCabinetFolderTree[]): string[] {
	const listOfFolders: string[] = [];
	for (const folder of folders) {
		const folderPath = `${parentPath}/${folder.name}`;
		listOfFolders.push(folderPath);
		listOfFolders.push(...collectFolders(folderPath, folder.folders));
	}
	return listOfFolders;
}

async function parseMediaFolders(mediaXml: string): Promise<FileCabinetFolderTree[]> {
	const parsedMedia = await parseStringPromise(mediaXml, { explicitArray: false, trim: true });
	const mediaFolders = ensureArray(parsedMedia?.media?.folder).map(normalizeFolderTree).filter((folder) => !!folder.name);
	return mediaFolders;
}

function normalizeFolderTree(folderNode: unknown): FileCabinetFolderTree {
	if (!isRecord(folderNode)) {
		return { name: '', folders: [], files: [] };
	}

	const name = asString(folderNode.name);
	const nestedFolders = ensureArray(folderNode.folder).map(normalizeFolderTree).filter((folder) => !!folder.name);
	const fileNames = ensureArray(folderNode.file)
		.map((fileNode) => (isRecord(fileNode) ? asString(fileNode.name) : ''))
		.filter((fileName) => !!fileName);

	return {
		name,
		folders: nestedFolders,
		files: fileNames,
	};
}

async function extractMediaXml(ideResponseXml: string): Promise<string | undefined> {
	const parsedIdeResponse = await parseStringPromise(ideResponseXml, { explicitArray: false, trim: true });
	const allStrings = collectStringValues(parsedIdeResponse);

	for (const stringValue of allStrings) {
		const value = stringValue.trim();
		if (value.includes('<media') && value.includes('</media>')) {
			return value;
		}
		if (value.includes('&lt;media') && value.includes('&lt;/media&gt;')) {
			return decodeXmlEntities(value);
		}
	}
	return undefined;
}

async function extractIdeErrorMessage(ideResponseXml: string): Promise<string | undefined> {
	const parsedIdeResponse = await parseStringPromise(ideResponseXml, { explicitArray: false, trim: true });
	const errorValue = asString(parsedIdeResponse?.ide?.error);
	if (errorValue && errorValue.trim()) {
		return decodeXmlEntities(errorValue.trim());
	}
	return undefined;
}

function collectStringValues(value: unknown): string[] {
	if (typeof value === 'string') {
		return [value];
	}
	if (Array.isArray(value)) {
		return value.flatMap((item) => collectStringValues(item));
	}
	if (isRecord(value)) {
		return Object.values(value).flatMap((item) => collectStringValues(item));
	}
	return [];
}

function decodeXmlEntities(value: string): string {
	return value
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'");
}

async function sendIdeRequest(
	input: FileCommandAuthInput,
	sdfAction: string,
	ideAction: string,
	params: Record<string, string>
): Promise<HttpResponse> {
	const requestParams = new URLSearchParams();
	requestParams.set('action', ideAction);
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null && value !== '') {
			requestParams.set(key, value);
		}
	}

	return sendHttpRequest({
		hostName: input.hostName,
		accessToken: input.accessToken,
		method: 'POST',
		path: IDE_ENDPOINT_PATH,
		headers: {
			[HEADER_CONTENT_TYPE]: CONTENT_TYPE_FORM_URLENCODED,
			[HEADER_ACCEPT]: 'text/xml',
			[HEADER_SDF_ACTION]: sdfAction,
			...(input.userAgent ? { [HEADER_USER_AGENT]: input.userAgent } : {}),
		},
		body: Buffer.from(requestParams.toString(), 'utf8'),
		timeoutMs: input.timeoutMs ?? DEFAULT_TIMEOUT_MS,
	});
}

async function sendHttpRequest(options: {
	hostName: string;
	accessToken: string;
	method: 'POST' | 'GET';
	path: string;
	headers: Record<string, string>;
	body?: Buffer;
	timeoutMs: number;
}): Promise<HttpResponse> {
	return new Promise((resolve, reject) => {
		const requestHeaders = {
			[HEADER_AUTHORIZATION]: `Bearer ${options.accessToken}`,
			...options.headers,
		};
		if (options.body && !requestHeaders[HEADER_CONTENT_LENGTH]) {
			requestHeaders[HEADER_CONTENT_LENGTH] = String(options.body.length);
		}

		const requestOptions: RequestOptions = {
			method: options.method,
			hostname: options.hostName,
			port: 443,
			path: options.path,
			headers: requestHeaders,
		};

		if (options.hostName.includes(VM_ENG_HOST_SUFFIX)) {
			requestOptions.agent = new Agent({ rejectUnauthorized: false });
		}

		const request = httpsRequest(requestOptions, (response) => {
			const responseChunks: Buffer[] = [];
			response.on('data', (chunk) => responseChunks.push(Buffer.from(chunk)));
			response.on('end', () => {
				resolve({
					statusCode: response.statusCode || 500,
					body: Buffer.concat(responseChunks),
				});
			});
		});

		request.on('error', reject);
		request.setTimeout(options.timeoutMs, () => {
			request.destroy(new Error('File command request timed out.'));
		});

		if (options.body) {
			request.write(options.body);
		}

		request.end();
	});
}

function getHttpErrorMessage(response: HttpResponse): string {
	const rawText = response.body.toString('utf8').trim();
	if (!rawText) {
		return `Request failed with status code ${response.statusCode}.`;
	}

	try {
		const parsedBody = JSON.parse(rawText);
		if (isRecord(parsedBody)) {
			const message = asString(parsedBody.message) || asString(parsedBody.detail) || asString(parsedBody.title);
			if (message) {
				return message;
			}
			const nestedErrorMessage = isRecord(parsedBody.error) ? asString(parsedBody.error.message) : undefined;
			if (nestedErrorMessage) {
				return nestedErrorMessage;
			}
		}
	} catch (error: unknown) {
		// Ignore JSON parsing errors and fallback to raw response text.
	}

	if (looksLikeIdeResponse(rawText)) {
		return UNKNOWN_SERVER_RESPONSE_MESSAGE;
	}

	return rawText;
}

function looksLikeIdeResponse(responseText: string): boolean {
	const normalizedText = responseText.trim();
	return normalizedText.startsWith('<ide>') || normalizedText.startsWith('<?xml');
}

async function unzipArchive(zipFilePath: string, destinationFolder: string): Promise<void> {
	try {
		await execFileAsync(UNZIP_BINARY_NAME, ['-o', zipFilePath, '-d', destinationFolder]);
	} catch (error: unknown) {
		throw new Error(
			`Unable to extract imported files. Verify "${UNZIP_BINARY_NAME}" is installed and available in PATH.`
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
	return ALLOWED_FILE_CABINET_PATHS.some((allowedPath) => normalizedPath.startsWith(allowedPath));
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

function ensureArray<T>(value: T | T[] | undefined): T[] {
	if (value === undefined) {
		return [];
	}
	return Array.isArray(value) ? value : [value];
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function asString(value: unknown): string {
	if (typeof value === 'string') {
		return value;
	}
	if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
		return value[0];
	}
	return '';
}
