/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { randomBytes } from 'node:crypto';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import {
	OBJECT_COMMAND_STATUS,
	type ObjectCommandOperationResult,
	type UpdateCustomRecordWithInstancesExecutionInput,
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
	copyDirectoryContents,
	findObjectFileByScriptId,
	readOptionalFile,
	removeDirectory,
} from '../ObjectFiles';
import { parseIdePayload, parseImportObjectStatus } from '../ObjectCommandXml';

const ENDPOINT_PATH = '/app/ide/fetchcustomrecordwithinstancesxml.nl';
const STATUS_XML_FILENAME = 'status.xml';
const SDF_ACTION = 'updatecustomrecordwithinstances';
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

export async function executeUpdateCustomRecordWithInstances(
	input: UpdateCustomRecordWithInstancesExecutionInput
): Promise<ObjectCommandOperationResult<string>> {
	let tempDirectory: string | undefined;
	try {
		validateObjectCommandAuth(input);
		if (!input.projectFolder) {
			return errorResult(translationService.getMessage(OBJECT.ERROR.PROJECT_FOLDER_REQUIRED_FOR_UPDATE));
		}
		if (!input.scriptId?.trim()) {
			return errorResult(translationService.getMessage(OBJECT.ERROR.CUSTOM_RECORD_SCRIPT_ID_REQUIRED));
		}

		const objectFile = await findObjectFileByScriptId(input.projectFolder, input.scriptId);
		if (!objectFile) {
			return errorResult(translationService.getMessage(OBJECT.ERROR.OBJECT_DOES_NOT_EXIST, input.scriptId));
		}

		const packageRoot = await getPackageRoot(input.projectFolder);
		const params: Record<string, string | string[]> = { scriptid: input.scriptId };
		if (packageRoot) {
			params.appid = packageRoot;
		}

		const response = await sendFormRequest({
			hostName: input.hostName,
			accessToken: input.accessToken,
			path: ENDPOINT_PATH,
			actionName: SDF_ACTION,
			params,
			userAgent: input.userAgent,
			timeoutMs: input.timeoutMs ?? DEFAULT_TIMEOUT_MS,
		});

		if (response.statusCode < 200 || response.statusCode >= 300) {
			return errorResult(getHttpErrorMessage(response), response.statusCode);
		}

		const responseText = response.body.toString('utf8');
		if (isIdeLikeResponse(response, responseText)) {
			const idePayload = await parseIdePayload(responseText);
			return errorResult(
				idePayload.errorMessage ?? translationService.getMessage(OBJECT.ERROR.CUSTOM_RECORD_UPDATE_FAILED),
				response.statusCode
			);
		}

		tempDirectory = await mkdtemp(join(tmpdir(), 'suitecloud-update-custom-record-'));
		const unzipFolder = join(tempDirectory, 'unzipped');
		const zipFilePath = join(tempDirectory, `updatecustomrecord-${Date.now()}-${randomBytes(4).toString('hex')}.zip`);
		await writeFile(zipFilePath, response.body);
		await mkdir(unzipFolder, { recursive: true });
		await extractZipArchive(zipFilePath, unzipFolder);

		const statusFilePath = join(unzipFolder, STATUS_XML_FILENAME);
		const statusXml = await readOptionalFile(statusFilePath);
		if (statusXml) {
			const failedStatus = (await parseImportObjectStatus(statusXml))
				.find((item) => item.id === input.scriptId && item.result?.code === 'FAILED');
			if (failedStatus) {
				return errorResult(
					failedStatus.result?.message ?? translationService.getMessage(OBJECT.ERROR.CUSTOM_RECORD_UPDATE_FAILED)
				);
			}
			await rm(statusFilePath, { force: true });
		}

		if ((await copyDirectoryContents(unzipFolder, dirname(objectFile))).length === 0) {
			return errorResult(translationService.getMessage(OBJECT.ERROR.OBJECT_DOES_NOT_EXIST, input.scriptId));
		}

		return {
			status: OBJECT_COMMAND_STATUS.SUCCESS,
			data: translationService.getMessage(OBJECT.INFO.OBJECT_AND_INSTANCES_UPDATED, input.scriptId),
		};
	} catch (error: unknown) {
		return errorResult(toErrorMessage(error), getStatusCode(error));
	} finally {
		if (tempDirectory) {
			await removeDirectory(tempDirectory);
		}
	}
}

function errorResult(
	message: string,
	httpStatusCode?: number
): ObjectCommandOperationResult<string> {
	return {
		status: OBJECT_COMMAND_STATUS.ERROR,
		httpStatusCode,
		errorMessages: [message],
	};
}

function toErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

function getStatusCode(error: unknown): number | undefined {
	return isRecord(error) && typeof error.statusCode === 'number' ? error.statusCode : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}
