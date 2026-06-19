/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import {
	createDefaultProjectArchive,
	deleteFileQuietly,
	HttpResponse,
	sendDefaultProjectRequest,
} from './ProjectApiClient';
import { normalizeProjectOperationResult } from './ProjectResultNormalizer';
import {
	OperationResult,
	ProjectCommandType,
	ProjectCommandSummaryContext,
	PROJECT_COMMAND,
	SDK_OPERATION_STATUS,
} from './ProjectCommandTypes';

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

type ProjectCommandExecutionInput = {
	command: ProjectCommandType;
	projectFolder: string;
	hostName: string;
	accessToken: string;
	params?: Record<string, unknown>;
	flags?: string[];
	rawOutput?: boolean;
	timeoutMs?: number;
	summaryContext?: ProjectCommandSummaryContext;
};

type ProjectCommandExecutorDependencies = {
	createProjectArchive?: (projectFolder: string) => Promise<string>;
	deleteFile?: (filepath: string) => Promise<void>;
	sendProjectRequest?: (request: {
		command: ProjectCommandType;
		hostName: string;
		accessToken: string;
		projectArchivePath: string;
		params: Record<string, unknown>;
		flags: string[];
		timeoutMs: number;
	}) => Promise<HttpResponse>;
};

export { PROJECT_COMMAND, SDK_OPERATION_STATUS };

export async function executeProjectCommand(
	input: ProjectCommandExecutionInput,
	dependencies: ProjectCommandExecutorDependencies = {}
): Promise<OperationResult> {
	validateExecutionInput(input);

	const createProjectArchive = dependencies.createProjectArchive || createDefaultProjectArchive;
	const deleteFile = dependencies.deleteFile || deleteFileQuietly;
	const sendProjectRequest = dependencies.sendProjectRequest || sendDefaultProjectRequest;

	let projectArchivePath: string | undefined;
	try {
		projectArchivePath = await createProjectArchive(input.projectFolder);
		const response = await sendProjectRequest({
			command: input.command,
			hostName: input.hostName,
			accessToken: input.accessToken,
			projectArchivePath,
			params: input.params || {},
			flags: input.flags || [],
			timeoutMs: input.timeoutMs || DEFAULT_TIMEOUT_MS,
		});
		return normalizeProjectOperationResult(
			response.statusCode,
			response.body,
			input.command,
			input.rawOutput === true,
			input.summaryContext,
			response.serverTimestamp
		);
	} catch (error: any) {
		return {
			status: SDK_OPERATION_STATUS.ERROR,
			errorMessages: [error?.message || String(error)],
		};
	} finally {
		if (projectArchivePath) {
			await deleteFile(projectArchivePath);
		}
	}
}

function validateExecutionInput(input: ProjectCommandExecutionInput): void {
	if (!input) {
		throw new Error('Project command execution input is required.');
	}
	if (!Object.values(PROJECT_COMMAND).includes(input.command)) {
		throw new Error(`Unsupported project command "${input.command}".`);
	}
	if (!input.projectFolder) {
		throw new Error('A project folder is required for project command execution.');
	}
	if (!input.hostName) {
		throw new Error('A target host is required for project command execution.');
	}
	if (!input.accessToken) {
		throw new Error('An access token is required for project command execution.');
	}
}
