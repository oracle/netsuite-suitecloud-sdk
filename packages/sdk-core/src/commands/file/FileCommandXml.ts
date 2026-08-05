/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { parseStringPromise } from 'xml2js';
import type {
	ImportFileResult,
	ImportFilesResult,
} from '../../api/file/FileCommand';

export type FileCabinetFolderTree = {
	name: string;
	folders: FileCabinetFolderTree[];
	files: string[];
};

export function buildImportFilesXml(filePaths: string[], excludeProperties: boolean): string {
	const filesXml = filePaths
		.map((filePath) => {
			const escapedFilePath = escapeXml(filePath);
			return [
				'<file>',
				`<path>${escapedFilePath}</path>`,
				'<content>true</content>',
				`<attributes>${excludeProperties ? 'false' : 'true'}</attributes>`,
				'</file>',
			].join('');
		})
		.join('');

	return `<media><files>${filesXml}</files></media>`;
}

export async function parseImportStatus(statusXml: string): Promise<ImportFilesResult> {
	const parsedStatus = await parseStringPromise(statusXml, { explicitArray: false, trim: true });
	const resultNodes = ensureArray(parsedStatus?.status?.result);
	const results = resultNodes.map((resultNode) => ({
		path: asString(resultNode?.path),
		loaded: asBoolean(resultNode?.loaded),
		message: asString(resultNode?.message),
	}));
	return { results };
}

export function collectFiles(parentPath: string, folders: FileCabinetFolderTree[]): string[] {
	const files: string[] = [];
	for (const folder of folders) {
		const folderPath = `${parentPath}/${folder.name}`;
		folder.files.forEach((fileName) => files.push(`${folderPath}/${fileName}`));
		files.push(...collectFiles(folderPath, folder.folders));
	}
	return files;
}

export function collectFolders(parentPath: string, folders: FileCabinetFolderTree[]): string[] {
	const folderPaths: string[] = [];
	for (const folder of folders) {
		const folderPath = `${parentPath}/${folder.name}`;
		folderPaths.push(folderPath);
		folderPaths.push(...collectFolders(folderPath, folder.folders));
	}
	return folderPaths;
}

export async function parseMediaFolders(mediaXml: string): Promise<FileCabinetFolderTree[]> {
	const parsedMedia = await parseStringPromise(mediaXml, { explicitArray: false, trim: true });
	return ensureArray(parsedMedia?.media?.folder)
		.map(normalizeFolderTree)
		.filter((folder) => !!folder.name);
}

export async function extractMediaXml(ideResponseXml: string): Promise<string | undefined> {
	const parsedIdeResponse = await parseStringPromise(ideResponseXml, { explicitArray: false, trim: true });
	const allStrings = collectStringValues(parsedIdeResponse);

	for (const stringValue of allStrings) {
		const value = stringValue.trim();
		if (value.includes('<media') && value.includes('</media>')) {
			return value;
		}
		if (value.includes('&lt;media') && value.includes('&lt;/media&gt;')) {
			return decodeXmlEntities(value);
		}
	}
	return undefined;
}

export async function extractIdeErrorMessage(ideResponseXml: string): Promise<string | undefined> {
	const parsedIdeResponse = await parseStringPromise(ideResponseXml, { explicitArray: false, trim: true });
	const errorValue = asString(parsedIdeResponse?.ide?.error);
	return errorValue && errorValue.trim() ? decodeXmlEntities(errorValue.trim()) : undefined;
}

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function normalizeFolderTree(folderNode: unknown): FileCabinetFolderTree {
	if (!isRecord(folderNode)) {
		return { name: '', folders: [], files: [] };
	}

	const name = asString(folderNode.name);
	const folders = ensureArray(folderNode.folder).map(normalizeFolderTree).filter((folder) => !!folder.name);
	const files = ensureArray(folderNode.file)
		.map((fileNode) => (isRecord(fileNode) ? asString(fileNode.name) : ''))
		.filter(Boolean);

	return { name, folders, files };
}

function asBoolean(value: unknown): boolean {
	if (typeof value === 'boolean') {
		return value;
	}
	return typeof value === 'string' && value.trim().toLowerCase() === 'true';
}

function collectStringValues(value: unknown): string[] {
	if (typeof value === 'string') {
		return [value];
	}
	if (Array.isArray(value)) {
		return value.flatMap(collectStringValues);
	}
	if (isRecord(value)) {
		return Object.values(value).flatMap(collectStringValues);
	}
	return [];
}

function decodeXmlEntities(value: string): string {
	return value
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'");
}

function ensureArray<T>(value: T | T[] | undefined): T[] {
	if (value === undefined) {
		return [];
	}
	return Array.isArray(value) ? value : [value];
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function asString(value: unknown): string {
	if (typeof value === 'string') {
		return value;
	}
	if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
		return value[0];
	}
	return '';
}
