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
	OBJECT_COMMAND_STATUS,
	type CustomObjectInfo,
	type ImportObjectsExecutionInput,
	type ImportObjectsResult,
	type ListObjectsExecutionInput,
	type ObjectCommandAuthInput,
	type ObjectCommandOperationResult,
	type ObjectImportResultItem,
} from '../../api/object/ObjectCommand';
import { executeImportFiles } from '../file/FileCommandService';
import { extractZipArchive } from '../archive/ArchiveService';
import {
	assertCreatablePathWithin,
	assertPathWithin,
	PathOutsideRootError,
} from '../project/ProjectPathResolver';
import { isSuiteAppProject } from '../project/ProjectManifestService';
import {
	getHttpErrorMessage,
	isIdeLikeResponse,
	sendFormRequest,
} from './ObjectCommandClient';
import {
	copyDirectoryContents,
	findObjectFileByScriptId,
	readOptionalFile,
	removeDirectory,
} from './SdfObjectService';
import {
	buildCustomObjectsXml,
	extractImportObjectsResult,
	extractScriptFileReferences,
	parseCustomObjectListXml,
	parseIdePayload,
	parseImportObjectStatus,
	uniqueCustomObjects,
} from './ObjectXmlService';

export * from '../../api/object/ObjectCommand';
export {
	executeUpdateCustomRecordWithInstances,
	executeUpdateObjects,
} from './ObjectUpdateService';

const IDE_ENDPOINT_PATH = '/app/ide/ide.nl';
const OBJECTS_FOLDER_NAME = 'Objects';
const STATUS_XML_FILENAME = 'status.xml';
const ACTION_FETCH_CUSTOM_OBJECT_LIST = 'FetchCustomObjectList';
const ACTION_FETCH_CUSTOM_OBJECT_XML = 'FetchCustomObjectXml';
const IDE_ACTION_KEY = 'action';
const IDE_PARAM_PACKAGE_ROOT = 'package_root';
const IDE_PARAM_OBJECT_TYPE = 'object_type';
const IDE_PARAM_SCRIPT_ID_CONTAINS = 'scriptid_contains';
const IDE_PARAM_CUSTOM_OBJECTS = 'custom_objects';
const SDF_ACTION_LIST_OBJECTS = 'listobjects';
const SDF_ACTION_IMPORT_OBJECTS = 'importobjects';
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;
const ALL_LITERAL = 'ALL';
const CUSTOM_SEGMENT_PREFIX = 'customsegment';
const SUITESCRIPTS_PREFIX = '/SuiteScripts/';
const INVALID_REFERENCED_FILE_PATH_MESSAGE = 'The file path is invalid or not supported.';
const NO_OBJECTS_IMPORTED_MESSAGE = 'No objects imported.';

export async function executeListObjects(
	input: ListObjectsExecutionInput
): Promise<ObjectCommandOperationResult<CustomObjectInfo[]>> {
	try {
		validateAuthInput(input);

		const requestParams: Record<string, string | string[]> = {
			[IDE_ACTION_KEY]: ACTION_FETCH_CUSTOM_OBJECT_LIST,
		};

		if (input.appId && input.appId.trim()) {
			requestParams[IDE_PARAM_PACKAGE_ROOT] = input.appId.trim().toLowerCase();
		}
		if (input.scriptIdContains && input.scriptIdContains.trim()) {
			requestParams[IDE_PARAM_SCRIPT_ID_CONTAINS] = input.scriptIdContains.trim().toLowerCase();
		}
		if (Array.isArray(input.objectTypes) && input.objectTypes.length > 0) {
			requestParams[IDE_PARAM_OBJECT_TYPE] = input.objectTypes
				.filter((type) => typeof type === 'string' && type.trim())
				.map((type) => type.trim().toLowerCase());
		}

		const response = await sendFormRequest({
			hostName: input.hostName,
			accessToken: input.accessToken,
			path: IDE_ENDPOINT_PATH,
			actionName: SDF_ACTION_LIST_OBJECTS,
			params: requestParams,
			userAgent: input.userAgent,
			timeoutMs: input.timeoutMs ?? DEFAULT_TIMEOUT_MS,
		});

		if (response.statusCode === 401 || response.statusCode === 403) {
			return errorResultWithMessage(getHttpErrorMessage(response), response.statusCode);
		}
		if (response.statusCode < 200 || response.statusCode >= 300) {
			return errorResultWithMessage(getHttpErrorMessage(response), response.statusCode);
		}

		const responseText = response.body.toString('utf8');
		const idePayload = await parseIdePayload(responseText);
		if (idePayload.errorMessage) {
			return errorResultWithMessage(idePayload.errorMessage, response.statusCode);
		}

		const objects = idePayload.resultText ? await parseCustomObjectListXml(idePayload.resultText) : [];

		return {
			status: OBJECT_COMMAND_STATUS.SUCCESS,
			data: objects,
		};
	} catch (error: unknown) {
		return errorResultWithMessage(toErrorMessage(error), extractStatusCode(error));
	}
}

export async function executeImportObjects(
	input: ImportObjectsExecutionInput
): Promise<ObjectCommandOperationResult<ImportObjectsResult>> {
	let tempDirectory: string | undefined;
	try {
		validateAuthInput(input);
		if (!input.projectFolder) {
			return errorResultWithMessage(
				'A project folder is required for object import.',
				undefined
			);
		}
		if (!input.targetFolder) {
			return errorResultWithMessage(
				'A destination folder is required for object import.',
				undefined
			);
		}
		const objectsFolder = join(input.projectFolder, OBJECTS_FOLDER_NAME);
		const unresolvedTargetFolder = assertPathWithin(objectsFolder, input.targetFolder);
		const targetFolder = await assertCreatablePathWithin(input.projectFolder, unresolvedTargetFolder);

		const scriptIds = normalizeScriptIds(input.scriptIds);
		if (scriptIds.length === 0) {
			return {
				status: OBJECT_COMMAND_STATUS.SUCCESS,
				data: buildEmptyImportObjectsResult(),
				resultMessage: NO_OBJECTS_IMPORTED_MESSAGE,
			};
		}

		const customObjectsToImport = await resolveObjectsToImport(input, scriptIds);
		if (customObjectsToImport.length === 0) {
			return {
				status: OBJECT_COMMAND_STATUS.SUCCESS,
				data: buildEmptyImportObjectsResult(),
				resultMessage: NO_OBJECTS_IMPORTED_MESSAGE,
			};
		}

		const response = await sendFormRequest({
			hostName: input.hostName,
			accessToken: input.accessToken,
			path: IDE_ENDPOINT_PATH,
			actionName: SDF_ACTION_IMPORT_OBJECTS,
			params: {
				[IDE_ACTION_KEY]: ACTION_FETCH_CUSTOM_OBJECT_XML,
				[IDE_PARAM_CUSTOM_OBJECTS]: buildCustomObjectsXml(customObjectsToImport),
			},
			userAgent: input.userAgent,
			timeoutMs: input.timeoutMs ?? DEFAULT_TIMEOUT_MS,
		});

		if (response.statusCode === 401 || response.statusCode === 403) {
			return errorResultWithMessage(getHttpErrorMessage(response), response.statusCode);
		}
		if (response.statusCode < 200 || response.statusCode >= 300) {
			return errorResultWithMessage(getHttpErrorMessage(response), response.statusCode);
		}

		const responseText = response.body.toString('utf8');
		if (isIdeLikeResponse(response, responseText)) {
			const idePayload = await parseIdePayload(responseText);
			if (idePayload.errorMessage) {
				return errorResultWithMessage(idePayload.errorMessage, response.statusCode);
			}
			return {
				status: OBJECT_COMMAND_STATUS.SUCCESS,
				data: buildEmptyImportObjectsResult(),
				resultMessage: NO_OBJECTS_IMPORTED_MESSAGE,
			};
		}

		tempDirectory = await mkdtemp(join(tmpdir(), 'suitecloud-import-objects-'));
		const zipFilePath = join(tempDirectory, `importobjects-${Date.now()}-${randomBytes(4).toString('hex')}.zip`);
		const unzipFolder = join(tempDirectory, 'unzipped');
		await writeFile(zipFilePath, response.body);
		await mkdir(unzipFolder, { recursive: true });
		await unzipArchive(zipFilePath, unzipFolder);

		const statusFilePath = join(unzipFolder, STATUS_XML_FILENAME);
		const statusXml = await readOptionalFile(statusFilePath);
		if (!statusXml) {
			return errorResultWithMessage(
				'Unable to recognize the response from server.',
				undefined
			);
		}

		await rm(statusFilePath, { force: true });
		await mkdir(targetFolder, { recursive: true });
		await copyDirectoryContents(unzipFolder, targetFolder);

		const importStatusItems = await parseImportObjectStatus(statusXml);
		const importResult = extractImportObjectsResult(importStatusItems);

		const canImportReferencedFiles = !input.excludeFiles && !(await isSuiteAppProject(input.projectFolder));
		if (canImportReferencedFiles) {
			const referencedFilesResult = await enrichReferencedFileImports(
				{ ...input, targetFolder },
				importResult.successfulImports
			);
			if (referencedFilesResult.status === OBJECT_COMMAND_STATUS.ERROR) {
				return referencedFilesResult;
			}
		}

		return {
			status: OBJECT_COMMAND_STATUS.SUCCESS,
			data: importResult,
		};
	} catch (error: unknown) {
		return errorResultWithMessage(toErrorMessage(error), extractStatusCode(error));
	} finally {
		if (tempDirectory) {
			await removeDirectory(tempDirectory);
		}
	}
}

async function resolveObjectsToImport(
	input: ImportObjectsExecutionInput,
	scriptIds: string[]
): Promise<CustomObjectInfo[]> {
	if (scriptIds.includes(ALL_LITERAL)) {
		const listResult = await executeListObjects({
			hostName: input.hostName,
			accessToken: input.accessToken,
			appId: input.appId,
			objectTypes: normalizeObjectTypeFilter(input.objectType),
			userAgent: input.userAgent,
			timeoutMs: input.timeoutMs,
		});
		if (listResult.status === OBJECT_COMMAND_STATUS.ERROR) {
			throw new Error(
				listResult.errorMessages?.[0] ??
					'Unable to list custom objects.'
			);
		}
		return (listResult.data ?? []).map((item) => ({ type: item.type, scriptId: item.scriptId, appId: item.appId }));
	}

	if (typeof input.objectType === 'string' && input.objectType.toUpperCase() !== ALL_LITERAL) {
		return scriptIds.map((scriptId) => ({
			type: input.objectType.toLowerCase(),
			scriptId,
			appId: input.appId,
		}));
	}

	const resolvedObjects: CustomObjectInfo[] = [];
	for (const scriptId of scriptIds) {
		const listResult = await executeListObjects({
			hostName: input.hostName,
			accessToken: input.accessToken,
			appId: input.appId,
			scriptIdContains: scriptId,
			userAgent: input.userAgent,
			timeoutMs: input.timeoutMs,
		});
		if (listResult.status === OBJECT_COMMAND_STATUS.ERROR) {
			throw new Error(
				listResult.errorMessages?.[0] ??
					'Unable to list custom objects.'
			);
		}

		const exactObject = (listResult.data ?? []).find((item) => item.scriptId === scriptId);
		if (exactObject) {
			resolvedObjects.push(exactObject);
		}
	}

	return uniqueCustomObjects(resolvedObjects);
}

function normalizeObjectTypeFilter(objectType: string | undefined): string[] | undefined {
	if (!objectType) {
		return undefined;
	}
	const normalized = objectType.trim();
	if (!normalized || normalized.toUpperCase() === ALL_LITERAL) {
		return undefined;
	}
	return [normalized.toLowerCase()];
}

function normalizeScriptIds(scriptIds: string[] | undefined): string[] {
	if (!Array.isArray(scriptIds)) {
		return [];
	}
	return scriptIds
		.map((scriptId) => String(scriptId).trim())
		.filter(Boolean)
		.filter((scriptId, index, array) => array.indexOf(scriptId) === index);
}

async function enrichReferencedFileImports(
	input: ImportObjectsExecutionInput,
	successfulObjectImports: ObjectImportResultItem[]
): Promise<ObjectCommandOperationResult<ImportObjectsResult>> {
	for (const objectImport of successfulObjectImports) {
		const scriptId = objectImport.customObject.id;
		const objectFile = await findObjectFileByScriptId(input.projectFolder, scriptId, input.targetFolder);
		if (!objectFile) {
			continue;
		}

		const objectContents = await readFile(objectFile, 'utf8');
		const scriptFilePaths = extractScriptFileReferences(objectContents);
		if (scriptFilePaths.length === 0) {
			continue;
		}

		const validPaths: string[] = [];
		for (const scriptFilePath of scriptFilePaths) {
			if (!scriptFilePath.startsWith(SUITESCRIPTS_PREFIX)) {
				objectImport.referencedFileImportResult.failedImports.push({
					path: scriptFilePath,
					message: INVALID_REFERENCED_FILE_PATH_MESSAGE,
				});
				continue;
			}
			validPaths.push(scriptFilePath);
		}

		if (validPaths.length === 0) {
			continue;
		}

		const importFilesResult = await executeImportFiles({
			hostName: input.hostName,
			accessToken: input.accessToken,
			projectFolder: input.projectFolder,
			filePaths: validPaths,
			excludeProperties: false,
			userAgent: input.userAgent,
			timeoutMs: input.timeoutMs,
		});

		if (importFilesResult.status === 'ERROR') {
			return {
				status: OBJECT_COMMAND_STATUS.ERROR,
				httpStatusCode: importFilesResult.httpStatusCode,
				errorMessages: importFilesResult.errorMessages,
			};
		}

		const importFileItems = asArray(
			importFilesResult.data as Record<string, unknown> | Record<string, unknown>[] | undefined
		);
		for (const rawImportFileItem of importFileItems) {
			const importFileItem = rawImportFileItem as {
				file?: { path?: unknown };
				path?: unknown;
				type?: unknown;
				loaded?: unknown;
				errorMessage?: unknown;
				message?: unknown;
			};
			const filePath = stringOrUndefined(importFileItem?.file?.path) ?? stringOrUndefined(importFileItem?.path);
			if (!filePath) {
				continue;
			}
			if (importFileItem?.type === 'SUCCESS' || importFileItem?.loaded === true) {
				objectImport.referencedFileImportResult.successfulImports.push({ path: filePath });
			} else {
				objectImport.referencedFileImportResult.failedImports.push({
					path: filePath,
					message: stringOrUndefined(importFileItem?.errorMessage) ?? stringOrUndefined(importFileItem?.message),
				});
			}
		}
	}

	return {
		status: OBJECT_COMMAND_STATUS.SUCCESS,
	};
}

async function unzipArchive(zipFilePath: string, destinationFolder: string): Promise<void> {
	await extractZipArchive(zipFilePath, destinationFolder);
}

function validateAuthInput(input: ObjectCommandAuthInput): void {
	if (!input.hostName) {
		throw new Error('A target host is required for object command execution.');
	}
	if (!input.accessToken) {
		throw new Error('An access token is required for object command execution.');
	}
}

function errorResultWithMessage<T = unknown>(
	message: string,
	statusCode: number | undefined
): ObjectCommandOperationResult<T> {
	return {
		status: OBJECT_COMMAND_STATUS.ERROR,
		httpStatusCode: statusCode,
		errorMessages: [message],
	};
}

function toErrorMessage(error: unknown): string {
	if (error instanceof PathOutsideRootError) {
		return 'Objects must be placed under the Objects folder or any of its subfolders.';
	}
	if (error instanceof Error) {
		return error.message;
	}
	return String(error);
}

function extractStatusCode(error: unknown): number | undefined {
	if (isObject(error) && typeof (error as { statusCode?: unknown }).statusCode === 'number') {
		return (error as { statusCode: number }).statusCode;
	}
	return undefined;
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function stringOrUndefined(value: unknown): string | undefined {
	if (typeof value !== 'string') {
		return undefined;
	}
	return value;
}

function asArray<T>(value: T | T[] | undefined | null): T[] {
	if (Array.isArray(value)) {
		return value;
	}
	return value === undefined || value === null ? [] : [value];
}

function buildEmptyImportObjectsResult(): ImportObjectsResult {
	return {
		successfulImports: [],
		failedImports: [],
	};
}
