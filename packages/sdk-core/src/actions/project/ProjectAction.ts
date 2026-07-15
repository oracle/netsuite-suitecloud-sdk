/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import {
	PROJECT_COMMAND,
	SDK_OPERATION_STATUS,
	type OperationResult,
	type ProjectCommandSummaryContext,
	type ProjectCommandType,
} from '../../api/project/ProjectCommand';
import { normalizeProjectOperationResult } from './ProjectResultNormalizer';
import { PROJECT } from '../../services/translation/TranslationKeys';
import { translationService } from '../../services/translation/TranslationService';

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

export type ProjectActionInput = {
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

export type ProjectRequest = {
	command: ProjectCommandType;
	hostName: string;
	accessToken: string;
	projectArchivePath: string;
	params: Record<string, unknown>;
	flags: string[];
	timeoutMs: number;
};

export type ProjectHttpResponse = {
	statusCode: number;
	body: string;
	serverTimestamp?: string;
};

export interface ProjectArchiveService {
	create(projectFolder: string): Promise<string>;
	remove(archivePath: string): Promise<void>;
}

export interface ProjectApiClient {
	send(request: ProjectRequest): Promise<ProjectHttpResponse>;
}

export type ProjectActionDependencies = {
	archiveService: ProjectArchiveService;
	apiClient: ProjectApiClient;
};

export class ProjectAction {
	constructor(private readonly dependencies: ProjectActionDependencies) {}

	async execute(input: ProjectActionInput): Promise<OperationResult> {
		validateExecutionInput(input);

		let projectArchivePath: string | undefined;
		try {
			projectArchivePath = await this.dependencies.archiveService.create(input.projectFolder);
			const response = await this.dependencies.apiClient.send({
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
		} catch (error: unknown) {
			return {
				status: SDK_OPERATION_STATUS.ERROR,
				errorMessages: [toErrorMessage(error)],
			};
		} finally {
			if (projectArchivePath) {
				await this.dependencies.archiveService.remove(projectArchivePath);
			}
		}
	}
}

function validateExecutionInput(input: ProjectActionInput): void {
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
