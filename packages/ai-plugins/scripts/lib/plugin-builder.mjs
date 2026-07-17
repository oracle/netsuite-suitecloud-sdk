/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { GENERATED_MANIFEST_PATHS } from './constants.mjs';
import { loadWorkspace, getNormalizedSkills, getPluginBySourceName } from './build-config.mjs';
import { ensureDir, copyFileStrict, removeIfExists, writeJson, listRelativeFiles } from './fs-utils.mjs';
import { generateManifest } from './manifest.mjs';

function normalizeRelativePath(value) {
	return value.split(path.sep).join('/');
}

function assertSafeDestination(relativeDestination) {
	const normalized = normalizeRelativePath(relativeDestination);
	if (
		path.isAbsolute(relativeDestination) ||
		normalized === '..' ||
		normalized.startsWith('../') ||
		normalized.includes('/../')
	) {
		throw new Error(`Destination must stay inside the plugin root: ${relativeDestination}`);
	}

	return normalized;
}

function escapeRegex(value) {
	return value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
}

function globToRegExp(pattern) {
	const normalized = normalizeRelativePath(pattern);
	let regex = '';

	for (let index = 0; index < normalized.length; index += 1) {
		const current = normalized[index];
		const next = normalized[index + 1];

		if (current === '*' && next === '*') {
			const afterNext = normalized[index + 2];
			if (afterNext === '/') {
				regex += '(?:.*/)?';
				index += 2;
			} else {
				regex += '.*';
				index += 1;
			}
			continue;
		}

		if (current === '*') {
			regex += '[^/]*';
			continue;
		}

		regex += escapeRegex(current);
	}

	return new RegExp(`^${regex}$`);
}

function matchesAnyPattern(filePath, patterns) {
	return patterns.some((pattern) => globToRegExp(pattern).test(filePath));
}

async function walkFiles(rootDir) {
	const files = [];

	async function walk(currentDir) {
		const entries = await fs.readdir(currentDir, { withFileTypes: true });
		for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
			const absolutePath = path.join(currentDir, entry.name);
			const relativePath = normalizeRelativePath(path.relative(rootDir, absolutePath));
			const stat = await fs.lstat(absolutePath);

			if (stat.isSymbolicLink()) {
				throw new Error(`Symlinks are not allowed: ${relativePath}`);
			}

			if (entry.isDirectory()) {
				await walk(absolutePath);
				continue;
			}

			if (entry.isFile()) {
				files.push({
					sourceAbsolutePath: absolutePath,
					sourceRelativePath: relativePath,
				});
			}
		}
	}

	await walk(rootDir);
	return files;
}

async function collectFiles({ rootDir, include, exclude, globalExcludes, label }) {
	const allFiles = await walkFiles(rootDir);
	const files = allFiles.filter((file) => {
		if (!matchesAnyPattern(file.sourceRelativePath, include)) {
			return false;
		}

		if (matchesAnyPattern(file.sourceRelativePath, [...globalExcludes, ...exclude])) {
			return false;
		}

		return true;
	});

	if (files.length === 0) {
		throw new Error(`Input ${label} did not resolve to any files`);
	}

	return files;
}

function createCollisionChecker() {
	const seen = new Map();

	return (relativeDestination, sourceLabel) => {
		const normalized = normalizeRelativePath(relativeDestination);
		const collisionKey = normalized.toLowerCase();

		if (seen.has(collisionKey)) {
			throw new Error(`Case-insensitive destination collision for ${normalized}: ${seen.get(collisionKey)} and ${sourceLabel}`);
		}

		seen.set(collisionKey, sourceLabel);
	};
}

async function stagePlannedFiles({ workspace, pluginConfig, stageDir }) {
	const collisionCheck = createCollisionChecker();
	const plannedFiles = [];

	for (const input of pluginConfig.inputs) {
		const inputRoot = path.join(pluginConfig.pluginDirectory, input.root);
		const files = await collectFiles({
			rootDir: inputRoot,
			include: input.include,
			exclude: input.exclude,
			globalExcludes: workspace.buildConfig.globalExcludes,
			label: `${pluginConfig.sourceDirectoryName}/${input.root}`,
		});

		for (const file of files) {
			const destination = assertSafeDestination(path.posix.join(input.destination, file.sourceRelativePath));
			if (GENERATED_MANIFEST_PATHS.has(destination)) {
				throw new Error(`Generated manifest path cannot be supplied by source files: ${destination}`);
			}

			collisionCheck(destination, file.sourceAbsolutePath);
			plannedFiles.push({
				sourceAbsolutePath: file.sourceAbsolutePath,
				destinationRelativePath: destination,
			});
		}
	}

	for (const layerName of pluginConfig.commonLayers) {
		const layerRoot = path.resolve(workspace.packageRoot, workspace.buildConfig.commonLayersRoot, layerName);
		const files = await collectFiles({
			rootDir: layerRoot,
			include: ['**/*'],
			exclude: [],
			globalExcludes: workspace.buildConfig.globalExcludes,
			label: `common layer ${layerName}`,
		});

		for (const file of files) {
			const destination = assertSafeDestination(file.sourceRelativePath);
			if (GENERATED_MANIFEST_PATHS.has(destination)) {
				throw new Error(`Generated manifest path cannot be supplied by common layer ${layerName}: ${destination}`);
			}

			collisionCheck(destination, file.sourceAbsolutePath);
			plannedFiles.push({
				sourceAbsolutePath: file.sourceAbsolutePath,
				destinationRelativePath: destination,
			});
		}
	}

	const licenseSourcePath = path.resolve(workspace.packageRoot, workspace.buildConfig.licenseFile);
	collisionCheck('LICENSE.txt', licenseSourcePath);
	plannedFiles.push({
		sourceAbsolutePath: licenseSourcePath,
		destinationRelativePath: 'LICENSE.txt',
	});

	for (const skillName of getNormalizedSkills(pluginConfig)) {
		const skillRoot = path.join(workspace.skillsRoot, skillName);
		const files = await collectFiles({
			rootDir: skillRoot,
			include: ['**/*'],
			exclude: [],
			globalExcludes: workspace.buildConfig.globalExcludes,
			label: `skill ${skillName}`,
		});

		for (const file of files) {
			const destination = assertSafeDestination(path.posix.join('skills', skillName, file.sourceRelativePath));
			if (GENERATED_MANIFEST_PATHS.has(destination)) {
				throw new Error(`Generated manifest path collision inside skill ${skillName}: ${destination}`);
			}

			collisionCheck(destination, file.sourceAbsolutePath);
			plannedFiles.push({
				sourceAbsolutePath: file.sourceAbsolutePath,
				destinationRelativePath: destination,
			});
		}
	}

	for (const file of plannedFiles) {
		await copyFileStrict(file.sourceAbsolutePath, path.join(stageDir, file.destinationRelativePath));
	}

	const { manifestPath, manifest } = generateManifest(pluginConfig);
	collisionCheck(manifestPath, `${pluginConfig.id} generated manifest`);
	await writeJson(path.join(stageDir, manifestPath), manifest);

	return {
		manifestPath,
		manifest,
		files: await listRelativeFiles(stageDir),
		skillNames: getNormalizedSkills(pluginConfig),
	};
}

async function replaceOutputAtomically(stageDir, destinationDir) {
	const parentDir = path.dirname(destinationDir);
	await ensureDir(parentDir);

	const backupDir = path.join(parentDir, `.${path.basename(destinationDir)}.backup`);
	await removeIfExists(backupDir);

	try {
		await fs.rename(destinationDir, backupDir);
	} catch (error) {
		if (error && error.code !== 'ENOENT') {
			throw error;
		}
	}

	await fs.rename(stageDir, destinationDir);
	await removeIfExists(backupDir);
}

export async function buildPlugin(pluginName, options = {}) {
	const workspace = options.workspace ?? (await loadWorkspace());
	const writeOutput = options.writeOutput ?? true;
	const pluginConfig = getPluginBySourceName(workspace, pluginName);
	const distRoot = path.resolve(workspace.packageRoot, workspace.buildConfig.pluginDistRoot);
	const stageParent = writeOutput
		? distRoot
		: await fs.mkdtemp(path.join(os.tmpdir(), 'ai-plugin-stage-parent-'));
	await ensureDir(stageParent);
	const stageDir = await fs.mkdtemp(path.join(stageParent, `${pluginConfig.id}.stage-`));

	const staged = await stagePlannedFiles({ workspace, pluginConfig, stageDir });
	const outputDir = path.join(distRoot, pluginConfig.id);

	if (writeOutput) {
		await replaceOutputAtomically(stageDir, outputDir);
		return {
			plugin: pluginConfig,
			outputDir,
			...staged,
		};
	}

	return {
		plugin: pluginConfig,
		outputDir: stageDir,
		...staged,
	};
}

export async function buildPlugins(pluginNames, options = {}) {
	const workspace = options.workspace ?? (await loadWorkspace());
	const targets =
		pluginNames.length > 0
			? pluginNames
			: workspace.plugins.map((pluginConfig) => pluginConfig.sourceDirectoryName);

	const results = [];
	for (const pluginName of targets) {
		results.push(await buildPlugin(pluginName, { ...options, workspace }));
	}

	return results;
}
