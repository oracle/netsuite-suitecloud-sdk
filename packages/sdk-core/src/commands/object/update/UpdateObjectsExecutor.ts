/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { randomBytes } from 'node:crypto';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
	OBJECT_COMMAND_STATUS,
	type CustomObjectInfo,
	type ObjectCommandOperationResult,
	type UpdateObjectResultItem,
	type UpdateObjectsExecutionInput,
} from '../../../api/object/ObjectCommand';
import { extractZipArchive } from '../../../services/archive/ZipArchive';
import { getPackageRoot } from '../../../services/project/ProjectManifestService';
import { OBJECT } from '../../../services/translation/TranslationKeys';
import { translationService } from '../../../services/translation/TranslationService';
import {
	getHttpErrorMessage,
	isIdeLikeResponse,
	sendFormRequest,
	validateObjectCommandAuth,
} from '../ObjectCommandClient';
import {
	findFileByName,
	findObjectFileByScriptId,
	readOptionalFile,
	removeDirectory,
} from '../ObjectFiles';
import {
	buildCustomObjectsXml,
	extractObjectTypeForUpdate,
	parseIdePayload,
	parseImportObjectStatus,
} from '../ObjectCommandXml';

const IDE_ENDPOINT_PATH = '/app/ide/ide.nl';
const STATUS_XML_FILENAME = 'status.xml';
const ACTION_FETCH_CUSTOM_OBJECT_XML = 'FetchCustomObjectXml';
const IDE_ACTION_KEY = 'action';
const IDE_PARAM_PACKAGE_ROOT = 'package_root';
const IDE_PARAM_CUSTOM_OBJECTS = 'custom_objects';
const IDE_PARAM_MODE = 'mode';
const IDE_MODE_UPDATE = 'update';
const SDF_ACTION_UPDATE_OBJECTS = 'update';
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

export async function executeUpdateObjects(
	input: UpdateObjectsExecutionInput
): Promise<ObjectCommandOperationResult<UpdateObjectResultItem[]>> {
	const results: UpdateObjectResultItem[] = [];
	try {
		validateObjectCommandAuth(input);
		if (!input.projectFolder) {
			return errorResultWithMessage(
				translationService.getMessage(OBJECT.ERROR.PROJECT_FOLDER_REQUIRED_FOR_UPDATE)
			);
		}

		const packageRoot = await getPackageRoot(input.projectFolder);
		const scriptIds = normalizeScriptIds(input.scriptIds);
		for (const scriptId of scriptIds) {
			const objectFile = await findObjectFileByScriptId(input.projectFolder, scriptId);
			if (!objectFile) {
				results.push({
					key: scriptId,
					type: 'ERROR',
					message: translationService.getMessage(OBJECT.ERROR.OBJECT_DOES_NOT_EXIST, scriptId),
				});
				continue;
			}

			try {
				const objectInfo: CustomObjectInfo = {
					type: extractObjectTypeForUpdate(await readFile(objectFile, 'utf8')),
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
					results.push({ key: scriptId, type: 'ERROR', message: getHttpErrorMessage(response) });
					continue;
				}

				const responseText = response.body.toString('utf8');
				if (isIdeLikeResponse(response, responseText)) {
					const idePayload = await parseIdePayload(responseText);
					results.push({
						key: scriptId,
						type: 'ERROR',
						message: idePayload.errorMessage ?? translationService.getMessage(OBJECT.ERROR.UPDATE_OBJECT_FAILED),
					});
					continue;
				}

				const updateResult = await mergeUpdatedObjectXml(response.body, objectFile, scriptId);
				if (updateResult.status === OBJECT_COMMAND_STATUS.ERROR) {
					results.push({
						key: scriptId,
						type: 'ERROR',
						message: updateResult.errorMessages[0] ?? translationService.getMessage(OBJECT.ERROR.UPDATE_FAILED),
					});
					continue;
				}
				results.push({
					key: scriptId,
					type: 'SUCCESS',
					message: translationService.getMessage(OBJECT.INFO.OBJECT_UPDATED, scriptId),
				});
			} catch (error: unknown) {
				results.push({ key: scriptId, type: 'ERROR', message: toErrorMessage(error) });
			}
		}
		return { status: OBJECT_COMMAND_STATUS.SUCCESS, data: results };
	} catch (error: unknown) {
		return errorResultWithMessage(toErrorMessage(error), extractStatusCode(error));
	}
}

async function mergeUpdatedObjectXml(
	zipBuffer: Buffer,
	targetXmlFile: string,
	scriptId: string
): Promise<ObjectCommandOperationResult<void>> {
	let tempDirectory: string | undefined;
	try {
		tempDirectory = await mkdtemp(join(tmpdir(), 'suitecloud-update-object-'));
		const unzipFolder = join(tempDirectory, 'unzipped');
		const zipFilePath = join(tempDirectory, `updateobject-${Date.now()}-${randomBytes(4).toString('hex')}.zip`);
		await writeFile(zipFilePath, zipBuffer);
		await mkdir(unzipFolder, { recursive: true });
		await extractZipArchive(zipFilePath, unzipFolder);

		const statusFilePath = join(unzipFolder, STATUS_XML_FILENAME);
		const statusXml = await readOptionalFile(statusFilePath);
		if (statusXml) {
			const statusItem = (await parseImportObjectStatus(statusXml)).find((item) => item.id === scriptId);
			if (statusItem?.result?.code === 'FAILED') {
				return errorResultWithMessage(
					statusItem.result.message ?? translationService.getMessage(OBJECT.ERROR.CUSTOM_OBJECT_UPDATE_FAILED)
				);
			}
			await rm(statusFilePath, { force: true });
		}

		const sourceXmlFile = await findFileByName(unzipFolder, `${scriptId}.xml`);
		if (!sourceXmlFile) {
			return errorResultWithMessage(
				translationService.getMessage(OBJECT.ERROR.FILE_NOT_FOUND_IN_SERVER_RESPONSE, scriptId)
			);
		}
		await copyFile(sourceXmlFile, targetXmlFile);
		return { status: OBJECT_COMMAND_STATUS.SUCCESS };
	} catch (error: unknown) {
		return errorResultWithMessage(toErrorMessage(error), extractStatusCode(error));
	} finally {
		if (tempDirectory) {
			await removeDirectory(tempDirectory);
		}
	}
}

function errorResultWithMessage<T = unknown>(
	message: string,
	statusCode: number | undefined = undefined
): ObjectCommandOperationResult<T> {
	return {
		status: OBJECT_COMMAND_STATUS.ERROR,
		httpStatusCode: statusCode,
		errorMessages: [message],
	};
}

function toErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

function extractStatusCode(error: unknown): number | undefined {
	return isObject(error) && typeof error.statusCode === 'number' ? error.statusCode : undefined;
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
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
