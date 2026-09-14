/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import {
	PROJECT_COMMAND,
	SDK_OPERATION_STATUS,
	type OperationResult,
	type ProjectCommandExecutionInput,
} from '../../api/project/ProjectCommand';
import { PROJECT } from '../../services/translation/TranslationKeys';
import { translationService } from '../../services/translation/TranslationService';
import {
	createProjectArchive,
	deleteProjectArchiveQuietly,
} from './archive/ProjectArchive';
import {
	sendProjectCommandRequest,
	type ProjectCommandHttpResponse,
	type ProjectCommandRequest,
} from './ProjectCommandClient';
import { normalizeProjectOperationResult } from './result/ProjectResultNormalizer';
import {
	writeProjectCommandLog,
	type ProjectCommandLogInput,
} from './result/ProjectCommandLog';

const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000;

type ProjectCommandDependencies = {
	createProjectArchive?: (projectFolder: string) => Promise<string>;
	deleteFile?: (archivePath: string) => Promise<void>;
	sendProjectRequest?: (request: ProjectCommandRequest) => Promise<ProjectCommandHttpResponse>;
	writeProjectLog?: (input: ProjectCommandLogInput) => Promise<string>;
};

export async function executeProjectCommand(
	input: ProjectCommandExecutionInput,
	dependencies: ProjectCommandDependencies = {}
): Promise<OperationResult> {
	const createArchive = dependencies.createProjectArchive ?? createProjectArchive;
	const removeArchive = dependencies.deleteFile ?? deleteProjectArchiveQuietly;
	const sendRequest = dependencies.sendProjectRequest ?? sendProjectCommandRequest;
	const writeLog = dependencies.writeProjectLog ?? writeProjectCommandLog;
	let projectArchivePath: string | undefined;

	try {
		validateExecutionInput(input);
		projectArchivePath = await createArchive(input.projectFolder);
		const response = await sendRequest({
			command: input.command,
			hostName: input.hostName,
			accessToken: input.accessToken,
			projectArchivePath,
			params: input.params || {},
			flags: input.flags || [],
			userAgent: input.userAgent,
			timeoutMs: input.timeoutMs || DEFAULT_TIMEOUT_MS,
		});

		const operationResult = normalizeProjectOperationResult(
			response.statusCode,
			response.body,
			input.command,
			input.rawOutput === true,
			input.summaryContext,
			response.serverTimestamp
		);
		if (!input.logFileLocation) {
			return operationResult;
		}
		try {
			const logFilePath = await writeLog({
				command: input.command,
				logFileLocation: input.logFileLocation,
				operationResult,
			});
			return { ...operationResult, logFilePath };
		} catch (error: unknown) {
			return { ...operationResult, logWriteWarning: toErrorMessage(error) };
		}
	} catch (error: unknown) {
		return {
			status: SDK_OPERATION_STATUS.ERROR,
			errorMessages: [toErrorMessage(error)],
		};
	} finally {
		if (projectArchivePath) {
			try {
				await removeArchive(projectArchivePath);
			} catch {
				// Cleanup is best-effort and must not replace the command result.
			}
		}
	}
}

function validateExecutionInput(input: ProjectCommandExecutionInput): void {
	if (!input) {
		throw new Error(translationService.getMessage(PROJECT.ERROR.INPUT_REQUIRED));
	}
	if (!Object.values(PROJECT_COMMAND).includes(input.command)) {
		throw new Error(
			translationService.getMessage(PROJECT.ERROR.UNSUPPORTED_COMMAND, input.command)
		);
	}
	if (!input.projectFolder) {
		throw new Error(
			translationService.getMessage(PROJECT.ERROR.PROJECT_FOLDER_REQUIRED)
		);
	}
	if (!input.hostName) {
		throw new Error(translationService.getMessage(PROJECT.ERROR.TARGET_HOST_REQUIRED));
	}
	if (!input.accessToken) {
		throw new Error(translationService.getMessage(PROJECT.ERROR.ACCESS_TOKEN_REQUIRED));
	}
}

function toErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
