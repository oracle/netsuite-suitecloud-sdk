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

test('workspace config loads and plugin skills normalize to expected membership counts', async () => {
	const workspace = await loadWorkspace(packageRoot);

	assert.equal(workspace.plugins.length, 4);

	const connectorPlugins = workspace.plugins.filter((plugin) =>
		['claude-ai-connector-plugin', 'codex-ai-connector-plugin'].includes(plugin.sourceDirectoryName)
	);
	const suitecloudPlugins = workspace.plugins.filter(
		(plugin) => !['claude-ai-connector-plugin', 'codex-ai-connector-plugin'].includes(plugin.sourceDirectoryName)
	);

	assert.equal(connectorPlugins.length, 2);

	for (const plugin of connectorPlugins) {
		assert.deepEqual(getNormalizedSkills(plugin), [
			'netsuite-ai-connector-instructions',
			'netsuite-finance-analyst',
		]);
	}

	for (const plugin of suitecloudPlugins) {
		assert.equal(getNormalizedSkills(plugin).length, 8);
	}
});

test('buildPlugin generates manifest, README, license, and expected skill membership', async () => {
	const workspace = await loadWorkspace(packageRoot);
	const result = await buildPlugin('codex-ai-connector-plugin', { workspace, writeOutput: false });
	const files = await listRelativeFiles(result.outputDir);

	assert(files.includes('.codex-plugin/plugin.json'));
	assert(files.includes('README.md'));
	assert(files.includes('LICENSE.txt'));
	assert.equal(result.skillNames.length, 2);

	const manifest = JSON.parse(await fs.readFile(path.join(result.outputDir, '.codex-plugin', 'plugin.json'), 'utf8'));
	assert.equal(manifest.skills, './skills/');
	assert.equal(manifest.name, 'netsuite-ai-connector-companion');
	assert.equal(manifest.interface.displayName, 'netsuite-ai-connector-companion');
});

test('buildPlugin replaces stale output on repeated builds', async () => {
	const workspace = await loadWorkspace(packageRoot);
	const first = await buildPlugin('claude-suitecloud-plugin', { workspace, writeOutput: true });
	await fs.writeFile(path.join(first.outputDir, 'stale.txt'), 'stale', 'utf8');
	const second = await buildPlugin('claude-suitecloud-plugin', { workspace, writeOutput: true });
	const files = await listRelativeFiles(second.outputDir);

	assert(!files.includes('stale.txt'));
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
