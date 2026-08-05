/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { FRONTMATTER_REQUIRED_FIELDS } from './constants.mjs';
import { isValidReleaseVersion } from '../release-version.mjs';

function normalizePath(value) {
	return value.split(path.sep).join('/');
}

function assertRelativePath(value, label) {
	if (path.isAbsolute(value)) {
		throw new Error(`${label} must be relative: ${value}`);
	}

	const normalized = normalizePath(value);
	if (normalized === '..' || normalized.startsWith('../') || normalized.includes('/../')) {
		throw new Error(`${label} must stay inside the package: ${value}`);
	}

	return normalized;
}

function isPathInside(parentPath, candidatePath) {
	const relativePath = path.relative(parentPath, candidatePath);
	return relativePath === '' || (!relativePath.startsWith(`..${path.sep}`) && relativePath !== '..' && !path.isAbsolute(relativePath));
}

/**
 * Validates a collection root and returns canonical paths that can safely be
 * retained for later collection. Collection roots themselves must never be
 * symbolic links, even if they currently resolve within their boundary.
 */
export async function validateCollectionRoot({ rootDir, allowedParent, label }) {
	let rootStat;
	try {
		rootStat = await fs.lstat(rootDir);
	} catch (error) {
		if (error?.code === 'ENOENT') {
			throw new Error(`${label} root does not exist: ${rootDir}`);
		}
		throw error;
	}

	if (rootStat.isSymbolicLink()) {
		throw new Error(`Rejected ${label} root: symbolic links are not allowed: ${rootDir}`);
	}
	if (!rootStat.isDirectory()) {
		throw new Error(`Rejected ${label} root: expected an existing directory: ${rootDir}`);
	}

	let canonicalParent;
	try {
		canonicalParent = await fs.realpath(allowedParent);
	} catch (error) {
		if (error?.code === 'ENOENT') {
			throw new Error(`Allowed parent for ${label} root does not exist: ${allowedParent}`);
		}
		throw error;
	}
	const parentStat = await fs.stat(canonicalParent);
	if (!parentStat.isDirectory()) {
		throw new Error(`Allowed parent for ${label} root must be a directory: ${allowedParent}`);
	}

	const canonicalRoot = await fs.realpath(rootDir);
	if (!isPathInside(canonicalParent, canonicalRoot)) {
		throw new Error(`Rejected ${label} root outside allowed parent: ${rootDir}`);
	}

	return { rootDir: canonicalRoot, boundaryDir: canonicalParent };
}

function parseSkillFrontmatter(skillFileContents, skillName) {
	const match = /^---\n([\s\S]*?)\n---\n/.exec(skillFileContents);
	if (!match) {
		throw new Error(`Skill ${skillName} is missing YAML frontmatter`);
	}

	const frontmatter = {};
	let currentNestedKey = null;
	for (const rawLine of match[1].split('\n')) {
		if (!rawLine.trim()) {
			continue;
		}

		const nestedMatch = /^  ([A-Za-z0-9_-]+):\s*(.*)$/.exec(rawLine);
		if (nestedMatch && currentNestedKey) {
			if (!frontmatter[currentNestedKey] || typeof frontmatter[currentNestedKey] !== 'object') {
				frontmatter[currentNestedKey] = {};
			}
			frontmatter[currentNestedKey][nestedMatch[1]] = nestedMatch[2].replace(/^["']|["']$/g, '');
			continue;
		}

		const topLevelMatch = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(rawLine);
		if (!topLevelMatch) {
			throw new Error(`Skill ${skillName} frontmatter contains unsupported YAML syntax`);
		}

		const [, key, rawValue] = topLevelMatch;
		currentNestedKey = rawValue.length === 0 ? key : null;
		frontmatter[key] = rawValue.replace(/^["']|["']$/g, '');
	}

	for (const field of FRONTMATTER_REQUIRED_FIELDS) {
		if (!frontmatter[field] || typeof frontmatter[field] !== 'string') {
			throw new Error(`Skill ${skillName} frontmatter must contain "${field}"`);
		}
	}

	if (frontmatter.name !== skillName) {
		throw new Error(`Skill ${skillName} frontmatter name must match directory name`);
	}
}

async function readJson(filePath) {
	return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

function isPlainObject(value) {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isValidHttpUrl(value) {
	try {
		const parsed = new URL(value);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}

function validatePluginConfigShape(pluginConfig, pluginDirectoryName) {
	const requiredStringFields = ['id', 'version', 'platform'];
	for (const field of requiredStringFields) {
		if (typeof pluginConfig[field] !== 'string' || pluginConfig[field].length === 0) {
			throw new Error(`Invalid plugin.build.json for ${pluginDirectoryName}: "${field}" must be a non-empty string`);
		}
	}

	if (!/^[a-z0-9][a-z0-9-]*$/.test(pluginConfig.id)) {
		throw new Error(`Invalid plugin.build.json for ${pluginDirectoryName}: "id" must be lowercase kebab-case`);
	}

	if (!['anthropic', 'openai'].includes(pluginConfig.platform)) {
		throw new Error(`Invalid plugin.build.json for ${pluginDirectoryName}: unsupported platform ${pluginConfig.platform}`);
	}

	if (!isPlainObject(pluginConfig.metadata)) {
		throw new Error(`Invalid plugin.build.json for ${pluginDirectoryName}: "metadata" must be an object`);
	}

	const metadata = pluginConfig.metadata;
	for (const field of ['name', 'description', 'license']) {
		if (typeof metadata[field] !== 'string' || metadata[field].length === 0) {
			throw new Error(`Invalid plugin.build.json for ${pluginDirectoryName}: metadata.${field} must be a non-empty string`);
		}
	}
	if (!isPlainObject(metadata.author) || typeof metadata.author.name !== 'string' || metadata.author.name.length === 0) {
		throw new Error(`Invalid plugin.build.json for ${pluginDirectoryName}: metadata.author.name must be a non-empty string`);
	}
	if (metadata.author.url !== undefined && !isValidHttpUrl(metadata.author.url)) {
		throw new Error(`Invalid plugin.build.json for ${pluginDirectoryName}: metadata.author.url must be an http(s) URL`);
	}

	if (!Array.isArray(metadata.keywords) || metadata.keywords.length === 0 || metadata.keywords.some((value) => typeof value !== 'string')) {
		throw new Error(`Invalid plugin.build.json for ${pluginDirectoryName}: metadata.keywords must be a non-empty string array`);
	}

	for (const field of ['homepage', 'repository']) {
		if (metadata[field] !== undefined && !isValidHttpUrl(metadata[field])) {
			throw new Error(`Invalid plugin.build.json for ${pluginDirectoryName}: metadata.${field} must be an http(s) URL`);
		}
	}

	if (pluginConfig.platform === 'openai') {
		if (!isPlainObject(metadata.interface)) {
			throw new Error(`Invalid plugin.build.json for ${pluginDirectoryName}: metadata.interface must be an object for openai plugins`);
		}

		const pluginInterface = metadata.interface;
		for (const field of ['displayName', 'shortDescription', 'longDescription', 'developerName', 'category', 'websiteURL', 'privacyPolicyURL', 'logo', 'composerIcon', 'brandColor']) {
			if (typeof pluginInterface[field] !== 'string' || pluginInterface[field].length === 0) {
				throw new Error(`Invalid plugin.build.json for ${pluginDirectoryName}: metadata.interface.${field} must be a non-empty string for openai plugins`);
			}
		}

		for (const field of ['websiteURL', 'privacyPolicyURL']) {
			if (!isValidHttpUrl(pluginInterface[field])) {
				throw new Error(`Invalid plugin.build.json for ${pluginDirectoryName}: metadata.interface.${field} must be an http(s) URL for openai plugins`);
			}
		}
	}

	for (const field of ['skills', 'commonLayers', 'inputs']) {
		if (!Array.isArray(pluginConfig[field])) {
			throw new Error(`Invalid plugin.build.json for ${pluginDirectoryName}: "${field}" must be an array`);
		}
	}

	if (pluginConfig.skills.length === 0 || pluginConfig.skills.some((value) => typeof value !== 'string' || value.length === 0)) {
		throw new Error(`Invalid plugin.build.json for ${pluginDirectoryName}: "skills" must be a non-empty string array`);
	}

	if (pluginConfig.inputs.length === 0) {
		throw new Error(`Invalid plugin.build.json for ${pluginDirectoryName}: "inputs" must not be empty`);
	}

	for (const input of pluginConfig.inputs) {
		if (!isPlainObject(input)) {
			throw new Error(`Invalid plugin.build.json for ${pluginDirectoryName}: each input must be an object`);
		}

		for (const field of ['root', 'destination']) {
			if (typeof input[field] !== 'string') {
				throw new Error(`Invalid plugin.build.json for ${pluginDirectoryName}: input.${field} must be a string`);
			}
		}

		for (const field of ['include', 'exclude']) {
			if (!Array.isArray(input[field]) || input[field].some((value) => typeof value !== 'string')) {
				throw new Error(`Invalid plugin.build.json for ${pluginDirectoryName}: input.${field} must be a string array`);
			}
		}

		if (input.include.length === 0) {
			throw new Error(`Invalid plugin.build.json for ${pluginDirectoryName}: input.include must not be empty`);
		}
	}
}

async function getPluginDirectories(packageRoot) {
	const excludedDirectories = new Set(['common', 'config', 'schemas', 'scripts', 'test']);
	const directories = [];

	async function walk(relativeDirectory = '') {
		const absoluteDirectory = path.join(packageRoot, relativeDirectory);
		const entries = await fs.readdir(absoluteDirectory, { withFileTypes: true });
		for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
			if (!entry.isDirectory() || (relativeDirectory === '' && excludedDirectories.has(entry.name))) {
				continue;
			}

			const relativePath = path.join(relativeDirectory, entry.name);
			const pluginBuildPath = path.join(packageRoot, relativePath, 'plugin.build.json');
			if (await fs.access(pluginBuildPath).then(() => true).catch(() => false)) {
				directories.push(normalizePath(relativePath));
				continue;
			}

			await walk(relativePath);
		}
	}

	await walk();
	return directories.sort();
}

export async function loadWorkspace(packageRoot = process.cwd()) {
	const buildConfigPath = path.join(packageRoot, 'config', 'build.json');

	const [buildConfig, pluginDirectories] = await Promise.all([
		readJson(buildConfigPath),
		getPluginDirectories(packageRoot),
	]);
	const skillsRoot = path.resolve(packageRoot, buildConfig.skillsRoot);
	const commonLayersRoot = path.resolve(packageRoot, buildConfig.commonLayersRoot);

	const plugins = [];

	for (const pluginDirectoryName of pluginDirectories) {
		const pluginDirectory = path.join(packageRoot, pluginDirectoryName);
		const pluginBuildPath = path.join(pluginDirectory, 'plugin.build.json');

		try {
			await fs.access(pluginBuildPath);
		} catch {
			continue;
		}

		const pluginConfig = await readJson(pluginBuildPath);
		validatePluginConfigShape(pluginConfig, pluginDirectoryName);

		if (!isValidReleaseVersion(pluginConfig.version)) {
			throw new Error(`Plugin ${pluginDirectoryName} has invalid release version: ${pluginConfig.version}`);
		}

		const validatedCommonLayers = [];
		for (const layerName of pluginConfig.commonLayers) {
			assertRelativePath(layerName, `common layer for ${pluginDirectoryName}`);
			const layerPath = path.resolve(commonLayersRoot, layerName);
			const validatedRoot = await validateCollectionRoot({
				rootDir: layerPath,
				allowedParent: commonLayersRoot,
				label: `common layer ${layerName} for ${pluginDirectoryName}`,
			});
			validatedCommonLayers.push({ name: layerName, ...validatedRoot });
		}

		const validatedInputs = [];
		for (const input of pluginConfig.inputs) {
			assertRelativePath(input.root, `input root for ${pluginDirectoryName}`);
			assertRelativePath(input.destination, `input destination for ${pluginDirectoryName}`);
			const inputPath = path.join(pluginDirectory, input.root);
			const validatedRoot = await validateCollectionRoot({
				rootDir: inputPath,
				allowedParent: pluginDirectory,
				label: `input ${input.root} for ${pluginDirectoryName}`,
			});
			validatedInputs.push({ ...input, ...validatedRoot });
		}
		plugins.push({
			...pluginConfig,
			inputs: validatedInputs,
			validatedCommonLayers,
			sourceDirectoryName: pluginDirectoryName,
			sourceKey: pluginDirectoryName,
			pluginDirectory,
			pluginBuildPath,
		});
	}

	const skillDirectories = new Map();
	for (const skillName of new Set(plugins.flatMap((plugin) => plugin.skills))) {
		if (!/^netsuite[-_a-z0-9]+$/.test(skillName)) {
			throw new Error(`Invalid skill name in plugin config: ${skillName}`);
		}

		const skillDir = path.join(skillsRoot, skillName);
		let validatedRoot;
		try {
			validatedRoot = await validateCollectionRoot({
				rootDir: skillDir,
				allowedParent: skillsRoot,
				label: `skill ${skillName}`,
			});
		} catch (error) {
			if (error.message.startsWith(`skill ${skillName} root does not exist:`)) {
				throw new Error(`Missing skill directory for ${skillName}`);
			}
			throw error;
		}

		const skillFilePath = path.join(validatedRoot.rootDir, 'SKILL.md');
		const skillFileContents = await fs.readFile(skillFilePath, 'utf8').catch(() => null);
		if (skillFileContents === null) {
			throw new Error(`Skill ${skillName} is missing SKILL.md`);
		}

		parseSkillFrontmatter(skillFileContents, skillName);
		skillDirectories.set(skillName, validatedRoot);
	}

	return {
		packageRoot,
		buildConfig,
		skillsRoot: await fs.realpath(skillsRoot).catch(() => skillsRoot),
		commonLayersRoot: await fs.realpath(commonLayersRoot).catch(() => commonLayersRoot),
		skillDirectories,
		plugins,
	};
}

export function getPluginBySourceName(workspace, pluginName) {
	const sourcePlugin = workspace.plugins.find((candidate) => candidate.sourceKey === pluginName);
	if (sourcePlugin) {
		return sourcePlugin;
	}

	const idMatches = workspace.plugins.filter((candidate) => candidate.id === pluginName);
	if (idMatches.length > 1) {
		throw new Error(
			`Ambiguous plugin id "${pluginName}". Use a provider-qualified source key: ${idMatches
				.map((plugin) => plugin.sourceKey)
				.join(', ')}`
		);
	}

	const plugin = idMatches[0];

	if (!plugin) {
		throw new Error(`Unknown plugin: ${pluginName}`);
	}

	return plugin;
}

export function getNormalizedSkills(pluginConfig) {
	return [...new Set(pluginConfig.skills)].sort();
}
