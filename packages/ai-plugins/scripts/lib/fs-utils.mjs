/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

export async function ensureDir(dirPath) {
	await fs.mkdir(dirPath, { recursive: true });
}

export async function pathExists(targetPath) {
	try {
		await fs.access(targetPath);
		return true;
	} catch {
		return false;
	}
}

export async function removeIfExists(targetPath) {
	await fs.rm(targetPath, { recursive: true, force: true });
}

export async function copyFileStrict(sourcePath, destinationPath) {
	await ensureDir(path.dirname(destinationPath));
	await fs.copyFile(sourcePath, destinationPath);
}

export async function writeJson(targetPath, value) {
	await ensureDir(path.dirname(targetPath));
	await fs.writeFile(targetPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export async function listRelativeFiles(rootDir) {
	const results = [];

	async function walk(currentDir) {
		const entries = await fs.readdir(currentDir, { withFileTypes: true });

		for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
			const absolutePath = path.join(currentDir, entry.name);
			const relativePath = path.relative(rootDir, absolutePath);

			if (entry.isDirectory()) {
				await walk(absolutePath);
				continue;
			}

			if (entry.isFile()) {
				results.push(relativePath.split(path.sep).join('/'));
			}
		}
	}

	await walk(rootDir);
	return results;
}
