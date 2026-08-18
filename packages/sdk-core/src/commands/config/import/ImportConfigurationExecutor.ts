/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { randomBytes } from 'node:crypto';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
	CONFIGURATION_COMMAND_STATUS,
	type ConfigurationCommandOperationResult,
	type ImportConfigurationExecutionInput,
	type ImportConfigurationResult,
} from '../../../api/config/ConfigurationCommand';
import { extractZipArchive } from '../../../services/archive/ZipArchive';
import {
	assertCreatablePathWithin,
	assertPathWithin,
	PathOutsideRootError,
} from '../../../services/project/ProjectPathResolver';
import { CONFIGURATION } from '../../../services/translation/TranslationKeys';
import { translationService } from '../../../services/translation/TranslationService';
import {
	getHttpErrorMessage,
	isIdeLikeResponse,
	sendFormRequest,
	validateObjectCommandAuth,
} from '../../object/ObjectCommandClient';
import { copyDirectoryContents, readOptionalFile, removeDirectory } from '../../object/ObjectFiles';
import {
	buildCustomObjectsXml,
	parseIdePayload,
	parseImportObjectStatus,
} from '../../object/ObjectCommandXml';

const IDE_ENDPOINT_PATH = '/app/ide/ide.nl';
const IDE_ACTION_KEY = 'action';
const IDE_PARAM_CUSTOM_OBJECTS = 'custom_objects';
const ACTION_FETCH_CUSTOM_OBJECT_XML = 'FetchCustomObjectXml';
const SDF_ACTION_IMPORT_CONFIGURATION = 'importconfiguration';
const STATUS_XML_FILENAME = 'status.xml';
const ACCOUNT_CONFIGURATION_FOLDER_NAME = 'AccountConfiguration';
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

const ALL_FEATURES_CONFIGURATION = [{ type: 'FEATURES', scriptId: 'ALL_FEATURES' }];

export async function executeImportConfiguration(
	input: ImportConfigurationExecutionInput
): Promise<ConfigurationCommandOperationResult> {
	let tempDirectory: string | undefined;
	try {
		validateObjectCommandAuth(input);
		if (!input.projectFolder) {
			return errorResult(translationService.getMessage(CONFIGURATION.ERROR.PROJECT_FOLDER_REQUIRED));
		}
		const unresolvedTargetFolder = assertPathWithin(
			input.projectFolder,
			join(input.projectFolder, ACCOUNT_CONFIGURATION_FOLDER_NAME)
		);
		const targetFolder = await assertCreatablePathWithin(input.projectFolder, unresolvedTargetFolder);

		const response = await sendFormRequest({
			hostName: input.hostName,
			accessToken: input.accessToken,
			path: IDE_ENDPOINT_PATH,
			actionName: SDF_ACTION_IMPORT_CONFIGURATION,
			params: {
				[IDE_ACTION_KEY]: ACTION_FETCH_CUSTOM_OBJECT_XML,
				[IDE_PARAM_CUSTOM_OBJECTS]: buildCustomObjectsXml(ALL_FEATURES_CONFIGURATION),
			},
			userAgent: input.userAgent,
			timeoutMs: input.timeoutMs ?? DEFAULT_TIMEOUT_MS,
		});

		if (response.statusCode < 200 || response.statusCode >= 300) {
			return errorResult(getHttpErrorMessage(response), response.statusCode);
		}

		const responseText = response.body.toString('utf8');
		if (isIdeLikeResponse(response, responseText)) {
			const idePayload = await parseIdePayload(responseText);
			if (idePayload.errorMessage) {
				return errorResult(idePayload.errorMessage, response.statusCode);
			}
			return successResult();
		}

		tempDirectory = await mkdtemp(join(tmpdir(), 'suitecloud-import-configuration-'));
		const zipFilePath = join(tempDirectory, `importconfiguration-${Date.now()}-${randomBytes(4).toString('hex')}.zip`);
		const unzipFolder = join(tempDirectory, 'unzipped');
		await writeFile(zipFilePath, response.body);
		await mkdir(unzipFolder, { recursive: true });
		await extractZipArchive(zipFilePath, unzipFolder);

		const statusFilePath = join(unzipFolder, STATUS_XML_FILENAME);
		const statusXml = await readOptionalFile(statusFilePath);
		if (!statusXml) {
			return errorResult(translationService.getMessage(CONFIGURATION.ERROR.UNKNOWN_SERVER_RESPONSE));
		}

		await rm(statusFilePath, { force: true });
		await mkdir(targetFolder, { recursive: true });
		await copyDirectoryContents(unzipFolder, targetFolder);

		const statusItems = await parseImportObjectStatus(statusXml);
		return successResult({
			successfulImports: statusItems
				.filter((item) => item.result?.code === 'SUCCESS')
				.map((item) => ({ type: item.type, id: item.id })),
			failedImports: statusItems
				.filter((item) => item.result?.code === 'FAILED')
				.map((item) => ({ type: item.type, id: item.id, message: item.result?.message })),
		});
	} catch (error: unknown) {
		return errorResult(toErrorMessage(error), getStatusCode(error));
	} finally {
		if (tempDirectory) {
			await removeDirectory(tempDirectory);
		}
	}
}

function successResult(data: ImportConfigurationResult = { successfulImports: [], failedImports: [] }): ConfigurationCommandOperationResult {
	return { status: CONFIGURATION_COMMAND_STATUS.SUCCESS, data };
}

function errorResult(message: string, httpStatusCode?: number): ConfigurationCommandOperationResult {
	return {
		status: CONFIGURATION_COMMAND_STATUS.ERROR,
		httpStatusCode,
		errorMessages: [message],
	};
}

function toErrorMessage(error: unknown): string {
	if (error instanceof PathOutsideRootError) {
		return translationService.getMessage(CONFIGURATION.ERROR.DESTINATION_OUTSIDE_PROJECT);
	}
	return error instanceof Error ? error.message : String(error);
}

function getStatusCode(error: unknown): number | undefined {
	return typeof error === 'object' && error !== null && typeof (error as { statusCode?: unknown }).statusCode === 'number'
		? (error as { statusCode: number }).statusCode
		: undefined;
}
