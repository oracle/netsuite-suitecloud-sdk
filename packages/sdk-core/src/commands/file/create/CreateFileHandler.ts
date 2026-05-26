/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import path from 'path';

const JS_EXTENSION = '.js';

export const CREATE_FILE_COMMAND_OPTIONS = {
	MODULE: 'module',
	PATH: 'path',
	PROJECT: 'project',
	TYPE: 'type',
} as const;

type CreateFileParams = {
	module?: string | string[];
	path?: string;
	project?: string;
	type?: string;
	parentPath?: string;
	name?: string;
	[key: string]: unknown;
};

function quoteString(value: string): string {
	return `"${value}"`;
}

function unquoteString(value: string): string {
	return value.replace(/^"(.*)"$/, '$1');
}

export function normalizeCreateFileParams(params: CreateFileParams, projectFolder: string, runInInteractiveMode: boolean): CreateFileParams {
	const normalizedParams: CreateFileParams = { ...params };
	normalizedParams[CREATE_FILE_COMMAND_OPTIONS.PROJECT] = quoteString(projectFolder);

	if (runInInteractiveMode && normalizedParams.parentPath && normalizedParams.name) {
		normalizedParams[CREATE_FILE_COMMAND_OPTIONS.PATH] = `${normalizedParams.parentPath}${normalizedParams.name}`;
	}

	if (normalizedParams[CREATE_FILE_COMMAND_OPTIONS.PATH]) {
		let filePath = String(normalizedParams[CREATE_FILE_COMMAND_OPTIONS.PATH]);
		if (!filePath.endsWith(JS_EXTENSION)) {
			filePath = `${filePath}${JS_EXTENSION}`;
		}
		normalizedParams[CREATE_FILE_COMMAND_OPTIONS.PATH] = quoteString(filePath);
	}

	if (normalizedParams[CREATE_FILE_COMMAND_OPTIONS.MODULE]) {
		const modules = normalizedParams[CREATE_FILE_COMMAND_OPTIONS.MODULE];
		if (Array.isArray(modules)) {
			normalizedParams[CREATE_FILE_COMMAND_OPTIONS.MODULE] = modules.map((moduleId) => quoteString(String(moduleId))).join(' ');
		} else {
			normalizedParams[CREATE_FILE_COMMAND_OPTIONS.MODULE] = quoteString(String(modules));
		}
	}

	delete normalizedParams.parentPath;
	delete normalizedParams.name;

	return normalizedParams;
}

export function buildCreateFileResultData(projectFolder: string, normalizedParams: CreateFileParams): {
	suiteScriptFileAbsolutePath: string;
	modulesSummary?: string;
} {
	const filePath = String(normalizedParams[CREATE_FILE_COMMAND_OPTIONS.PATH] || '');
	const suiteScriptFileAbsolutePath = path.join(projectFolder, 'src', unquoteString(filePath));
	const modules = normalizedParams[CREATE_FILE_COMMAND_OPTIONS.MODULE];

	if (!modules) {
		return { suiteScriptFileAbsolutePath };
	}

	return {
		suiteScriptFileAbsolutePath,
		modulesSummary: String(modules).split(' ').join(', '),
	};
}
