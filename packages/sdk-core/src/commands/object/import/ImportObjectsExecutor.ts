/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';

import {
	OBJECT_COMMAND_STATUS,
	type CustomObjectInfo,
	type ImportObjectsExecutionInput,
	type ImportObjectsResult,
	type ObjectCommandOperationResult,
} from '../../../api/object/ObjectCommand';
import { extractZipArchive } from '../../../services/archive/ZipArchive';
import {
	assertCreatablePathWithin,
	assertPathWithin,
	PathOutsideRootError,
} from '../../../services/project/ProjectPathResolver';
import { isSuiteAppProject } from '../../../services/project/ProjectManifestService';
import { OBJECT } from '../../../services/translation/TranslationKeys';
import { translationService } from '../../../services/translation/TranslationService';
import {
	getHttpErrorMessage,
	isIdeLikeResponse,
	sendFormRequest,
	validateObjectCommandAuth,
} from '../ObjectCommandClient';
import {
	copyDirectoryContents,
	readOptionalFile,
	removeDirectory,
} from '../ObjectFiles';
import {
	buildCustomObjectsXml,
	extractImportObjectsResult,
	parseIdePayload,
	parseImportObjectStatus,
	uniqueCustomObjects,
} from '../ObjectCommandXml';
import { executeListObjects } from '../list/ListObjectsExecutor';
import { importReferencedFiles } from './ReferencedFilesImporter';

const IDE_ENDPOINT_PATH = '/app/ide/ide.nl';
const OBJECTS_FOLDER_NAME = 'Objects';
const STATUS_XML_FILENAME = 'status.xml';
const ACTION_FETCH_CUSTOM_OBJECT_XML = 'FetchCustomObjectXml';
const IDE_ACTION_KEY = 'action';
const IDE_PARAM_CUSTOM_OBJECTS = 'custom_objects';
const SDF_ACTION_IMPORT_OBJECTS = 'importobjects';
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;
const ALL_LITERAL = 'ALL';
const CUSTOM_SEGMENT_PREFIX = 'customsegment';

export async function executeImportObjects(
	input: ImportObjectsExecutionInput
): Promise<ObjectCommandOperationResult<ImportObjectsResult>> {
	let tempDirectory: string | undefined;
	try {
		validateObjectCommandAuth(input);
		if (!input.projectFolder) {
			return errorResultWithMessage(
				translationService.getMessage(OBJECT.ERROR.PROJECT_FOLDER_REQUIRED_FOR_IMPORT),
				undefined
			);
		}
		if (!input.targetFolder) {
			return errorResultWithMessage(
				translationService.getMessage(OBJECT.ERROR.DESTINATION_FOLDER_REQUIRED_FOR_IMPORT),
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
				resultMessage: translationService.getMessage(OBJECT.INFO.NO_OBJECTS_IMPORTED),
			};
		}

		const customObjectsToImport = await resolveObjectsToImport(input, scriptIds);
		if (customObjectsToImport.length === 0) {
			return {
				status: OBJECT_COMMAND_STATUS.SUCCESS,
				data: buildEmptyImportObjectsResult(),
				resultMessage: translationService.getMessage(OBJECT.INFO.NO_OBJECTS_IMPORTED),
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
				resultMessage: translationService.getMessage(OBJECT.INFO.NO_OBJECTS_IMPORTED),
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
				translationService.getMessage(OBJECT.ERROR.UNKNOWN_SERVER_RESPONSE),
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
			const referencedFilesResult = await importReferencedFiles(
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
				listResult.errorMessages?.[0] ?? translationService.getMessage(OBJECT.ERROR.LIST_CUSTOM_OBJECTS_FAILED)
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
				listResult.errorMessages?.[0] ?? translationService.getMessage(OBJECT.ERROR.LIST_CUSTOM_OBJECTS_FAILED)
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

async function unzipArchive(zipFilePath: string, destinationFolder: string): Promise<void> {
	await extractZipArchive(zipFilePath, destinationFolder);
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
		return translationService.getMessage(OBJECT.ERROR.DESTINATION_OUTSIDE_OBJECTS);
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

function buildEmptyImportObjectsResult(): ImportObjectsResult {
	return {
		successfulImports: [],
		failedImports: [],
	};
}
