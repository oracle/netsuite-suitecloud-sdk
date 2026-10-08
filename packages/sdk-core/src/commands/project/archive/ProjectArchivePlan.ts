/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { parseStringPromise } from 'xml2js';
import type { ArchiveEntry } from '../../../services/archive/ZipArchive';
import { inspectControlFilesAndGetProjectDescription } from '../../../services/project/ProjectControlService';
import type { DeployGroup, ProjectManifest } from '../../../services/project/SuiteCloudControlFileTypes';
import { FOLDERS, PROJECT_TYPES, CONTROL_FILE_FIELDS } from '../../../services/project/SuiteCloudProjectConstants';
import { parseXmlDocument } from '../../../services/project/xml/XmlControlFileParser';

type XmlValue = Record<string, any>;

export type ProjectManifestData = ProjectManifest;

export type ProjectArchivePlan = {
	manifest: ProjectManifestData;
	entries: ArchiveEntry[];
};

export async function createPackageArchivePlan(projectFolder: string): Promise<ProjectArchivePlan> {
	const { manifest, controlFiles, deployGroups } = await inspectControlFilesAndGetProjectDescription(projectFolder);
	const entries: ArchiveEntry[] = [];
	const seen = new Set<string>();
	addEntry(entries, seen, controlFiles.deploy.filename);
	addEntry(entries, seen, controlFiles.manifest.filename);
	if (controlFiles.application) {
		const applicationFileName = controlFiles.application.filename

		// check for valid "application.xml" content
		parseXmlDocument(await readFile(join(projectFolder, applicationFileName), 'utf8'), applicationFileName);
		addEntry(entries, seen, controlFiles.application.filename);
	}

	if (manifest.projectType === PROJECT_TYPES.ACP) {
		await addDeployPaths(projectFolder, getGroupPaths(deployGroups, CONTROL_FILE_FIELDS.CONFIGURATION), entries, seen);
	} else {
		await addFolderContents(projectFolder, FOLDERS.INSTALLATION_PREFERENCES, entries, seen);
		await addInstallationScripts(projectFolder, deployGroups, entries, seen);
	}

	await addDeployPaths(projectFolder, getGroupPaths(deployGroups, CONTROL_FILE_FIELDS.FILES), entries, seen);
	await addDeployPaths(projectFolder, getGroupPaths(deployGroups, CONTROL_FILE_FIELDS.OBJECTS), entries, seen);
	await addDeployPaths(projectFolder, getGroupPaths(deployGroups, CONTROL_FILE_FIELDS.TRANSLATION_IMPORTS), entries, seen);

	return { manifest, entries };
}

function getGroupPaths(groups: DeployGroup[], kind: DeployGroup['kind']): string[] {
	return groups.filter((group) => group.kind === kind)
		.flatMap((group) => group.paths.map((path) => path.value))
		.filter(Boolean);
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
	groups: DeployGroup[],
	entries: ArchiveEntry[],
	seen: Set<string>
): Promise<void> {
	for (const run of groups.filter((group) => group.kind === CONTROL_FILE_FIELDS.RUN)) {
		for (const script of run.scripts) {
			const scriptPath = toProjectRelativePath(script.path.value);
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
				if (rootTag?.name !== CONTROL_FILE_FIELDS.SDF_INSTALLATION_SCRIPT) {
					continue;
				}
			const scriptFile = getReferenceValue(asText(rootTag.value?.[CONTROL_FILE_FIELDS.SCRIPT_FILE]));
				if (scriptFile) {
					await addDeployPaths(
						projectFolder,
						[`~/${FOLDERS.FILE_CABINET}${scriptFile.startsWith('/') ? '' : '/'}${scriptFile}`],
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

function asText(value: unknown): string {
	if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
		return String(value).trim();
	}
	if (value && typeof value === 'object' && '_' in value) {
		return asText((value as { _: unknown })._);
	}
	return '';
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
