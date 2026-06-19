/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export const FILE_CREATE_STATUS = {
	SUCCESS: 'SUCCESS',
	ERROR: 'ERROR',
} as const;

type FileCreateStatus = typeof FILE_CREATE_STATUS[keyof typeof FILE_CREATE_STATUS];

export type FileCreateResult = {
	status: FileCreateStatus;
	data?: {
		createdFileAbsolutePath: string;
	};
	errorMessages?: string[];
};

type ExecuteCreateFileInput = {
	projectFolder: string;
	path: string;
	type?: string;
	module?: string;
};

const MANIFEST_RELATIVE_PATH = 'src/manifest.xml';
const SUITE_SCRIPTS_ROOT = '/SuiteScripts';
const SUITE_APPS_ROOT = '/SuiteApps';
const WEB_HOSTING_ROOT = '/Web Site Hosting Files';

export async function executeCreateFile(input: ExecuteCreateFileInput): Promise<FileCreateResult> {
	try {
		const normalizedPath = normalizeSuiteScriptPath(input.path);
		const manifest = await readManifest(join(input.projectFolder, MANIFEST_RELATIVE_PATH));
		validateFileCabinetPath(normalizedPath, manifest);

		const fileAbsolutePath = join(input.projectFolder, 'src', 'FileCabinet', normalizedPath.replace(/^\//, ''));
		await assertFileDoesNotExist(fileAbsolutePath);
		await mkdir(dirname(fileAbsolutePath), { recursive: true });

		const content = generateSuiteScriptContent(input.type, input.module);
		await writeFile(fileAbsolutePath, content, 'utf8');

		return {
			status: FILE_CREATE_STATUS.SUCCESS,
			data: { createdFileAbsolutePath: fileAbsolutePath },
		};
	} catch (error: unknown) {
		return {
			status: FILE_CREATE_STATUS.ERROR,
			errorMessages: [toErrorMessage(error)],
		};
	}
}

function normalizeSuiteScriptPath(filePath: string): string {
	const normalized = String(filePath || '').trim().replace(/^"|"$/g, '');
	return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

async function readManifest(manifestPath: string): Promise<{ projectType: string; appId?: string }> {
	const xml = await readFile(manifestPath, 'utf8');
	const projectType = extractFirstMatch(xml, /projecttype\s*=\s*"([^"]+)"/i)?.toUpperCase() || '';
	const publisherId = extractFirstMatch(xml, /<publisherid>([^<]+)<\/publisherid>/i)?.trim();
	const projectId = extractFirstMatch(xml, /<projectid>([^<]+)<\/projectid>/i)?.trim();
	const appId = publisherId && projectId ? `${publisherId}.${projectId}` : undefined;
	return { projectType, appId };
}

function validateFileCabinetPath(pathValue: string, manifest: { projectType: string; appId?: string }): void {
	if (pathValue.endsWith('/')) {
		throw new Error(`Invalid path "${pathValue}".`);
	}

	if (pathValue.startsWith(WEB_HOSTING_ROOT + '/')) {
		return;
	}

	if (manifest.projectType === 'SUITEAPP') {
		const expectedPrefix = `${SUITE_APPS_ROOT}/${manifest.appId || ''}/`;
		if (!manifest.appId || !pathValue.startsWith(expectedPrefix)) {
			throw new Error(`Invalid path "${pathValue}". For SuiteApp projects, path must start with "${expectedPrefix}".`);
		}
		return;
	}

	if (!pathValue.startsWith(SUITE_SCRIPTS_ROOT + '/')) {
		throw new Error(`Invalid path "${pathValue}". Path must start with "${SUITE_SCRIPTS_ROOT}/" or "${WEB_HOSTING_ROOT}/".`);
	}
}

async function assertFileDoesNotExist(filePath: string): Promise<void> {
	try {
		await stat(filePath);
		throw new Error(`The SuiteScript file already exists in "${dirname(filePath)}".`);
	} catch (error: unknown) {
		const code = (error as NodeJS.ErrnoException)?.code;
		if (code === 'ENOENT') {
			return;
		}
		throw error;
	}
}

function generateSuiteScriptContent(type?: string, module?: string): string {
	const modules = normalizeModuleList(module);
	const deps = modules.map((moduleName) => `'${moduleName}'`).join(', ');
	const args = modules.map(toModuleAlias).join(', ');
	const scriptTypeLine = type && !/^custommodule$/i.test(type) ? ` * @NScriptType ${type}\n` : '';

	return `/**\n * @NApiVersion 2.x\n${scriptTypeLine} */\ndefine([${deps}], (${args}) => {\n\treturn {};\n});\n`;
}

function normalizeModuleList(module?: string): string[] {
	if (!module) {
		return [];
	}
	return String(module)
		.split(' ')
		.map((value) => value.replace(/^"|"$/g, '').trim())
		.filter(Boolean);
}

function extractFirstMatch(input: string, pattern: RegExp): string | undefined {
	const matchResult = input.match(pattern);
	return matchResult?.[1];
}

function toModuleAlias(moduleId: string): string {
	return moduleId.split('/').pop()?.replace(/[^a-zA-Z0-9_$]/g, '') || 'moduleRef';
}

function toErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	return String(error);
}
