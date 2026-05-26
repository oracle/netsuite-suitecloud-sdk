/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { join } from 'node:path';
import {
	executeCreateProject,
	type CreateProjectExecutionInput,
	type CreateProjectOperationResult,
} from './CreateProjectExecutor';
import {
	executeCreateProjectWorkflow,
	type CreateProjectWorkflowInput,
	type CreateProjectWorkflowOperationResult,
} from './CreateProjectWorkflowExecutor';

export const CREATE_PROJECT_COMMAND_OPTIONS = {
	OVERWRITE: 'overwrite',
	PARENT_DIRECTORY: 'parentdirectory',
	PROJECT_ID: 'projectid',
	PROJECT_NAME: 'projectname',
	PROJECT_VERSION: 'projectversion',
	PUBLISHER_ID: 'publisherid',
	TYPE: 'type',
	INCLUDE_UNIT_TESTING: 'includeunittesting',
	PROJECT_FOLDER_NAME: 'projectfoldername',
} as const;

type CreateProjectParams = {
	overwrite?: boolean;
	parentdirectory?: string;
	projectid?: string;
	projectname?: string;
	projectversion?: string;
	publisherid?: string;
	type?: string;
	includeunittesting?: boolean | string;
	projectfoldername?: string;
	[key: string]: unknown;
};

export function ensureCreateProjectLocation(
	params: CreateProjectParams,
	executionPath: string,
	projectTypeSuiteApp: string,
	projectTypeAcp: string
): CreateProjectParams {
	const normalizedParams = { ...params };

	if (!normalizedParams[CREATE_PROJECT_COMMAND_OPTIONS.PROJECT_FOLDER_NAME]) {
		normalizedParams[CREATE_PROJECT_COMMAND_OPTIONS.PROJECT_FOLDER_NAME] = getProjectFolderName(
			normalizedParams,
			projectTypeSuiteApp,
			projectTypeAcp
		);
	}

	if (!normalizedParams[CREATE_PROJECT_COMMAND_OPTIONS.PARENT_DIRECTORY]) {
		normalizedParams[CREATE_PROJECT_COMMAND_OPTIONS.PARENT_DIRECTORY] = join(
			executionPath,
			String(normalizedParams[CREATE_PROJECT_COMMAND_OPTIONS.PROJECT_FOLDER_NAME])
		);
	}

	return normalizedParams;
}

export function getProjectFolderName(
	params: CreateProjectParams,
	projectTypeSuiteApp: string,
	projectTypeAcp: string
): string {
	switch (params[CREATE_PROJECT_COMMAND_OPTIONS.TYPE]) {
		case projectTypeSuiteApp:
			return params[CREATE_PROJECT_COMMAND_OPTIONS.PUBLISHER_ID] &&
				params[CREATE_PROJECT_COMMAND_OPTIONS.PROJECT_ID]
				? `${params[CREATE_PROJECT_COMMAND_OPTIONS.PUBLISHER_ID]}.${params[CREATE_PROJECT_COMMAND_OPTIONS.PROJECT_ID]}`
				: 'not_specified';
		case projectTypeAcp:
			return params[CREATE_PROJECT_COMMAND_OPTIONS.PROJECT_NAME]
				? String(params[CREATE_PROJECT_COMMAND_OPTIONS.PROJECT_NAME])
				: 'not_specified';
		default:
			return 'not_specified';
	}
}

export function buildCreateProjectSdkParams(
	params: CreateProjectParams,
	sourceFolderName: string,
	projectTypeSuiteApp: string
): Record<string, string> {
	const createProjectParams: Record<string, string> = {
		parentdirectory: quoteString(String(params[CREATE_PROJECT_COMMAND_OPTIONS.PARENT_DIRECTORY])),
		type: String(params[CREATE_PROJECT_COMMAND_OPTIONS.TYPE]),
		projectname: sourceFolderName,
	};

	if (params[CREATE_PROJECT_COMMAND_OPTIONS.OVERWRITE]) {
		createProjectParams.overwrite = '';
	}

	if (params[CREATE_PROJECT_COMMAND_OPTIONS.TYPE] === projectTypeSuiteApp) {
		createProjectParams.publisherid = String(params[CREATE_PROJECT_COMMAND_OPTIONS.PUBLISHER_ID]);
		createProjectParams.projectid = String(params[CREATE_PROJECT_COMMAND_OPTIONS.PROJECT_ID]);
		createProjectParams.projectversion = String(params[CREATE_PROJECT_COMMAND_OPTIONS.PROJECT_VERSION]);
	}

	return createProjectParams;
}

export function toIncludeUnitTestingBoolean(includeUnitTesting: boolean | string | undefined): boolean {
	if (typeof includeUnitTesting === 'string') {
		return includeUnitTesting === 'true';
	}
	return includeUnitTesting === true;
}

function quoteString(value: string): string {
	return `"${value}"`;
}

export async function executeCreateProjectCommand(
	input: CreateProjectExecutionInput
): Promise<CreateProjectOperationResult> {
	return executeCreateProject(input);
}

export async function executeCreateProjectWorkflowCommand(
	input: CreateProjectWorkflowInput
): Promise<CreateProjectWorkflowOperationResult> {
	return executeCreateProjectWorkflow(input);
}
