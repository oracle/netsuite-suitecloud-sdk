/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { access, readFile, readdir, stat } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { parseStringPromise } from 'xml2js';
import type { ArchiveEntry } from '../../../services/archive/ZipArchive';
import { PROJECT_ARCHIVE } from '../../../services/translation/TranslationKeys';
import { translationService } from '../../../services/translation/TranslationService';

const DEPLOY_FILENAME = 'deploy.xml';
const DEPLOY_FILENAME_ROOT = 'deploy';

const MANIFEST_FILENAME = 'manifest.xml';
const MANIFEST_FILENAME_ROOT = 'manifest';

const APPLICATION_FILENAME = 'application.xml';
const INSTALLATION_PREFERENCES_FOLDER = 'InstallationPreferences';
const SDF_INSTALLATION_SCRIPT_ROOT = 'sdfinstallationscript';
const PROJECT_TYPE_ACP = 'ACCOUNTCUSTOMIZATION';

type XmlValue = Record<string, any>;

export type ProjectManifestData = {
	projectType: string;
	projectName: string;
	publisherId: string;
	projectId: string;
	projectVersion: string;
};

export type ProjectArchivePlan = {
	manifest: ProjectManifestData;
	entries: ArchiveEntry[];
};

export async function createPackageArchivePlan(projectFolder: string): Promise<ProjectArchivePlan> {
	const [manifestRoot, deployRoot] = await Promise.all([
		readRequiredXmlRoot(projectFolder, MANIFEST_FILENAME, MANIFEST_FILENAME_ROOT),
		readRequiredXmlRoot(projectFolder, DEPLOY_FILENAME, DEPLOY_FILENAME_ROOT),
	]);
	await validateOptionalApplicationFile(projectFolder);

	const manifest = readManifestData(manifestRoot);
	const entries: ArchiveEntry[] = [];
	const seen = new Set<string>();
	addEntry(entries, seen, DEPLOY_FILENAME);
	addEntry(entries, seen, MANIFEST_FILENAME);
	if (await pathExists(join(projectFolder, APPLICATION_FILENAME))) {
		addEntry(entries, seen, APPLICATION_FILENAME);
	}

	if (manifest.projectType === PROJECT_TYPE_ACP) {
		await addDeployPaths(projectFolder, getPathValues(deployRoot.configuration), entries, seen);
	} else {
		await addFolderContents(projectFolder, INSTALLATION_PREFERENCES_FOLDER, entries, seen);
		await addInstallationScripts(projectFolder, deployRoot, entries, seen);
	}

	await addDeployPaths(projectFolder, getPathValues(deployRoot.files), entries, seen);
	await addDeployPaths(projectFolder, getPathValues(deployRoot.objects), entries, seen);
	await addDeployPaths(projectFolder, getPathValues(deployRoot.translationimports), entries, seen);

	return { manifest, entries };
}

async function readRequiredXmlRoot(projectFolder: string, filename: string, expectedRoot: string): Promise<XmlValue> {
	const filepath = join(projectFolder, filename);
	let contents: string;
	try {
		contents = await readFile(filepath, 'utf8');
	} catch (error: any) {
		if (error?.code === 'ENOENT') {
			throw new Error(
				translationService.getMessage(PROJECT_ARCHIVE.ERROR.FILE_MISSING, filename, projectFolder)
			);
		}
		throw error;
	}

	let parsed: XmlValue;
	try {
		parsed = await parseStringPromise(contents, { explicitArray: false, trim: true, explicitRoot: true });
	} catch (error: any) {
		throw new Error(
			translationService.getMessage(PROJECT_ARCHIVE.ERROR.XML_INVALID, filename, error?.message || String(error))
		);
	}
	if (!parsed || typeof parsed !== 'object' || !Object.prototype.hasOwnProperty.call(parsed, expectedRoot)) {
		throw new Error(
			translationService.getMessage(PROJECT_ARCHIVE.ERROR.XML_ROOT_INVALID, filename, expectedRoot)
		);
	}
	return parsed[expectedRoot] && typeof parsed[expectedRoot] === 'object' ? parsed[expectedRoot] : {};
}

async function validateOptionalApplicationFile(projectFolder: string): Promise<void> {
	const filepath = join(projectFolder, APPLICATION_FILENAME);
	if (!(await pathExists(filepath))) {
		return;
	}
	try {
		await parseStringPromise(await readFile(filepath, 'utf8'), { explicitArray: false, trim: true });
	} catch (error: any) {
		throw new Error(
			translationService.getMessage(
				PROJECT_ARCHIVE.ERROR.XML_INVALID,
				APPLICATION_FILENAME,
				error?.message || String(error)
			)
		);
	}
}

function readManifestData(manifest: XmlValue): ProjectManifestData {
	return {
		projectType: asText(manifest.$?.projecttype),
		projectName: asText(manifest.projectname),
		publisherId: asText(manifest.publisherid),
		projectId: asText(manifest.projectid),
		projectVersion: asText(manifest.projectversion),
	};
}

async function addDeployPaths(
	projectFolder: string,
	paths: string[],
	entries: ArchiveEntry[],
	seen: Set<string>
): Promise<void> {
	for (const deployPath of paths) {
		const projectPath = toProjectRelativePath(deployPath);
		if (!projectPath) {
			continue;
		}
		if (projectPath.endsWith('/*')) {
			await addFolderContents(projectFolder, projectPath.slice(0, -2), entries, seen);
		} else if (await isRegularFile(join(projectFolder, ...projectPath.split('/')))) {
			addEntry(entries, seen, projectPath);
		}
	}
}

async function addInstallationScripts(
	projectFolder: string,
	deploy: XmlValue,
	entries: ArchiveEntry[],
	seen: Set<string>
): Promise<void> {
	for (const run of asArray(deploy.run)) {
		for (const script of asArray(run?.script)) {
			const scriptPath = toProjectRelativePath(asText(script?.path));
			if (
				!scriptPath ||
				scriptPath.endsWith('/*') ||
				!(await isRegularFile(join(projectFolder, ...scriptPath.split('/'))))
			) {
				continue;
			}

			addEntry(entries, seen, scriptPath);
			try {
				const parsed = await parseStringPromise(
					await readFile(join(projectFolder, ...scriptPath.split('/')), 'utf8'),
					{
						explicitArray: false,
						trim: true,
					}
				);
				const rootTag = getRootTag(parsed);
				if (rootTag?.name !== SDF_INSTALLATION_SCRIPT_ROOT) {
					continue;
				}
				const scriptFile = getReferenceValue(asText(rootTag.value?.scriptfile));
				if (scriptFile) {
					await addDeployPaths(
						projectFolder,
						[`~/FileCabinet${scriptFile.startsWith('/') ? '' : '/'}${scriptFile}`],
						entries,
						seen
					);
				}
			} catch {
				// Java packaging keeps the installation script and skips an unreadable or invalid referenced file.
			}
		}
	}
}

async function addFolderContents(
	projectFolder: string,
	relativeFolder: string,
	entries: ArchiveEntry[],
	seen: Set<string>
): Promise<void> {
	if (!relativeFolder || hasUnsafePathSegment(relativeFolder)) {
		return;
	}
	const folder = resolve(projectFolder, ...relativeFolder.split('/'));
	if (!(await isDirectory(folder))) {
		return;
	}
	const children = await readdir(folder, { withFileTypes: true });
	children.sort((left, right) => left.name.localeCompare(right.name));
	for (const child of children) {
		const fullPath = resolve(folder, child.name);
		const entryPath = relative(projectFolder, fullPath).split(sep).join('/');
		if (child.isDirectory()) {
			addEntry(entries, seen, entryPath, true);
			await addFolderContents(projectFolder, entryPath, entries, seen);
		} else if (child.isFile()) {
			addEntry(entries, seen, entryPath);
		}
	}
}

function getPathValues(section: unknown): string[] {
	return asArray(section)
		.filter(isXmlValue)
		.flatMap((item) => asArray(item.path).map(asText))
		.filter(Boolean);
}

function isXmlValue(value: unknown): value is XmlValue {
	return !!value && typeof value === 'object' && !Array.isArray(value);
}

function getRootTag(value: unknown): { name: string; value: XmlValue } | undefined {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return undefined;
	}
	const rootEntries = Object.entries(value);
	if (rootEntries.length !== 1 || !rootEntries[0][1] || typeof rootEntries[0][1] !== 'object') {
		return undefined;
	}
	return { name: rootEntries[0][0], value: rootEntries[0][1] as XmlValue };
}

function getReferenceValue(value: string): string {
	return value.startsWith('[') && value.endsWith(']') ? value.slice(1, -1) : value;
}

function toProjectRelativePath(deployPath: string): string | undefined {
	const normalized = deployPath.trim().replace(/\\/g, '/');
	if (!normalized.startsWith('~/') || normalized === '~/') {
		return undefined;
	}
	const projectPath = normalized.slice(2).replace(/\/{2,}/g, '/').replace(/\/$/, '');
	return !projectPath || hasUnsafePathSegment(projectPath) ? undefined : projectPath;
}

function hasUnsafePathSegment(projectPath: string): boolean {
	return projectPath.split('/').some((segment) => !segment || segment === '.' || segment === '..');
}

function addEntry(entries: ArchiveEntry[], seen: Set<string>, path: string, isDirectory = false): void {
	const key = isDirectory ? `${path.replace(/\/$/, '')}/` : path.replace(/\/$/, '');
	if (!seen.has(key)) {
		entries.push({ path: key, isDirectory });
		seen.add(key);
	}
}

function asArray<T = any>(value: T | T[] | undefined | null): T[] {
	return value === undefined || value === null ? [] : Array.isArray(value) ? value : [value];
}

function asText(value: unknown): string {
	if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
		return String(value).trim();
	}
	if (value && typeof value === 'object' && '_' in value) {
		return asText((value as { _: unknown })._);
	}
	return '';
}

async function pathExists(filepath: string): Promise<boolean> {
	try {
		await access(filepath);
		return true;
	} catch {
		return false;
	}
}

async function isDirectory(filepath: string): Promise<boolean> {
	try {
		return (await stat(filepath)).isDirectory();
	} catch {
		return false;
	}
}

async function isRegularFile(filepath: string): Promise<boolean> {
	try {
		return (await stat(filepath)).isFile();
	} catch {
		return false;
	}
}
