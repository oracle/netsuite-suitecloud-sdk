/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { Agent, request as httpsRequest, type RequestOptions } from 'node:https';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { access, copyFile, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { execFile } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { promisify } from 'node:util';
import { parseStringPromise } from 'xml2js';

import { executeImportFiles } from '../file/FileCommandExecutor';

const execFileAsync = promisify(execFile);

export const OBJECT_COMMAND_STATUS = {
	SUCCESS: 'SUCCESS',
	ERROR: 'ERROR',
} as const;

type ObjectCommandStatus = (typeof OBJECT_COMMAND_STATUS)[keyof typeof OBJECT_COMMAND_STATUS];

export type ObjectCommandOperationResult<T = unknown> = {
	status: ObjectCommandStatus;
	data?: T;
	resultMessage?: string;
	httpStatusCode?: number;
	errorMessages?: string[];
};

export type ObjectCommandAuthInput = {
	hostName: string;
	accessToken: string;
	userAgent?: string;
	timeoutMs?: number;
};

export type ListObjectsExecutionInput = ObjectCommandAuthInput & {
	appId?: string;
	scriptIdContains?: string;
	objectTypes?: string[];
};

export type ImportObjectsExecutionInput = ObjectCommandAuthInput & {
	projectFolder: string;
	targetFolder: string;
	scriptIds: string[];
	objectType: string;
	appId?: string;
	excludeFiles: boolean;
};

export type UpdateObjectsExecutionInput = ObjectCommandAuthInput & {
	projectFolder: string;
	scriptIds: string[];
};

export type UpdateCustomRecordWithInstancesExecutionInput = ObjectCommandAuthInput & {
	projectFolder: string;
	scriptId: string;
};

export type CustomObjectInfo = {
	type: string;
	scriptId: string;
	appId?: string;
};

type ImportObjectStatusItem = {
	id: string;
	type: string;
	appId?: string;
	result?: {
		code?: string;
		message?: string;
	};
};

type ReferencedFileImportResult = {
	path: string;
	message?: string;
};

type ObjectImportResultItem = {
	customObject: {
		id: string;
		type: string;
		appId?: string;
		result?: {
			code?: string;
			message?: string;
		};
	};
	referencedFileImportResult: {
		successfulImports: ReferencedFileImportResult[];
		failedImports: ReferencedFileImportResult[];
	};
};

export type ImportObjectsResult = {
	successfulImports: ObjectImportResultItem[];
	failedImports: ObjectImportResultItem[];
};

export type UpdateObjectResultItem = {
	key: string;
	type: 'SUCCESS' | 'ERROR';
	message: string;
};

type HttpResponse = {
	statusCode: number;
	body: Buffer;
	contentType?: string;
};

const IDE_ENDPOINT_PATH = '/app/ide/ide.nl';
const FETCH_CUSTOM_RECORD_WITH_INSTANCES_ENDPOINT = '/app/ide/fetchcustomrecordwithinstancesxml.nl';
const OBJECTS_FOLDER_NAME = 'Objects';
const MANIFEST_FILE = 'manifest.xml';
const STATUS_XML_FILENAME = 'status.xml';
const ACTION_FETCH_CUSTOM_OBJECT_LIST = 'FetchCustomObjectList';
const ACTION_FETCH_CUSTOM_OBJECT_XML = 'FetchCustomObjectXml';
const IDE_ACTION_KEY = 'action';
const IDE_PARAM_PACKAGE_ROOT = 'package_root';
const IDE_PARAM_OBJECT_TYPE = 'object_type';
const IDE_PARAM_SCRIPT_ID_CONTAINS = 'scriptid_contains';
const IDE_PARAM_CUSTOM_OBJECTS = 'custom_objects';
const IDE_PARAM_MODE = 'mode';
const IDE_RESULT_KEY = 'result';
const IDE_MODE_UPDATE = 'update';
const SDF_ACTION_LIST_OBJECTS = 'listobjects';
const SDF_ACTION_IMPORT_OBJECTS = 'importobjects';
const SDF_ACTION_UPDATE_OBJECTS = 'update';
const SDF_ACTION_UPDATE_CUSTOM_RECORDS = 'updatecustomrecordwithinstances';
const HEADER_SDF_ACTION = 'Sdf-Action';
const HEADER_USER_AGENT = 'User-Agent';
const HEADER_AUTHORIZATION = 'Authorization';
const HEADER_ACCEPT = 'Accept';
const HEADER_CONTENT_TYPE = 'Content-Type';
const HEADER_CONTENT_LENGTH = 'Content-Length';
const CONTENT_TYPE_FORM_URLENCODED = 'application/x-www-form-urlencoded';
const CONTENT_TYPE_TEXT_XML = 'text/xml';
const CONTENT_TYPE_JSON = 'application/json';
const CONTENT_TYPE_OCTET_STREAM = 'application/octet-stream';
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;
const UNZIP_BINARY_NAME = 'unzip';
const VM_ENG_HOST_SUFFIX = 'vm.eng';
const ALL_LITERAL = 'ALL';
const CUSTOM_SEGMENT_TYPE = 'customsegment';
const CUSTOM_RECORD_TYPE = 'customrecordtype';
const CUSTOM_RECORD_PREFIX = 'customrecord';
const CUSTOM_SEGMENT_PREFIX = 'customsegment';
const SUITESCRIPTS_PREFIX = '/SuiteScripts/';
const INVALID_REFERENCED_FILE_PATH_MESSAGE = 'The file path is invalid or not supported.';

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

		const objects = idePayload.resultText
			? (await parseCustomObjectListXml(idePayload.resultText)).sort(compareCustomObjects)
			: [];

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
			return errorResultWithMessage('A project folder is required for object import.', undefined);
		}
		if (!input.targetFolder) {
			return errorResultWithMessage('A destination folder is required for object import.', undefined);
		}

		const scriptIds = normalizeScriptIds(input.scriptIds);
		if (scriptIds.length === 0) {
			return {
				status: OBJECT_COMMAND_STATUS.SUCCESS,
				data: buildEmptyImportObjectsResult(),
				resultMessage: 'No objects imported.',
			};
		}

		const customObjectsToImport = await resolveObjectsToImport(input, scriptIds);
		if (customObjectsToImport.length === 0) {
			return {
				status: OBJECT_COMMAND_STATUS.SUCCESS,
				data: buildEmptyImportObjectsResult(),
				resultMessage: 'No objects imported.',
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
				resultMessage: 'No objects imported.',
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
			return errorResultWithMessage('Unable to recognize the response from server.', undefined);
		}

		await rm(statusFilePath, { force: true });
		await mkdir(input.targetFolder, { recursive: true });
		await copyDirectoryContents(unzipFolder, input.targetFolder);

		const importStatusItems = await parseImportObjectStatus(statusXml);
		const importResult = extractImportObjectsResult(importStatusItems);

		const canImportReferencedFiles = !input.excludeFiles && !(await isSuiteAppProject(input.projectFolder));
		if (canImportReferencedFiles) {
			const referencedFilesResult = await enrichReferencedFileImports(input, importResult.successfulImports);
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
			await removeDirectoryQuietly(tempDirectory);
		}
	}
}

export async function executeUpdateObjects(
	input: UpdateObjectsExecutionInput
): Promise<ObjectCommandOperationResult<UpdateObjectResultItem[]>> {
	let packageRoot: string | undefined;
	const results: UpdateObjectResultItem[] = [];

	try {
		validateAuthInput(input);
		if (!input.projectFolder) {
			return errorResultWithMessage('A project folder is required for object update.', undefined);
		}

		packageRoot = await getPackageRoot(input.projectFolder);
		const scriptIds = normalizeScriptIds(input.scriptIds);

		for (const scriptId of scriptIds) {
			const objectFile = await findObjectFileByScriptId(input.projectFolder, scriptId);
			if (!objectFile) {
				results.push({
					key: scriptId,
					type: 'ERROR',
					message: `The "${scriptId}" object does not exist.`,
				});
				continue;
			}

			try {
				const xmlContents = await readFile(objectFile, 'utf8');
				const objectType = extractRootTagName(xmlContents).toLowerCase();
				const objectInfo: CustomObjectInfo = {
					type: objectType,
					scriptId,
					appId: packageRoot || undefined,
				};

				const response = await sendFormRequest({
					hostName: input.hostName,
					accessToken: input.accessToken,
					path: IDE_ENDPOINT_PATH,
					actionName: SDF_ACTION_UPDATE_OBJECTS,
					params: {
						[IDE_ACTION_KEY]: ACTION_FETCH_CUSTOM_OBJECT_XML,
						[IDE_PARAM_PACKAGE_ROOT]: packageRoot,
						[IDE_PARAM_MODE]: IDE_MODE_UPDATE,
						[IDE_PARAM_CUSTOM_OBJECTS]: buildCustomObjectsXml([objectInfo]),
					},
					userAgent: input.userAgent,
					timeoutMs: input.timeoutMs ?? DEFAULT_TIMEOUT_MS,
				});

				if (response.statusCode === 401 || response.statusCode === 403) {
					return errorResultWithMessage(getHttpErrorMessage(response), response.statusCode);
				}
				if (response.statusCode < 200 || response.statusCode >= 300) {
					results.push({
						key: scriptId,
						type: 'ERROR',
						message: getHttpErrorMessage(response),
					});
					continue;
				}

				const responseText = response.body.toString('utf8');
				if (isIdeLikeResponse(response, responseText)) {
					const idePayload = await parseIdePayload(responseText);
					results.push({
						key: scriptId,
						type: 'ERROR',
						message: idePayload.errorMessage ?? 'Unable to update object from server.',
					});
					continue;
				}

				const objectUpdateResult = await mergeUpdatedObjectXml(response.body, objectFile, scriptId);
				if (objectUpdateResult.status === OBJECT_COMMAND_STATUS.ERROR) {
					results.push({ key: scriptId, type: 'ERROR', message: objectUpdateResult.errorMessages?.[0] ?? 'Update failed.' });
					continue;
				}

				results.push({
					key: scriptId,
					type: 'SUCCESS',
					message: `The "${scriptId}" object was updated.`,
				});
			} catch (error: unknown) {
				results.push({
					key: scriptId,
					type: 'ERROR',
					message: toErrorMessage(error),
				});
			}
		}

		return {
			status: OBJECT_COMMAND_STATUS.SUCCESS,
			data: results,
		};
	} catch (error: unknown) {
		return errorResultWithMessage(toErrorMessage(error), extractStatusCode(error));
	}
}

export async function executeUpdateCustomRecordWithInstances(
	input: UpdateCustomRecordWithInstancesExecutionInput
): Promise<ObjectCommandOperationResult<string>> {
	let tempDirectory: string | undefined;
	try {
		validateAuthInput(input);
		if (!input.projectFolder) {
			return errorResultWithMessage('A project folder is required for object update.', undefined);
		}
		if (!input.scriptId || !input.scriptId.trim()) {
			return errorResultWithMessage('A custom record script ID is required.', undefined);
		}

		const objectFile = await findObjectFileByScriptId(input.projectFolder, input.scriptId);
		if (!objectFile) {
			return errorResultWithMessage(`The "${input.scriptId}" object does not exist.`, undefined);
		}

		const packageRoot = await getPackageRoot(input.projectFolder);
		const params: Record<string, string | string[]> = {
			scriptid: input.scriptId,
		};
		if (packageRoot) {
			params.appid = packageRoot;
		}

		const response = await sendFormRequest({
			hostName: input.hostName,
			accessToken: input.accessToken,
			path: FETCH_CUSTOM_RECORD_WITH_INSTANCES_ENDPOINT,
			actionName: SDF_ACTION_UPDATE_CUSTOM_RECORDS,
			params,
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
			return errorResultWithMessage(idePayload.errorMessage ?? 'Unable to update custom record from server.', response.statusCode);
		}

		tempDirectory = await mkdtemp(join(tmpdir(), 'suitecloud-update-custom-record-'));
		const zipFilePath = join(tempDirectory, `updatecustomrecord-${Date.now()}-${randomBytes(4).toString('hex')}.zip`);
		const unzipFolder = join(tempDirectory, 'unzipped');
		await writeFile(zipFilePath, response.body);
		await mkdir(unzipFolder, { recursive: true });
		await unzipArchive(zipFilePath, unzipFolder);

		const statusFilePath = join(unzipFolder, STATUS_XML_FILENAME);
		const statusXml = await readOptionalFile(statusFilePath);
		if (statusXml) {
			const statusItems = await parseImportObjectStatus(statusXml);
			const failedStatus = statusItems.find((item) => item.id === input.scriptId && item.result?.code === 'FAILED');
			if (failedStatus) {
				return errorResultWithMessage(failedStatus.result?.message ?? 'Unable to update custom record from server.', undefined);
			}
			await rm(statusFilePath, { force: true });
		}

		const copiedFiles = await copyDirectoryContents(unzipFolder, dirname(objectFile));
		if (copiedFiles.length === 0) {
			return errorResultWithMessage(`The "${input.scriptId}" object does not exist.`, undefined);
		}

		return {
			status: OBJECT_COMMAND_STATUS.SUCCESS,
			data: `The "${input.scriptId}" object and its instances were updated.`,
		};
	} catch (error: unknown) {
		return errorResultWithMessage(toErrorMessage(error), extractStatusCode(error));
	} finally {
		if (tempDirectory) {
			await removeDirectoryQuietly(tempDirectory);
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
			throw new Error(listResult.errorMessages?.[0] ?? 'Unable to list custom objects.');
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
			throw new Error(listResult.errorMessages?.[0] ?? 'Unable to list custom objects.');
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

function buildCustomObjectsXml(customObjects: CustomObjectInfo[]): string {
	const expandedObjects = [...customObjects];
	for (const customObject of customObjects) {
		if (customObject.type.toLowerCase() === CUSTOM_SEGMENT_TYPE) {
			expandedObjects.push({
				type: CUSTOM_RECORD_TYPE,
				scriptId: `${CUSTOM_RECORD_PREFIX}_${customObject.scriptId}`,
				appId: customObject.appId,
			});
		}
	}

	const xmlLines = ['<customObjects>'];
	for (const object of uniqueCustomObjects(expandedObjects)) {
		const attributes = [
			object.appId ? ` package="${escapeXmlAttribute(object.appId)}"` : '',
			` id="${escapeXmlAttribute(object.scriptId)}"`,
			` type="${escapeXmlAttribute(object.type)}"`,
		].join('');
		xmlLines.push(`  <customObject${attributes}/>`);
	}
	xmlLines.push('</customObjects>');
	return xmlLines.join('\n');
}

function uniqueCustomObjects(customObjects: CustomObjectInfo[]): CustomObjectInfo[] {
	const seen = new Set<string>();
	const unique: CustomObjectInfo[] = [];
	for (const object of customObjects) {
		const key = `${object.type}:${object.scriptId}`;
		if (seen.has(key)) {
			continue;
		}
		seen.add(key);
		unique.push(object);
	}
	return unique;
}

function escapeXmlAttribute(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

async function parseCustomObjectListXml(xmlText: string): Promise<CustomObjectInfo[]> {
	const parsed = await parseStringPromise(xmlText, {
		explicitArray: false,
		trim: true,
		mergeAttrs: false,
	});

	const customObjectsNode = parsed?.customObjects?.customObject;
	const customObjects = asArray(customObjectsNode);
	return customObjects
		.map((customObject) => {
			const attrs = customObject?.$ ?? {};
			const type = stringOrUndefined(attrs.type);
			const scriptId = stringOrUndefined(attrs.id);
			const appId = stringOrUndefined(attrs.package);
			if (!type || !scriptId) {
				return undefined;
			}
			return {
				type,
				scriptId,
				appId,
			};
		})
		.filter((object): object is CustomObjectInfo => !!object);
}

function compareCustomObjects(left: CustomObjectInfo, right: CustomObjectInfo): number {
	const typeComparison = left.type.localeCompare(right.type);
	if (typeComparison !== 0) {
		return typeComparison;
	}
	return left.scriptId.localeCompare(right.scriptId);
}

async function parseImportObjectStatus(xmlText: string): Promise<ImportObjectStatusItem[]> {
	const parsed = await parseStringPromise(xmlText, {
		explicitArray: false,
		trim: true,
	});

	const statusRoot = parsed?.Status ?? parsed?.status;
	const customObjects = asArray(statusRoot?.customObject);
	return customObjects
		.map((customObject) => {
			const attrs = customObject?.$ ?? {};
			const result = customObject?.result;
			return {
				id: stringOrUndefined(attrs.id) ?? '',
				type: stringOrUndefined(attrs.type) ?? '',
				appId: stringOrUndefined(attrs.package),
				result: result
					? {
						code: stringOrUndefined(result.code),
						message: stringOrUndefined(result.message),
					}
					: undefined,
			};
		})
		.filter((item) => !!item.id && !!item.type);
}

function extractImportObjectsResult(statusItems: ImportObjectStatusItem[]): ImportObjectsResult {
	const result = buildEmptyImportObjectsResult();
	for (const statusItem of statusItems) {
		const objectImport: ObjectImportResultItem = {
			customObject: {
				id: statusItem.id,
				type: statusItem.type,
				appId: statusItem.appId,
				result: statusItem.result,
			},
			referencedFileImportResult: {
				successfulImports: [],
				failedImports: [],
			},
		};

		if (statusItem.result?.code === 'SUCCESS') {
			result.successfulImports.push(objectImport);
		} else if (statusItem.result?.code === 'FAILED') {
			result.failedImports.push(objectImport);
		}
	}

	return result;
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

		const importFileItems = asArray(importFilesResult.data);
		for (const importFileItem of importFileItems) {
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

function extractScriptFileReferences(xmlText: string): string[] {
	const matches = Array.from(xmlText.matchAll(/<scriptfile>\s*\[([^\]]+)]\s*<\/scriptfile>/gi));
	const references = matches
		.map((match) => match[1].trim())
		.filter(Boolean);
	return references.filter((reference, index, array) => array.indexOf(reference) === index);
}

async function mergeUpdatedObjectXml(
	zipBuffer: Buffer,
	targetXmlFile: string,
	scriptId: string
): Promise<ObjectCommandOperationResult<void>> {
	let tempDirectory: string | undefined;
	try {
		tempDirectory = await mkdtemp(join(tmpdir(), 'suitecloud-update-object-'));
		const zipFilePath = join(tempDirectory, `updateobject-${Date.now()}-${randomBytes(4).toString('hex')}.zip`);
		const unzipFolder = join(tempDirectory, 'unzipped');
		await writeFile(zipFilePath, zipBuffer);
		await mkdir(unzipFolder, { recursive: true });
		await unzipArchive(zipFilePath, unzipFolder);

		const statusFilePath = join(unzipFolder, STATUS_XML_FILENAME);
		const statusXml = await readOptionalFile(statusFilePath);
		if (statusXml) {
			const statusItems = await parseImportObjectStatus(statusXml);
			const statusItem = statusItems.find((item) => item.id === scriptId);
			if (statusItem?.result?.code === 'FAILED') {
				return errorResultWithMessage(statusItem.result.message ?? 'Unable to update custom object from server.', undefined);
			}
			await rm(statusFilePath, { force: true });
		}

		const sourceXmlFile = await findFileByName(unzipFolder, `${scriptId}.xml`);
		if (!sourceXmlFile) {
			return errorResultWithMessage(`File "${scriptId}.xml" was not found in the server response.`, undefined);
		}

		await copyFile(sourceXmlFile, targetXmlFile);
		return {
			status: OBJECT_COMMAND_STATUS.SUCCESS,
		};
	} catch (error: unknown) {
		return errorResultWithMessage(toErrorMessage(error), extractStatusCode(error));
	} finally {
		if (tempDirectory) {
			await removeDirectoryQuietly(tempDirectory);
		}
	}
}

async function findObjectFileByScriptId(
	projectFolder: string,
	scriptId: string,
	preferredFolder?: string
): Promise<string | undefined> {
	const searchRoots = [preferredFolder, join(projectFolder, OBJECTS_FOLDER_NAME)]
		.filter((rootPath): rootPath is string => !!rootPath)
		.filter((rootPath, index, array) => array.indexOf(rootPath) === index);

	for (const rootPath of searchRoots) {
		const objectFile = await findFileByName(rootPath, `${scriptId}.xml`);
		if (objectFile) {
			return objectFile;
		}
	}
	return undefined;
}

async function findFileByName(rootFolder: string, filename: string): Promise<string | undefined> {
	try {
		await access(rootFolder, fsConstants.F_OK);
	} catch {
		return undefined;
	}

	const queue: string[] = [rootFolder];
	while (queue.length > 0) {
		const currentFolder = queue.shift() as string;
		const entries = await readdir(currentFolder, { withFileTypes: true });
		for (const entry of entries) {
			const entryPath = join(currentFolder, entry.name);
			if (entry.isDirectory()) {
				queue.push(entryPath);
				continue;
			}
			if (entry.isFile() && entry.name === filename) {
				return entryPath;
			}
		}
	}

	return undefined;
}

function extractRootTagName(xmlText: string): string {
	const normalizedXml = xmlText.trim().replace(/^<\?xml[^>]*\?>/i, '').trim();
	const tagMatch = normalizedXml.match(/^<([a-zA-Z0-9_:-]+)/);
	if (!tagMatch) {
		throw new Error('Unable to parse object XML root tag.');
	}
	return tagMatch[1];
}

async function isSuiteAppProject(projectFolder: string): Promise<boolean> {
	const manifestPath = join(projectFolder, MANIFEST_FILE);
	const manifestContents = await readOptionalFile(manifestPath);
	if (!manifestContents) {
		return false;
	}
	return /projecttype\s*=\s*"SUITEAPP"/i.test(manifestContents);
}

async function getPackageRoot(projectFolder: string): Promise<string> {
	const manifestPath = join(projectFolder, MANIFEST_FILE);
	const manifestContents = await readOptionalFile(manifestPath);
	if (!manifestContents) {
		return '';
	}

	try {
		const manifest = await parseStringPromise(manifestContents, {
			explicitArray: false,
			trim: true,
		});
		const manifestNode = manifest?.manifest;
		const publisherId = stringOrUndefined(manifestNode?.publisherid) ?? stringOrUndefined(manifestNode?.publisherId);
		const projectId = stringOrUndefined(manifestNode?.projectid) ?? stringOrUndefined(manifestNode?.projectId);
		if (!publisherId) {
			return '';
		}
		return projectId ? `${publisherId}.${projectId}` : publisherId;
	} catch {
		return '';
	}
}

async function parseIdePayload(xmlText: string): Promise<{ resultText?: string; errorMessage?: string }> {
	try {
		const parsed = await parseStringPromise(xmlText, {
			explicitArray: false,
			trim: true,
		});

		const ideNode = parsed?.ide ?? parsed;
		const errorMessage = extractIdeErrorMessage(ideNode);
		if (errorMessage) {
			return { errorMessage };
		}

		const resultText = extractIdeResultText(ideNode);
		return { resultText };
	} catch {
		return {};
	}
}

function extractIdeErrorMessage(ideNode: unknown): string | undefined {
	if (!isObject(ideNode)) {
		return undefined;
	}

	const directError = stringOrUndefined((ideNode as Record<string, unknown>).error);
	if (directError && directError.trim()) {
		return directError;
	}

	const errorNode = (ideNode as Record<string, unknown>).error;
	if (isObject(errorNode)) {
		const message = stringOrUndefined((errorNode as Record<string, unknown>).message) ?? stringOrUndefined((errorNode as Record<string, unknown>).detail);
		if (message && message.trim()) {
			return message;
		}
	}

	return undefined;
}

function extractIdeResultText(ideNode: unknown): string | undefined {
	if (!isObject(ideNode)) {
		return undefined;
	}
	const resultNode = (ideNode as Record<string, unknown>).result;
	if (typeof resultNode === 'string') {
		return resultNode;
	}
	if (!isObject(resultNode)) {
		return undefined;
	}

	const nestedResultNode = (resultNode as Record<string, unknown>)[IDE_RESULT_KEY];
	if (typeof nestedResultNode === 'string') {
		return nestedResultNode;
	}
	if (isObject(nestedResultNode)) {
		return stringOrUndefined((nestedResultNode as Record<string, unknown>)._);
	}

	// XStream map serialization: <result><entry><string>result</string><string>...</string></entry></result>
	const mapEntryNodes = asArray((resultNode as Record<string, unknown>).entry);
	for (const mapEntryNode of mapEntryNodes) {
		if (!isObject(mapEntryNode)) {
			continue;
		}
		const mapEntryStringValues = asArray((mapEntryNode as Record<string, unknown>).string).map((value) =>
			typeof value === 'string' ? value : stringOrUndefined((value as Record<string, unknown>)._)
		);
		if (mapEntryStringValues.length >= 2 && mapEntryStringValues[0] === IDE_RESULT_KEY && mapEntryStringValues[1]) {
			return mapEntryStringValues[1];
		}
	}

	return undefined;
}

function isIdeLikeResponse(response: HttpResponse, responseText: string): boolean {
	if (response.contentType && response.contentType.toLowerCase().startsWith(CONTENT_TYPE_TEXT_XML)) {
		return true;
	}
	const trimmedResponse = responseText.trim();
	return trimmedResponse.startsWith('<ide') || trimmedResponse.startsWith('<?xml') || trimmedResponse.startsWith('<Status');
}

async function sendFormRequest(input: {
	hostName: string;
	accessToken: string;
	path: string;
	actionName: string;
	params: Record<string, string | string[]>;
	userAgent?: string;
	timeoutMs: number;
}): Promise<HttpResponse> {
	const urlSearchParams = new URLSearchParams();
	for (const [key, value] of Object.entries(input.params)) {
		if (Array.isArray(value)) {
			for (const arrayValue of value) {
				if (arrayValue !== undefined && arrayValue !== null && String(arrayValue).trim()) {
					urlSearchParams.append(key, String(arrayValue));
				}
			}
			continue;
		}
		if (value !== undefined && value !== null) {
			urlSearchParams.append(key, String(value));
		}
	}

	const requestBody = Buffer.from(urlSearchParams.toString(), 'utf8');
	const requestOptions: RequestOptions = {
		protocol: 'https:',
		hostname: input.hostName,
		method: 'POST',
		path: input.path,
		headers: {
			[HEADER_AUTHORIZATION]: `Bearer ${input.accessToken}`,
			[HEADER_ACCEPT]: `${CONTENT_TYPE_JSON}, ${CONTENT_TYPE_OCTET_STREAM}, ${CONTENT_TYPE_TEXT_XML}`,
			[HEADER_CONTENT_TYPE]: CONTENT_TYPE_FORM_URLENCODED,
			[HEADER_CONTENT_LENGTH]: String(requestBody.length),
			[HEADER_SDF_ACTION]: input.actionName,
			...(input.userAgent ? { [HEADER_USER_AGENT]: input.userAgent } : {}),
		},
		agent: createHttpsAgentForHost(input.hostName),
	};

	return new Promise((resolve, reject) => {
		const request = httpsRequest(requestOptions, (response) => {
			const chunks: Buffer[] = [];
			response.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
			response.on('end', () => {
				resolve({
					statusCode: response.statusCode || 500,
					body: Buffer.concat(chunks),
					contentType: response.headers['content-type'],
				});
			});
		});

		request.on('error', reject);
		request.setTimeout(input.timeoutMs, () => {
			request.destroy(new Error('Object command request timed out.'));
		});
		request.write(requestBody);
		request.end();
	});
}

function createHttpsAgentForHost(hostName: string): Agent | undefined {
	if (!hostName || !hostName.includes(VM_ENG_HOST_SUFFIX)) {
		return undefined;
	}
	return new Agent({ rejectUnauthorized: false });
}

async function unzipArchive(zipFilePath: string, destinationFolder: string): Promise<void> {
	await execFileAsync(UNZIP_BINARY_NAME, ['-o', zipFilePath, '-d', destinationFolder]);
}

async function copyDirectoryContents(sourceFolder: string, destinationFolder: string): Promise<string[]> {
	const copiedFiles: string[] = [];
	const entries = await readdir(sourceFolder, { withFileTypes: true });
	for (const entry of entries) {
		const sourcePath = join(sourceFolder, entry.name);
		const destinationPath = join(destinationFolder, entry.name);
		if (entry.isDirectory()) {
			await mkdir(destinationPath, { recursive: true });
			const nestedCopiedFiles = await copyDirectoryContents(sourcePath, destinationPath);
			copiedFiles.push(...nestedCopiedFiles);
			continue;
		}
		if (!entry.isFile()) {
			continue;
		}
		if (entry.name.toLowerCase() === STATUS_XML_FILENAME) {
			continue;
		}
		await mkdir(dirname(destinationPath), { recursive: true });
		await copyFile(sourcePath, destinationPath);
		copiedFiles.push(destinationPath);
	}
	return copiedFiles;
}

async function readOptionalFile(filePath: string): Promise<string | undefined> {
	try {
		return await readFile(filePath, 'utf8');
	} catch {
		return undefined;
	}
}

async function removeDirectoryQuietly(directoryPath: string): Promise<void> {
	await rm(directoryPath, { recursive: true, force: true });
}

function getHttpErrorMessage(response: HttpResponse): string {
	const responseText = response.body.toString('utf8').trim();
	if (!responseText) {
		return `HTTP ${response.statusCode}`;
	}
	return responseText;
}

function validateAuthInput(input: ObjectCommandAuthInput): void {
	if (!input.hostName) {
		throw new Error('A target host is required for object command execution.');
	}
	if (!input.accessToken) {
		throw new Error('An access token is required for object command execution.');
	}
}

function errorResultWithMessage(message: string, statusCode: number | undefined): ObjectCommandOperationResult {
	return {
		status: OBJECT_COMMAND_STATUS.ERROR,
		httpStatusCode: statusCode,
		errorMessages: [message],
	};
}

function toErrorMessage(error: unknown): string {
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
	if (value === undefined || value === null) {
		return [];
	}
	return [value];
}

function buildEmptyImportObjectsResult(): ImportObjectsResult {
	return {
		successfulImports: [],
		failedImports: [],
	};
}
