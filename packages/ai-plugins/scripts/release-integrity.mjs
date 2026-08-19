/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

function normalizeRelativePath(filePath) {
	return filePath.split(path.sep).join('/');
}

function comparePaths(left, right) {
	return left < right ? -1 : left > right ? 1 : 0;
}

async function listRegularFiles(rootDir, currentDir = rootDir) {
	const entries = await fs.readdir(currentDir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const entryPath = path.join(currentDir, entry.name);
		if (entry.isDirectory()) {
			files.push(...await listRegularFiles(rootDir, entryPath));
		} else if (entry.isFile()) {
			const relativePath = normalizeRelativePath(path.relative(rootDir, entryPath));
			if (relativePath.includes('\n') || relativePath.includes('\r')) throw new Error(`Unsupported newline in file path: ${relativePath}`);
			files.push(relativePath);
		}
	}
	return files.sort(comparePaths);
}

export async function createIntegrityManifest(rootDir) {
	const resolvedRoot = path.resolve(rootDir);
	const files = await listRegularFiles(resolvedRoot);
	return Promise.all(files.map(async (filePath) => ({
		path: filePath,
		sha256: createHash('sha256').update(await fs.readFile(path.join(resolvedRoot, filePath))).digest('hex'),
	})));
}

export function serializeIntegrityManifest(entries) {
	return entries.map((entry) => `${entry.sha256}  ${entry.path}\n`).join('');
}

export function parseIntegrityManifest(contents) {
	if (contents.length === 0 || !contents.endsWith('\n')) {
		throw new Error('Integrity manifest must contain newline-terminated entries');
	}

	const entries = contents.trimEnd().split('\n').map((line) => {
		const match = /^([a-f0-9]{64})  (.+)$/.exec(line);
		if (!match || match[2].startsWith('/') || match[2].split('/').includes('..') || match[2].includes('\\')) {
			throw new Error(`Invalid integrity manifest entry: ${line}`);
		}
		return { sha256: match[1], path: match[2] };
	});

	const paths = entries.map((entry) => entry.path);
	if (new Set(paths).size !== paths.length || paths.join('\n') !== [...paths].sort(comparePaths).join('\n')) {
		throw new Error('Integrity manifest entries must be unique and sorted');
	}
	return entries;
}

export async function writeIntegrityManifest(rootDir, manifestPath) {
	const entries = await createIntegrityManifest(rootDir);
	await fs.mkdir(path.dirname(manifestPath), { recursive: true });
	await fs.writeFile(manifestPath, serializeIntegrityManifest(entries), 'utf8');
	return entries;
}

export async function verifyIntegrityManifest(rootDir, manifestPath) {
	const expected = parseIntegrityManifest(await fs.readFile(manifestPath, 'utf8'));
	const actual = await createIntegrityManifest(rootDir);
	const expectedByPath = new Map(expected.map((entry) => [entry.path, entry.sha256]));
	const actualByPath = new Map(actual.map((entry) => [entry.path, entry.sha256]));
	const errors = [];

	for (const entry of expected) {
		if (!actualByPath.has(entry.path)) errors.push(`missing file: ${entry.path}`);
		else if (actualByPath.get(entry.path) !== entry.sha256) errors.push(`hash mismatch: ${entry.path}`);
	}
	for (const entry of actual) {
		if (!expectedByPath.has(entry.path)) errors.push(`unexpected file: ${entry.path}`);
	}
	if (errors.length > 0) throw new Error(`Release integrity verification failed:\n${errors.join('\n')}`);
	return actual;
}

async function main() {
	const [command, rootDir, manifestPath] = process.argv.slice(2);
	if (!['create', 'verify'].includes(command) || !rootDir || !manifestPath || process.argv.length !== 5) {
		throw new Error('Usage: node release-integrity.mjs <create|verify> <root-dir> <manifest-path>');
	}
	if (command === 'create') await writeIntegrityManifest(rootDir, manifestPath);
	else await verifyIntegrityManifest(rootDir, manifestPath);
}

if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((error) => {
		console.error(error.message);
		process.exitCode = 1;
	});
}
