/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

import { ErrorCodes, SdkError } from '../../../api/types/SdkError';
import { TranslationKeys } from '../../../services/translation/TranslationKeys';
import { translationService } from '../../../services/translation/TranslationService';
import { generateSuiteScriptTemplate } from '../../../templates/SuiteScriptTemplateService';

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
	module?: string | string[];
};

const MANIFEST_RELATIVE_PATH = 'manifest.xml';
const SUITE_SCRIPTS_ROOT = '/SuiteScripts';
const SUITE_APPS_ROOT = '/SuiteApps';
const WEB_HOSTING_ROOT = '/Web Site Hosting Files';

export async function executeCreateFile(input: ExecuteCreateFileInput): Promise<FileCreateResult> {
	try {
		const normalizedPath = normalizeSuiteScriptPath(input.path);
		const manifest = await readManifest(join(input.projectFolder, MANIFEST_RELATIVE_PATH));
		validateFileCabinetPath(normalizedPath, manifest);

		const fileCabinetRoot = resolve(input.projectFolder, 'FileCabinet');
		const fileAbsolutePath = resolveFileCabinetPath(fileCabinetRoot, normalizedPath);
		await assertFileDoesNotExist(fileAbsolutePath);
		const content = await generateSuiteScriptTemplate(input.type, input.module);

		await mkdir(dirname(fileAbsolutePath), { recursive: true });
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
	const normalized = String(filePath || '').trim().replace(/^"|"$/g, '').replaceAll('\\', '/');
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
	if (pathValue.split('/').includes('..')) {
		throw pathOutsideFileCabinetError(pathValue);
	}

	const requiredFolder =
		manifest.projectType === 'SUITEAPP'
			? `${SUITE_APPS_ROOT}/${manifest.appId || ''}`
			: SUITE_SCRIPTS_ROOT;
	const hasRequiredAppId = manifest.projectType !== 'SUITEAPP' || Boolean(manifest.appId);
	const isValidProjectPath = hasRequiredAppId && pathValue.startsWith(`${requiredFolder}/`);
	const isValidWebHostingPath = pathValue.startsWith(`${WEB_HOSTING_ROOT}/`);

	if (pathValue.endsWith('/') || (!isValidProjectPath && !isValidWebHostingPath)) {
		throw invalidFileCabinetPathError(pathValue, requiredFolder);
	}
}

function invalidFileCabinetPathError(pathValue: string, requiredFolder: string): Error {
	return new SdkError(
		translationService.getMessage(
			TranslationKeys.FILE_CREATE.ERROR.INVALID_FILE_CABINET_PATH,
			pathValue,
			requiredFolder
		),
		ErrorCodes.INVALID_FILE_CABINET_PATH
	);
}

function pathOutsideFileCabinetError(pathValue: string): Error {
	return new SdkError(
		translationService.getMessage(TranslationKeys.FILE_CREATE.ERROR.PATH_OUTSIDE_FILE_CABINET, pathValue),
		ErrorCodes.PATH_OUTSIDE_FILE_CABINET
	);
}

function resolveFileCabinetPath(fileCabinetRoot: string, pathValue: string): string {
	const resolvedPath = resolve(fileCabinetRoot, pathValue.replace(/^\/+/, ''));
	const relativePath = relative(fileCabinetRoot, resolvedPath);
	const escapesFileCabinet =
		relativePath === '' ||
		relativePath === '..' ||
		relativePath.startsWith(`..${sep}`) ||
		isAbsolute(relativePath);

	if (escapesFileCabinet) {
		throw pathOutsideFileCabinetError(pathValue);
	}
	return resolvedPath;
}

async function assertFileDoesNotExist(filePath: string): Promise<void> {
	try {
		await stat(filePath);
		throw new SdkError(
			translationService.getMessage(TranslationKeys.FILE_CREATE.ERROR.FILE_ALREADY_EXISTS, dirname(filePath)),
			ErrorCodes.FILE_ALREADY_EXISTS
		);
	} catch (error: unknown) {
		const code = (error as NodeJS.ErrnoException)?.code;
		if (code === 'ENOENT') {
			return;
		}
		throw error;
	}
}

function extractFirstMatch(input: string, pattern: RegExp): string | undefined {
	return input.match(pattern)?.[1];
}

function toErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
