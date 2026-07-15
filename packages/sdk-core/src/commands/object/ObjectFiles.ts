/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { access, copyFile, mkdir, readFile, readdir, rm } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { dirname, join } from 'node:path';

import { assertCreatablePathWithin, assertRealPathWithin } from '../../services/project/ProjectPathResolver';

const OBJECTS_FOLDER_NAME = 'Objects';
const STATUS_XML_FILENAME = 'status.xml';

export async function findObjectFileByScriptId(
	projectFolder: string,
	scriptId: string,
	preferredFolder?: string
): Promise<string | undefined> {
	const searchRoots = [preferredFolder, join(projectFolder, OBJECTS_FOLDER_NAME)]
		.filter((rootPath): rootPath is string => !!rootPath)
		.filter((rootPath, index, array) => array.indexOf(rootPath) === index);

	for (const rootPath of searchRoots) {
		const objectFile = await findFileByName(rootPath, `${scriptId}.xml`);
		if (objectFile) {
			return objectFile;
		}
	}
	return undefined;
}

export async function findFileByName(rootFolder: string, filename: string): Promise<string | undefined> {
	try {
		await access(rootFolder, fsConstants.F_OK);
	} catch {
		return undefined;
	}

	const queue = [rootFolder];
	while (queue.length > 0) {
		const currentFolder = queue.shift() as string;
		for (const entry of await readdir(currentFolder, { withFileTypes: true })) {
			const entryPath = join(currentFolder, entry.name);
			if (entry.isDirectory()) {
				queue.push(entryPath);
			} else if (entry.isFile() && entry.name === filename) {
				return entryPath;
			}
		}
	}
	return undefined;
}

export async function copyDirectoryContents(sourceFolder: string, destinationFolder: string): Promise<string[]> {
	const copiedFiles: string[] = [];
	for (const entry of await readdir(sourceFolder, { withFileTypes: true })) {
		const sourcePath = await assertRealPathWithin(sourceFolder, join(sourceFolder, entry.name));
		const destinationPath = await assertCreatablePathWithin(destinationFolder, join(destinationFolder, entry.name));
		if (entry.isDirectory()) {
			await mkdir(destinationPath, { recursive: true });
			copiedFiles.push(...(await copyDirectoryContents(sourcePath, destinationPath)));
		} else if (entry.isFile() && entry.name.toLowerCase() !== STATUS_XML_FILENAME) {
			await mkdir(dirname(destinationPath), { recursive: true });
			await copyFile(sourcePath, destinationPath);
			copiedFiles.push(destinationPath);
		}
	}
	return copiedFiles;
}

export async function readOptionalFile(filePath: string): Promise<string | undefined> {
	try {
		return await readFile(filePath, 'utf8');
	} catch {
		return undefined;
	}
}

export function removeDirectory(directoryPath: string): Promise<void> {
	return rm(directoryPath, { recursive: true, force: true });
}
