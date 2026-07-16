import fs from 'node:fs/promises';
import path from 'node:path';
import { FRONTMATTER_REQUIRED_FIELDS } from './constants.mjs';

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

function isValidSemver(version) {
	return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version);
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

	if (!['claude', 'codex'].includes(pluginConfig.platform)) {
		throw new Error(`Invalid plugin.build.json for ${pluginDirectoryName}: unsupported platform ${pluginConfig.platform}`);
	}

	if (!isPlainObject(pluginConfig.metadata)) {
		throw new Error(`Invalid plugin.build.json for ${pluginDirectoryName}: "metadata" must be an object`);
	}

	const metadata = pluginConfig.metadata;
	for (const field of ['name', 'description', 'authorName', 'license']) {
		if (typeof metadata[field] !== 'string' || metadata[field].length === 0) {
			throw new Error(`Invalid plugin.build.json for ${pluginDirectoryName}: metadata.${field} must be a non-empty string`);
		}
	}

	if (!Array.isArray(metadata.keywords) || metadata.keywords.length === 0 || metadata.keywords.some((value) => typeof value !== 'string')) {
		throw new Error(`Invalid plugin.build.json for ${pluginDirectoryName}: metadata.keywords must be a non-empty string array`);
	}

	for (const field of ['authorUrl', 'homepage', 'repository', 'privacyPolicyUrl']) {
		if (metadata[field] !== undefined && !isValidHttpUrl(metadata[field])) {
			throw new Error(`Invalid plugin.build.json for ${pluginDirectoryName}: metadata.${field} must be an http(s) URL`);
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
	const entries = await fs.readdir(packageRoot, { withFileTypes: true });
	return entries
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.filter((name) => !['common', 'config', 'schemas', 'scripts', 'test'].includes(name))
		.sort();
}

export async function loadWorkspace(packageRoot = process.cwd()) {
	const buildConfigPath = path.join(packageRoot, 'config', 'build.json');
	const pluginSchemaPath = path.join(packageRoot, 'schemas', 'plugin-build.schema.json');

	const [buildConfig, pluginSchema, pluginDirectories] = await Promise.all([
		readJson(buildConfigPath),
		readJson(pluginSchemaPath),
		getPluginDirectories(packageRoot),
	]);
	const skillsRoot = path.resolve(packageRoot, buildConfig.skillsRoot);

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

		if (!isValidSemver(pluginConfig.version)) {
			throw new Error(`Plugin ${pluginDirectoryName} has invalid SemVer version: ${pluginConfig.version}`);
		}

		for (const layerName of pluginConfig.commonLayers) {
			assertRelativePath(layerName, `common layer for ${pluginDirectoryName}`);
			const layerPath = path.resolve(packageRoot, buildConfig.commonLayersRoot, layerName);
			const layerStat = await fs.stat(layerPath).catch(() => null);
			if (!layerStat?.isDirectory()) {
				throw new Error(`Plugin ${pluginDirectoryName} references missing common layer: ${layerName}`);
			}
		}

		for (const input of pluginConfig.inputs) {
			assertRelativePath(input.root, `input root for ${pluginDirectoryName}`);
			assertRelativePath(input.destination, `input destination for ${pluginDirectoryName}`);
			const inputPath = path.join(pluginDirectory, input.root);
			const inputStat = await fs.stat(inputPath).catch(() => null);
			if (!inputStat?.isDirectory()) {
				throw new Error(`Plugin ${pluginDirectoryName} input root does not exist: ${input.root}`);
			}
		}
		plugins.push({
			...pluginConfig,
			sourceDirectoryName: pluginDirectoryName,
			pluginDirectory,
			pluginBuildPath,
		});
	}

	for (const skillName of new Set(plugins.flatMap((plugin) => plugin.skills))) {
		if (!/^netsuite[-_a-z0-9]+$/.test(skillName)) {
			throw new Error(`Invalid skill name in plugin config: ${skillName}`);
		}

		const skillDir = path.join(skillsRoot, skillName);
		const skillStat = await fs.stat(skillDir).catch(() => null);
		if (!skillStat?.isDirectory()) {
			throw new Error(`Missing skill directory for ${skillName}`);
		}

		const skillFilePath = path.join(skillDir, 'SKILL.md');
		const skillFileContents = await fs.readFile(skillFilePath, 'utf8').catch(() => null);
		if (skillFileContents === null) {
			throw new Error(`Skill ${skillName} is missing SKILL.md`);
		}

		parseSkillFrontmatter(skillFileContents, skillName);
	}

	return {
		packageRoot,
		buildConfig,
		pluginSchema,
		skillsRoot,
		plugins,
	};
}

export function getPluginBySourceName(workspace, pluginName) {
	const plugin = workspace.plugins.find(
		(candidate) => candidate.sourceDirectoryName === pluginName || candidate.id === pluginName
	);

	if (!plugin) {
		throw new Error(`Unknown plugin: ${pluginName}`);
	}

	return plugin;
}

export function getNormalizedSkills(pluginConfig) {
	return [...new Set(pluginConfig.skills)].sort();
}
