/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import {
	executeImportFiles,
	type FileCommandAuthInput,
	type FileCommandOperationResult,
} from '../FileCommandExecutor';

export const IMPORT_FILES_COMMAND_OPTIONS = {
	ALLOW_FOR_SUITEAPPS: 'allowforsuiteapps',
	AUTH_ID: 'authid',
	CALLED_FROM_COMPARE_FILES: 'calledfromcomparefiles',
	CALLED_FROM_UPDATE: 'calledfromupdate',
	PATHS: 'paths',
	EXCLUDE_PROPERTIES: 'excludeproperties',
	PROJECT: 'project',
} as const;

type ImportFilesParams = {
	authid?: string;
	calledfromcomparefiles?: boolean;
	calledfromupdate?: boolean;
	paths?: string | string[];
	excludeproperties?: boolean | string;
	project?: string;
	allowforsuiteapps?: string;
	[key: string]: unknown;
};

export type ImportFilesPreparationResult = {
	params: ImportFilesParams;
	calledFromCompareFiles: boolean;
	calledFromUpdate: boolean;
};

export type ImportFilesExecutionInput = FileCommandAuthInput & {
	projectFolder: string;
	filePaths: string[];
	excludeProperties: boolean;
};

export function prepareImportFilesParams(
	params: ImportFilesParams,
	projectFolder: string,
	authId: string
): ImportFilesPreparationResult {
	const normalizedParams: ImportFilesParams = { ...params };
	normalizedParams[IMPORT_FILES_COMMAND_OPTIONS.PROJECT] = quoteString(projectFolder);
	normalizedParams[IMPORT_FILES_COMMAND_OPTIONS.AUTH_ID] = authId;

	const paths = normalizedParams[IMPORT_FILES_COMMAND_OPTIONS.PATHS];
	if (paths !== undefined) {
		if (Array.isArray(paths)) {
			normalizedParams[IMPORT_FILES_COMMAND_OPTIONS.PATHS] = paths.map(quoteString).join(' ');
		} else if (typeof paths === 'string') {
			normalizedParams[IMPORT_FILES_COMMAND_OPTIONS.PATHS] = quoteString(paths);
		}
	}

	if (normalizedParams[IMPORT_FILES_COMMAND_OPTIONS.EXCLUDE_PROPERTIES]) {
		normalizedParams[IMPORT_FILES_COMMAND_OPTIONS.EXCLUDE_PROPERTIES] = '';
	} else {
		delete normalizedParams[IMPORT_FILES_COMMAND_OPTIONS.EXCLUDE_PROPERTIES];
	}

	const calledFromCompareFiles = !!normalizedParams[IMPORT_FILES_COMMAND_OPTIONS.CALLED_FROM_COMPARE_FILES];
	const calledFromUpdate = !!normalizedParams[IMPORT_FILES_COMMAND_OPTIONS.CALLED_FROM_UPDATE];
	delete normalizedParams[IMPORT_FILES_COMMAND_OPTIONS.CALLED_FROM_COMPARE_FILES];
	delete normalizedParams[IMPORT_FILES_COMMAND_OPTIONS.CALLED_FROM_UPDATE];

	return {
		params: normalizedParams,
		calledFromCompareFiles,
		calledFromUpdate,
	};
}

export function addCompareFilesImportFlag(params: ImportFilesParams): ImportFilesParams {
	return {
		...params,
		[IMPORT_FILES_COMMAND_OPTIONS.ALLOW_FOR_SUITEAPPS]: '',
	};
}

export function addImportCallMetadata(
	params: ImportFilesParams,
	calledFromCompareFiles: boolean,
	calledFromUpdate: boolean
): ImportFilesParams {
	const metadataParams: ImportFilesParams = { ...params };
	if (calledFromCompareFiles) {
		metadataParams[IMPORT_FILES_COMMAND_OPTIONS.CALLED_FROM_COMPARE_FILES] = true;
	}
	if (calledFromUpdate) {
		metadataParams[IMPORT_FILES_COMMAND_OPTIONS.CALLED_FROM_UPDATE] = true;
	}
	return metadataParams;
}

function quoteString(value: string): string {
	return `"${value}"`;
}

export async function executeImportFilesCommand(
	input: ImportFilesExecutionInput
): Promise<FileCommandOperationResult> {
	return executeImportFiles(input);
}
