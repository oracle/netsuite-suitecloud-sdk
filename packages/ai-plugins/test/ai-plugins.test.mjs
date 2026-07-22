/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
import { loadWorkspace, getNormalizedSkills } from '../scripts/lib/build-config.mjs';
import { buildPlugin } from '../scripts/lib/plugin-builder.mjs';
import { listRelativeFiles, writeJson } from '../scripts/lib/fs-utils.mjs';

const packageRoot = path.resolve(process.cwd());
const suitecloudSkills = [
	'netsuite-owasp-secure-coding',
	'netsuite-sdf-project-documentation',
	'netsuite-sdf-roles-and-permissions',
	'netsuite-sdf-safe-guide',
	'netsuite-suitescript-learning',
	'netsuite-suitescript-records-reference',
	'netsuite-suitescript-upgrade',
	'netsuite-uif-spa-reference',
];

function getSkillDirectories(files) {
	return [...new Set(files.filter((file) => file.startsWith('skills/')).map((file) => file.split('/').slice(0, 2).join('/')))].sort();
}

test('workspace config recursively discovers six provider-qualified plugins with expected platforms and skills', async () => {
	const workspace = await loadWorkspace(packageRoot);

	assert.equal(workspace.plugins.length, 6);
	assert.deepEqual(
		workspace.plugins.map((plugin) => plugin.sourceKey),
		[
			'anthropic/netsuite-ai-connector-companion',
			'anthropic/netsuite-finance-analyst',
			'anthropic/netsuite-suitecloud',
			'openai/netsuite-ai-connector-companion',
			'openai/netsuite-finance-analyst',
			'openai/netsuite-suitecloud',
		]
	);

	for (const plugin of workspace.plugins) {
		assert.equal(plugin.platform, plugin.sourceKey.startsWith('anthropic/') ? 'claude' : 'codex');
	}

	for (const plugin of workspace.plugins.filter((plugin) => plugin.id === 'netsuite-ai-connector-companion')) {
		assert.deepEqual(getNormalizedSkills(plugin), ['netsuite-ai-connector-instructions']);
	}

	for (const plugin of workspace.plugins.filter((plugin) => plugin.id === 'netsuite-finance-analyst')) {
		assert.deepEqual(getNormalizedSkills(plugin), ['netsuite-finance-analyst']);
	}

	for (const plugin of workspace.plugins.filter((plugin) => plugin.id === 'netsuite-suitecloud')) {
		assert.deepEqual(getNormalizedSkills(plugin), suitecloudSkills);
	}
});

test('provider-qualified plugins build without collisions and ambiguous bare IDs fail clearly', async () => {
	const workspace = await loadWorkspace(packageRoot);
	const result = await buildPlugin('openai/netsuite-ai-connector-companion', { workspace, writeOutput: false });
	const files = await listRelativeFiles(result.outputDir);

	assert(files.includes('.codex-plugin/plugin.json'));
	assert(files.includes('README.md'));
	assert(files.includes('LICENSE.txt'));
	assert.deepEqual(result.skillNames, ['netsuite-ai-connector-instructions']);

	const manifest = JSON.parse(await fs.readFile(path.join(result.outputDir, '.codex-plugin', 'plugin.json'), 'utf8'));
	assert.equal(manifest.skills, './skills/');
	assert.equal(manifest.name, 'netsuite-ai-connector-companion');
	assert.equal(manifest.interface.displayName, 'netsuite-ai-connector-companion');

	await assert.rejects(
		() => buildPlugin('netsuite-ai-connector-companion', { workspace, writeOutput: false }),
		/ambiguous plugin id.*provider-qualified/i
	);
});

test('all provider-qualified plugins stage nested artifacts with provider-specific manifests and declared skills only', async () => {
	const workspace = await loadWorkspace(packageRoot);

	for (const plugin of workspace.plugins) {
		const result = await buildPlugin(plugin.sourceKey, { workspace, writeOutput: false });
		const files = await listRelativeFiles(result.outputDir);
		const manifestPath = plugin.platform === 'claude' ? '.claude-plugin/plugin.json' : '.codex-plugin/plugin.json';
		const absentManifestPath = plugin.platform === 'claude' ? '.codex-plugin/plugin.json' : '.claude-plugin/plugin.json';

		assert(files.includes(manifestPath));
		assert(!files.includes(absentManifestPath));
		assert(files.includes('README.md'));
		assert(files.includes('LICENSE.txt'));
		assert.deepEqual(getSkillDirectories(files), result.skillNames.map((skillName) => `skills/${skillName}`));

		const manifest = JSON.parse(await fs.readFile(path.join(result.outputDir, manifestPath), 'utf8'));
		assert.equal(manifest.name, plugin.id);
		assert.equal(manifest.version, plugin.version);
	}
});

test('buildPlugin replaces stale output on repeated builds', async () => {
	const workspace = await loadWorkspace(packageRoot);
	const first = await buildPlugin('anthropic/netsuite-suitecloud', { workspace, writeOutput: true });
	await fs.writeFile(path.join(first.outputDir, 'stale.txt'), 'stale', 'utf8');
	const second = await buildPlugin('anthropic/netsuite-suitecloud', { workspace, writeOutput: true });
	const files = await listRelativeFiles(second.outputDir);

	assert(!files.includes('stale.txt'));
	assert.match(second.outputDir, /dist\/ai-plugins\/anthropic\/netsuite-suitecloud$/);
});

test('loadWorkspace rejects invalid skill frontmatter', async () => {
	const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-plugin-workspace-'));
	const skillsRoot = path.join(tempRoot, 'skills');
	const packageDir = path.join(tempRoot, 'plugins');
	await fs.mkdir(path.join(packageDir, 'config'), { recursive: true });
	await fs.mkdir(path.join(packageDir, 'schemas'), { recursive: true });
	await fs.mkdir(path.join(packageDir, 'bad-plugin', 'src'), { recursive: true });
	await fs.mkdir(path.join(skillsRoot, 'netsuite-bad-skill'), { recursive: true });
	await fs.writeFile(path.join(tempRoot, 'LICENSE.txt'), 'license\n', 'utf8');
	await fs.writeFile(path.join(packageDir, 'bad-plugin', 'src', 'README.md'), '# Temp\n', 'utf8');
	await fs.writeFile(path.join(skillsRoot, 'netsuite-bad-skill', 'SKILL.md'), '# Missing frontmatter\n', 'utf8');

	await writeJson(path.join(packageDir, 'config', 'build.json'), {
		version: 1,
		licenseFile: '../LICENSE.txt',
		skillsRoot: '../skills',
		commonLayersRoot: './common',
		pluginDistRoot: '../dist',
		globalExcludes: [],
	});
	await fs.copyFile(
		path.join(packageRoot, 'schemas', 'plugin-build.schema.json'),
		path.join(packageDir, 'schemas', 'plugin-build.schema.json')
	);
	await writeJson(path.join(packageDir, 'bad-plugin', 'plugin.build.json'), {
		id: 'bad-plugin',
		version: '1.0.0',
		platform: 'claude',
		metadata: {
			name: 'bad-plugin',
			description: 'bad plugin',
			authorName: 'Oracle NetSuite',
			license: 'UPL',
			keywords: ['bad'],
		},
		skills: ['netsuite-bad-skill'],
		commonLayers: [],
		inputs: [
			{
				root: 'src',
				destination: '.',
				include: ['README.md'],
				exclude: [],
			},
		],
	});

	await assert.rejects(() => loadWorkspace(packageDir), /missing YAML frontmatter/i);
});

test('buildPlugin rejects generated manifests supplied by source files', async () => {
	const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-plugin-workspace-'));
	const skillsRoot = path.join(tempRoot, 'skills');
	const packageDir = path.join(tempRoot, 'plugins');
	await fs.mkdir(path.join(packageDir, 'config'), { recursive: true });
	await fs.mkdir(path.join(packageDir, 'schemas'), { recursive: true });
	await fs.mkdir(path.join(packageDir, 'bad-plugin', 'src', '.claude-plugin'), { recursive: true });
	await fs.mkdir(path.join(skillsRoot, 'netsuite-good-skill'), { recursive: true });
	await fs.writeFile(path.join(tempRoot, 'LICENSE.txt'), 'license\n', 'utf8');
	await fs.writeFile(path.join(packageDir, 'bad-plugin', 'src', '.claude-plugin', 'plugin.json'), '{}\n', 'utf8');
	await fs.writeFile(path.join(skillsRoot, 'netsuite-good-skill', 'SKILL.md'), `---\nname: netsuite-good-skill\ndescription: good\nlicense: UPL\n---\n`, 'utf8');

	await writeJson(path.join(packageDir, 'config', 'build.json'), {
		version: 1,
		licenseFile: '../LICENSE.txt',
		skillsRoot: '../skills',
		commonLayersRoot: './common',
		pluginDistRoot: '../dist',
		globalExcludes: [],
	});
	await fs.copyFile(
		path.join(packageRoot, 'schemas', 'plugin-build.schema.json'),
		path.join(packageDir, 'schemas', 'plugin-build.schema.json')
	);
	await writeJson(path.join(packageDir, 'bad-plugin', 'plugin.build.json'), {
		id: 'bad-plugin',
		version: '1.0.0',
		platform: 'claude',
		metadata: {
			name: 'bad-plugin',
			description: 'bad plugin',
			authorName: 'Oracle NetSuite',
			license: 'UPL',
			keywords: ['bad'],
		},
		skills: ['netsuite-good-skill'],
		commonLayers: [],
		inputs: [
			{
				root: 'src',
				destination: '.',
				include: ['**/*'],
				exclude: [],
			},
		],
	});

	const workspace = await loadWorkspace(packageDir);
	await assert.rejects(
		() => buildPlugin('bad-plugin', { workspace, writeOutput: false }),
		/generated manifest path cannot be supplied/i
	);
});

test('loadWorkspace rejects missing skill directories referenced directly by plugin config', async () => {
	const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-plugin-workspace-'));
	const packageDir = path.join(tempRoot, 'plugins');
	await fs.mkdir(path.join(packageDir, 'config'), { recursive: true });
	await fs.mkdir(path.join(packageDir, 'schemas'), { recursive: true });
	await fs.mkdir(path.join(packageDir, 'bad-plugin', 'src'), { recursive: true });
	await fs.writeFile(path.join(tempRoot, 'LICENSE.txt'), 'license\n', 'utf8');
	await fs.writeFile(path.join(packageDir, 'bad-plugin', 'src', 'README.md'), '# Temp\n', 'utf8');

	await writeJson(path.join(packageDir, 'config', 'build.json'), {
		version: 1,
		licenseFile: '../LICENSE.txt',
		skillsRoot: '../skills',
		commonLayersRoot: './common',
		pluginDistRoot: '../dist',
		globalExcludes: [],
	});
	await fs.copyFile(
		path.join(packageRoot, 'schemas', 'plugin-build.schema.json'),
		path.join(packageDir, 'schemas', 'plugin-build.schema.json')
	);
	await writeJson(path.join(packageDir, 'bad-plugin', 'plugin.build.json'), {
		id: 'bad-plugin',
		version: '1.0.0',
		platform: 'claude',
		metadata: {
			name: 'bad-plugin',
			description: 'bad plugin',
			authorName: 'Oracle NetSuite',
			license: 'UPL',
			keywords: ['bad'],
		},
		skills: ['netsuite-missing-skill'],
		commonLayers: [],
		inputs: [
			{
				root: 'src',
				destination: '.',
				include: ['README.md'],
				exclude: [],
			},
		],
	});

	await assert.rejects(() => loadWorkspace(packageDir), /missing skill directory/i);
});

test('getNormalizedSkills deduplicates and sorts plugin skill entries', () => {
	assert.deepEqual(
		getNormalizedSkills({
			skills: ['netsuite-zeta', 'netsuite-alpha', 'netsuite-zeta'],
		}),
		['netsuite-alpha', 'netsuite-zeta']
	);
});
