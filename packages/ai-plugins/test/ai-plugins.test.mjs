/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
import { promisify } from 'node:util';
import { loadWorkspace, getNormalizedSkills } from '../scripts/lib/build-config.mjs';
import { buildPlugin, buildPlugins } from '../scripts/lib/plugin-builder.mjs';
import { listRelativeFiles, writeJson } from '../scripts/lib/fs-utils.mjs';
import { generateManifest } from '../scripts/lib/manifest.mjs';
import {
	createIntegrityManifest,
	serializeIntegrityManifest,
	verifyIntegrityManifest,
	writeIntegrityManifest,
} from '../scripts/release-integrity.mjs';
import { scanSecrets, scanWorkflowPolicies } from '../scripts/release-security-gates.mjs';
import {
	compareReleaseVersions,
	isValidReleaseVersion,
	parseReleaseVersion,
} from '../scripts/release-version.mjs';
import { verifyRootReadme } from '../scripts/verify-release.mjs';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const execFileAsync = promisify(execFile);
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

test('release security gate detects credential-shaped values and accepts clean files', async () => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'release-security-secrets-'));
	await fs.writeFile(path.join(root, 'clean.txt'), 'const reference = "Bearer ${token}";\n', 'utf8');
	assert.deepEqual(await scanSecrets(root), []);

	await fs.writeFile(path.join(root, 'credentials.txt'), [
		'ghp_' + 'abcdefghijklmnopqrstuvwxyz0123456789ABCD',
		'AKIA' + 'ABCDEFGHIJKLMNOP',
		'Authorization: Bearer ' + 'abcdefghijklmnopqrstuvwxyz0123456789',
		'-----BEGIN PRIVATE KEY-----\n' + 'A'.repeat(128),
	].join('\n'), 'utf8');
	assert.deepEqual((await scanSecrets(root)).map((finding) => finding.kind).sort(), [
		'AWS access key', 'GitHub token', 'bearer credential', 'private key',
	]);
});

test('release security gate excludes source checkout directories but scans generated output', async () => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'release-security-source-'));
	for (const directory of ['.git', 'node_modules', 'dist']) {
		await fs.mkdir(path.join(root, directory));
		await fs.writeFile(path.join(root, directory, 'ignored.txt'), 'ghp_' + 'abcdefghijklmnopqrstuvwxyz0123456789ABCD', 'utf8');
	}
	assert.deepEqual(await scanSecrets(root, { source: true }), []);
	const generated = path.join(root, 'dist');
	assert.equal((await scanSecrets(generated)).length, 1);
});

test('release security workflow policy rejects unsafe workflows and accepts compliant workflows', async () => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'release-security-workflows-'));
	await fs.writeFile(path.join(root, 'unsafe.yml'), `name: unsafe
jobs:
  test:
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: true
      - uses: owner/action@main
`, 'utf8');
	const unsafeFindings = await scanWorkflowPolicies(root);
	assert(unsafeFindings.some((finding) => finding.kind === 'missing explicit top-level permissions'));
	assert(unsafeFindings.some((finding) => finding.kind === 'checkout persists credentials'));
	assert.equal(unsafeFindings.filter((finding) => finding.kind.startsWith('unpinned external action')).length, 2);

	await fs.rm(path.join(root, 'unsafe.yml'));
	await fs.writeFile(path.join(root, 'compliant.yaml'), `name: compliant
permissions:
  contents: read
jobs:
  test:
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683
        with:
          persist-credentials: false
      - uses: ./local-action
`, 'utf8');
	assert.deepEqual(await scanWorkflowPolicies(root), []);
});

function getSkillDirectories(files) {
	return [...new Set(files.filter((file) => file.startsWith('skills/')).map((file) => file.split('/').slice(0, 2).join('/')))].sort();
}

function getOpenAIInterfaceAssetPaths(plugin) {
	return ['logo', 'composerIcon'].map((field) => plugin.metadata.interface[field].replace(/^\.\//, ''));
}

test('release integrity manifest is sorted, deterministic, and uses SHA-256', async () => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'release-integrity-'));
	await fs.mkdir(path.join(root, 'nested'));
	await fs.writeFile(path.join(root, 'z.txt'), 'last', 'utf8');
	await fs.writeFile(path.join(root, 'nested', 'a.txt'), 'first', 'utf8');

	const manifest = await createIntegrityManifest(root);
	assert.deepEqual(manifest.map((entry) => entry.path), ['nested/a.txt', 'z.txt']);
	assert.equal(manifest.find((entry) => entry.path === 'nested/a.txt').sha256, 'a7937b64b8caa58f03721bb6bacf5c78cb235febe0e70b1b84cd99541461a08e');
	assert.equal(serializeIntegrityManifest(manifest), serializeIntegrityManifest(await createIntegrityManifest(root)));
});

test('release integrity verification rejects tampered, missing, and unexpected files', async () => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'release-integrity-'));
	const manifestPath = path.join(await fs.mkdtemp(path.join(os.tmpdir(), 'release-integrity-metadata-')), 'manifest.sha256');
	await fs.mkdir(path.join(root, 'nested'));
	await fs.writeFile(path.join(root, 'nested', 'file.txt'), 'original', 'utf8');
	await writeIntegrityManifest(root, manifestPath);
	await fs.writeFile(path.join(root, 'nested', 'file.txt'), 'tampered', 'utf8');
	await assert.rejects(() => verifyIntegrityManifest(root, manifestPath), /hash mismatch: nested\/file.txt/);
	await fs.writeFile(path.join(root, 'nested', 'file.txt'), 'original', 'utf8');
	await fs.rm(path.join(root, 'nested', 'file.txt'));
	await assert.rejects(() => verifyIntegrityManifest(root, manifestPath), /missing file: nested\/file.txt/);
	await fs.writeFile(path.join(root, 'nested', 'file.txt'), 'original', 'utf8');
	await fs.writeFile(path.join(root, 'unexpected.txt'), 'unexpected', 'utf8');
	await assert.rejects(() => verifyIntegrityManifest(root, manifestPath), /unexpected file: unexpected.txt/);
});

test('release versions accept only canonical stable SemVer', () => {
	for (const version of ['0.0.0', '1.2.3']) {
		assert.equal(isValidReleaseVersion(version), true);
	}
	for (const version of ['1.0.0-rc.1', '1.0.0+build.1', '01.0.0', '1.02.0', '1.0.03', '1.0', 'v1.0.0', '', 1, null]) {
		assert.equal(isValidReleaseVersion(version), false, String(version));
		assert.throws(() => parseReleaseVersion(version));
	}
});

test('release version precedence compares all components exactly', () => {
	for (const [higher, lower] of [
		['2.0.0', '1.999999999999999999999999999999.999999999999999999999999999999'],
		['1.3.0', '1.2.999999999999999999999999999999'],
		['1.2.4', '1.2.3'],
	]) {
		assert.equal(compareReleaseVersions(higher, lower), 1);
		assert.equal(compareReleaseVersions(lower, higher), -1);
	}
	assert.equal(compareReleaseVersions('1.2.3', '1.2.3'), 0);
	assert.throws(() => compareReleaseVersions('1.2.3-rc.1', '1.2.3'));
});

test('release-version command validates generated manifests and version increases', async () => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-plugin-release-version-'));
	const current = path.join(root, 'current');
	const previous = path.join(root, 'previous');
	const command = path.join(packageRoot, 'scripts', 'release-version.mjs');
	const writeManifest = async (directory, version) => {
		await fs.mkdir(path.join(directory, '.claude-plugin'), { recursive: true });
		await writeJson(path.join(directory, '.claude-plugin', 'plugin.json'), { version });
	};

	await writeManifest(current, '9007199254740993.0.0');
	assert.equal((await execFileAsync(process.execPath, [command, current, previous])).stdout.trim(), '9007199254740993.0.0');

	await writeManifest(previous, '9007199254740992.999999999999999999999999999999.999999999999999999999999999999');
	assert.equal((await execFileAsync(process.execPath, [command, current, previous])).stdout.trim(), '9007199254740993.0.0');

	await writeManifest(current, '1.2.3');
	await writeManifest(previous, '1.2.3');
	await assert.rejects(
		() => execFileAsync(process.execPath, [command, current, previous]),
		/Changed plug-in content requires a higher version/
	);
	assert.equal(
		(await execFileAsync(process.execPath, [command, '--allow-same-version-republish', current, previous])).stdout.trim(),
		'1.2.3'
	);
	await writeManifest(current, '1.2.2');
	await assert.rejects(
		() => execFileAsync(process.execPath, [command, current, previous]),
		/Changed plug-in content requires a higher version/
	);
	await assert.rejects(
		() => execFileAsync(process.execPath, [command, '--allow-same-version-republish', current, previous]),
		/Changed plug-in content requires a higher version/
	);

	await writeManifest(current, '1.2.3-rc.1');
	await assert.rejects(
		() => execFileAsync(process.execPath, [command, current, previous]),
		/Invalid release version/
	);
	await writeManifest(current, '1.2.4');
	await writeManifest(previous, '1.2.3+build.1');
	await assert.rejects(
		() => execFileAsync(process.execPath, [command, current, previous]),
		/Invalid release version/
	);
});

test('workspace config recursively discovers eight provider-qualified plugins with expected platforms and skills', async () => {
	const workspace = await loadWorkspace(packageRoot);

	assert.equal(workspace.plugins.length, 8);
	assert.deepEqual(
		workspace.plugins.map((plugin) => plugin.sourceKey),
		[
			'anthropic/netsuite-ai-companion',
			'anthropic/netsuite-finance-analyst',
			'anthropic/netsuite-suitecloud',
			'anthropic/netsuite-suiteskills',
			'openai/netsuite-ai-companion',
			'openai/netsuite-finance-analyst',
			'openai/netsuite-suitecloud',
			'openai/netsuite-suiteskills',
		]
	);

	for (const plugin of workspace.plugins) {
		assert.equal(plugin.platform, plugin.sourceKey.startsWith('anthropic/') ? 'anthropic' : 'openai');
	}

	for (const plugin of workspace.plugins.filter((plugin) => plugin.id === 'netsuite-ai-companion')) {
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
	const result = await buildPlugin('openai/netsuite-ai-companion', { workspace, writeOutput: false });
	const files = await listRelativeFiles(result.outputDir);

	assert(files.includes('.codex-plugin/plugin.json'));
	assert(files.includes('README.md'));
	assert(files.includes('LICENSE.txt'));
	assert.deepEqual(result.skillNames, ['netsuite-ai-connector-instructions']);

	const manifest = JSON.parse(await fs.readFile(path.join(result.outputDir, '.codex-plugin', 'plugin.json'), 'utf8'));
	assert.equal(manifest.skills, './skills/');
	assert.equal(manifest.name, 'netsuite-ai-companion');
	assert.deepEqual(manifest.interface, result.plugin.metadata.interface);
	assert.equal(manifest.interface.brandColor, '#294B5F');
	for (const assetPath of getOpenAIInterfaceAssetPaths(result.plugin)) {
		assert(files.includes(assetPath));
	}

	await assert.rejects(
		() => buildPlugin('netsuite-ai-companion', { workspace, writeOutput: false }),
		/ambiguous plugin id.*provider-qualified/i
	);
});

test('manifests copy metadata and preserve future nested properties', () => {
	const pluginInterface = {
		displayName: 'Unbranded Plugin',
		shortDescription: 'Unbranded plugin',
		longDescription: 'Unbranded plugin',
		developerName: 'Oracle NetSuite',
		category: 'Developer Tools',
		capabilities: ['Read'],
		websiteURL: 'https://example.com',
		privacyPolicyURL: 'https://example.com/privacy',
		logo: './assets/logo.png',
		composerIcon: './assets/icon.png',
		brandColor: '#294B5F',
		futureSetting: { enabled: true, values: ['one', 2] },
	};
	const { manifest } = generateManifest({
		platform: 'openai',
		version: '1.0.0',
		metadata: {
			name: 'unbranded-plugin',
			description: 'Unbranded plugin',
			author: { name: 'Oracle NetSuite', url: 'https://example.com' },
			license: 'UPL',
			keywords: ['netsuite'],
			futureMetadata: { enabled: true, values: ['one', 2] },
			interface: pluginInterface,
		},
	});

	assert.deepEqual(manifest, {
		name: 'unbranded-plugin',
		description: 'Unbranded plugin',
		author: { name: 'Oracle NetSuite', url: 'https://example.com' },
		license: 'UPL',
		keywords: ['netsuite'],
		futureMetadata: { enabled: true, values: ['one', 2] },
		interface: pluginInterface,
		version: '1.0.0',
		skills: './skills/',
	});

	const anthropicMetadata = {
		name: 'anthropic-plugin', description: 'Anthropic plugin', author: { name: 'Oracle NetSuite' }, license: 'UPL', keywords: ['netsuite'],
		interface: { futureSetting: { enabled: true } }, futureMetadata: ['preserved'],
	};
	assert.deepEqual(generateManifest({ platform: 'anthropic', version: '1.0.0', metadata: anthropicMetadata }).manifest, {
		...anthropicMetadata, version: '1.0.0', skills: './skills/',
	});
});

test('all provider-qualified plugins stage nested artifacts with provider-specific manifests and declared skills only', async () => {
	const workspace = await loadWorkspace(packageRoot);

	for (const plugin of workspace.plugins) {
		const result = await buildPlugin(plugin.sourceKey, { workspace, writeOutput: false });
		const files = await listRelativeFiles(result.outputDir);
		const manifestPath = plugin.platform === 'anthropic' ? '.claude-plugin/plugin.json' : '.codex-plugin/plugin.json';
		const absentManifestPath = plugin.platform === 'anthropic' ? '.codex-plugin/plugin.json' : '.claude-plugin/plugin.json';

		assert(files.includes(manifestPath));
		assert(!files.includes(absentManifestPath));
		assert(files.includes('README.md'));
		assert(files.includes('LICENSE.txt'));
		assert.deepEqual(getSkillDirectories(files), result.skillNames.map((skillName) => `skills/${skillName}`));

		const manifest = JSON.parse(await fs.readFile(path.join(result.outputDir, manifestPath), 'utf8'));
		assert.deepEqual(manifest, { ...plugin.metadata, version: plugin.version, skills: './skills/' });
		if (plugin.platform === 'openai') {
			assert.deepEqual(manifest.interface, plugin.metadata.interface);
			assert.equal(manifest.interface.brandColor, '#294B5F');
			for (const assetPath of getOpenAIInterfaceAssetPaths(plugin)) {
				assert(files.includes(assetPath));
			}
		} else {
			assert(!files.includes('assets/netsuite-logo.png'));
			assert(!files.includes('assets/netsuite-icon.png'));
		}
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

test('output builds copy the static distribution README byte-for-byte', async () => {
	const workspace = await loadWorkspace(packageRoot);
	await buildPlugins(['anthropic/netsuite-suitecloud'], { workspace, writeOutput: true });

	const [sourceReadme, distributionReadme] = await Promise.all([
		fs.readFile(path.join(packageRoot, 'README.md')),
		fs.readFile(path.resolve(packageRoot, workspace.buildConfig.pluginDistRoot, 'README.md')),
	]);
	assert(sourceReadme.equals(distributionReadme));
});

test('release verification rejects missing or altered root README files', async () => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-plugin-release-readme-'));
	const workspace = { packageRoot: root, buildConfig: { pluginDistRoot: 'dist' } };
	await fs.writeFile(path.join(root, 'README.md'), '# Reviewed README\n', 'utf8');
	await fs.mkdir(path.join(root, 'dist'));

	await assert.rejects(() => verifyRootReadme(workspace), /missing root README\.md/);
	await fs.writeFile(path.join(root, 'dist', 'README.md'), '# Altered README\n', 'utf8');
	await assert.rejects(() => verifyRootReadme(workspace), /root README\.md differs/);
});

test('loadWorkspace rejects an openai plugin without a complete interface', async () => {
	const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-plugin-workspace-'));
	const packageDir = path.join(tempRoot, 'plugins');
	await fs.mkdir(path.join(packageDir, 'config'), { recursive: true });
	await fs.mkdir(path.join(packageDir, 'bad-plugin'), { recursive: true });

	await writeJson(path.join(packageDir, 'config', 'build.json'), {
		version: 1,
		licenseFile: '../LICENSE.txt',
		skillsRoot: '../skills',
		commonLayersRoot: './common',
		pluginDistRoot: '../dist',
		globalExcludes: [],
	});
	await writeJson(path.join(packageDir, 'bad-plugin', 'plugin.build.json'), {
		id: 'bad-plugin',
		version: '1.0.0',
		platform: 'openai',
		metadata: {
			name: 'bad-plugin',
			description: 'bad plugin',
			author: { name: 'Oracle NetSuite' },
			license: 'UPL',
			keywords: ['bad'],
		},
		skills: ['netsuite-good-skill'],
		commonLayers: [],
		inputs: [],
	});

	await assert.rejects(() => loadWorkspace(packageDir), /metadata\.interface must be an object for openai plugins/i);
});

test('loadWorkspace validates required OpenAI interface fields, accepts optional capabilities, and accepts Anthropic nested interfaces', async () => {
	const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-plugin-workspace-'));
	const packageDir = path.join(tempRoot, 'plugins');
	await fs.mkdir(path.join(packageDir, 'config'), { recursive: true });
	await fs.mkdir(path.join(packageDir, 'bad-plugin', 'src'), { recursive: true });
	await fs.mkdir(path.join(tempRoot, 'skills', 'netsuite-good-skill'), { recursive: true });
	await fs.writeFile(path.join(tempRoot, 'skills', 'netsuite-good-skill', 'SKILL.md'), `---\nname: netsuite-good-skill\ndescription: good\nlicense: UPL\n---\n`, 'utf8');
	await writeJson(path.join(packageDir, 'config', 'build.json'), {
		version: 1, licenseFile: '../LICENSE.txt', skillsRoot: '../skills', commonLayersRoot: './common', pluginDistRoot: '../dist', globalExcludes: [],
	});
	const metadata = { name: 'bad-plugin', description: 'bad plugin', author: { name: 'Oracle NetSuite' }, license: 'UPL', keywords: ['bad'] };
	const pluginInterface = {
		displayName: 'Bad Plugin', shortDescription: 'Bad plugin', longDescription: 'Bad plugin', developerName: 'Oracle NetSuite', category: 'Developer Tools',
		capabilities: ['Read'], websiteURL: 'https://example.com', privacyPolicyURL: 'https://example.com/privacy', logo: './logo.png', composerIcon: './icon.png', brandColor: '#294B5F',
	};
	const basePlugin = {
		id: 'bad-plugin', version: '1.0.0', platform: 'openai', metadata: { ...metadata, interface: pluginInterface }, skills: ['netsuite-good-skill'], commonLayers: [],
		inputs: [{ root: 'src', destination: '.', include: ['README.md'], exclude: [] }],
	};

	const { displayName, ...interfaceWithoutDisplayName } = pluginInterface;
	await writeJson(path.join(packageDir, 'bad-plugin', 'plugin.build.json'), { ...basePlugin, metadata: { ...metadata, interface: interfaceWithoutDisplayName } });
	await assert.rejects(() => loadWorkspace(packageDir), /metadata\.interface\.displayName must be a non-empty string/i);

	await writeJson(path.join(packageDir, 'bad-plugin', 'plugin.build.json'), { ...basePlugin, metadata: { ...metadata, interface: { ...pluginInterface, websiteURL: 'not-a-url' } } });
	await assert.rejects(() => loadWorkspace(packageDir), /metadata\.interface\.websiteURL must be an http\(s\) URL/i);

	const { capabilities, ...interfaceWithoutCapabilities } = pluginInterface;
	await writeJson(path.join(packageDir, 'bad-plugin', 'plugin.build.json'), { ...basePlugin, metadata: { ...metadata, interface: interfaceWithoutCapabilities } });
	await assert.doesNotReject(() => loadWorkspace(packageDir));

	await writeJson(path.join(packageDir, 'bad-plugin', 'plugin.build.json'), { ...basePlugin, metadata: { ...metadata, interface: { ...pluginInterface, displayName: 'A'.repeat(30) } } });
	await assert.doesNotReject(() => loadWorkspace(packageDir));
	await writeJson(path.join(packageDir, 'bad-plugin', 'plugin.build.json'), { ...basePlugin, metadata: { ...metadata, interface: { ...pluginInterface, displayName: 'A'.repeat(31) } } });
	await assert.rejects(() => loadWorkspace(packageDir), /metadata\.interface\.displayName must not exceed 30 characters/i);

	await writeJson(path.join(packageDir, 'bad-plugin', 'plugin.build.json'), { ...basePlugin, platform: 'anthropic' });
	await assert.doesNotReject(() => loadWorkspace(packageDir));
});

test('loadWorkspace rejects missing or invalid generic author data', async () => {
	const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-plugin-workspace-'));
	const packageDir = path.join(tempRoot, 'plugins');
	await fs.mkdir(path.join(packageDir, 'config'), { recursive: true });
	await fs.mkdir(path.join(packageDir, 'bad-plugin'), { recursive: true });
	await writeJson(path.join(packageDir, 'config', 'build.json'), {
		version: 1, licenseFile: '../LICENSE.txt', skillsRoot: '../skills', commonLayersRoot: './common', pluginDistRoot: '../dist', globalExcludes: [],
	});
	const basePlugin = {
		id: 'bad-plugin', version: '1.0.0', platform: 'anthropic',
		metadata: { name: 'bad-plugin', description: 'bad plugin', author: { name: 'Oracle NetSuite' }, license: 'UPL', keywords: ['bad'] },
		skills: ['netsuite-good-skill'], commonLayers: [], inputs: [],
	};
	await writeJson(path.join(packageDir, 'bad-plugin', 'plugin.build.json'), { ...basePlugin, metadata: { ...basePlugin.metadata, author: {} } });
	await assert.rejects(() => loadWorkspace(packageDir), /metadata\.author\.name must be a non-empty string/i);
	await writeJson(path.join(packageDir, 'bad-plugin', 'plugin.build.json'), { ...basePlugin, metadata: { ...basePlugin.metadata, author: { name: 'Oracle NetSuite', url: 'not-a-url' } } });
	await assert.rejects(() => loadWorkspace(packageDir), /metadata\.author\.url must be an http\(s\) URL/i);
});

test('loadWorkspace rejects invalid skill frontmatter', async () => {
	const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-plugin-workspace-'));
	const skillsRoot = path.join(tempRoot, 'skills');
	const packageDir = path.join(tempRoot, 'plugins');
	await fs.mkdir(path.join(packageDir, 'config'), { recursive: true });
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
	await writeJson(path.join(packageDir, 'bad-plugin', 'plugin.build.json'), {
		id: 'bad-plugin',
		version: '1.0.0',
		platform: 'anthropic',
		metadata: {
			name: 'bad-plugin',
			description: 'bad plugin',
			author: { name: 'Oracle NetSuite' },
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
	await writeJson(path.join(packageDir, 'bad-plugin', 'plugin.build.json'), {
		id: 'bad-plugin',
		version: '1.0.0',
		platform: 'anthropic',
		metadata: {
			name: 'bad-plugin',
			description: 'bad plugin',
			author: { name: 'Oracle NetSuite' },
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
	await writeJson(path.join(packageDir, 'bad-plugin', 'plugin.build.json'), {
		id: 'bad-plugin',
		version: '1.0.0',
		platform: 'anthropic',
		metadata: {
			name: 'bad-plugin',
			description: 'bad plugin',
			author: { name: 'Oracle NetSuite' },
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

async function createBoundaryWorkspace({ commonLayers = [] } = {}) {
	const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-plugin-boundary-'));
	const packageDir = path.join(tempRoot, 'plugins');
	const pluginDir = path.join(packageDir, 'boundary-plugin');
	const sourceDir = path.join(pluginDir, 'src');
	const commonLayerDir = path.join(packageDir, 'common', 'shared');
	const skillsRoot = path.join(tempRoot, 'skills');
	const skillDir = path.join(skillsRoot, 'netsuite-good-skill');
	const outsideDir = path.join(tempRoot, 'outside');

	await Promise.all([
		fs.mkdir(sourceDir, { recursive: true }),
		fs.mkdir(commonLayerDir, { recursive: true }),
		fs.mkdir(skillDir, { recursive: true }),
		fs.mkdir(outsideDir, { recursive: true }),
		fs.mkdir(path.join(packageDir, 'config'), { recursive: true }),
	]);
	await Promise.all([
		fs.writeFile(path.join(tempRoot, 'LICENSE.txt'), 'license\n', 'utf8'),
		fs.writeFile(path.join(sourceDir, 'README.md'), '# Boundary plugin\n', 'utf8'),
		fs.writeFile(path.join(commonLayerDir, 'COMMON.md'), '# Common\n', 'utf8'),
		fs.writeFile(path.join(outsideDir, 'outside.txt'), 'must not be collected\n', 'utf8'),
		fs.writeFile(path.join(skillDir, 'SKILL.md'), '---\nname: netsuite-good-skill\ndescription: good\nlicense: UPL\n---\n', 'utf8'),
	]);
	await writeJson(path.join(packageDir, 'config', 'build.json'), {
		version: 1,
		licenseFile: '../LICENSE.txt',
		skillsRoot: '../skills',
		commonLayersRoot: './common',
		pluginDistRoot: '../dist',
		globalExcludes: [],
	});
	await writeJson(path.join(pluginDir, 'plugin.build.json'), {
		id: 'boundary-plugin',
		version: '1.0.0',
		platform: 'anthropic',
		metadata: {
			name: 'boundary-plugin', description: 'Boundary plugin', author: { name: 'Oracle NetSuite' }, license: 'UPL', keywords: ['boundary'],
		},
		skills: ['netsuite-good-skill'],
		commonLayers,
		inputs: [{ root: 'src', destination: '.', include: ['**/*'], exclude: [] }],
	});

	return { tempRoot, packageDir, pluginDir, sourceDir, commonLayerDir, skillDir, outsideDir };
}

test('loadWorkspace rejects non-release plugin versions', async () => {
	const fixture = await createBoundaryWorkspace();
	const pluginBuildPath = path.join(fixture.pluginDir, 'plugin.build.json');
	const validPlugin = JSON.parse(await fs.readFile(pluginBuildPath, 'utf8'));

	for (const version of ['1.0.0-rc.1', '1.0.0+build.1', '01.0.0', '1.00.0', '1.0.01', '1.0', 1]) {
		await writeJson(pluginBuildPath, { ...validPlugin, version });
		await assert.rejects(() => loadWorkspace(fixture.packageDir), /(invalid release version|version.*non-empty string)/i);
	}
});

test('loadWorkspace rejects symlinked input, common-layer, and skill collection roots before staging', async (t) => {
	await t.test('input root outside plugin directory', async () => {
		const fixture = await createBoundaryWorkspace();
		await fs.rm(fixture.sourceDir, { recursive: true });
		await fs.symlink(fixture.outsideDir, fixture.sourceDir, 'dir');
		await assert.rejects(() => loadWorkspace(fixture.packageDir), /Rejected input src.*symbolic links are not allowed/i);
		await assert.rejects(() => fs.access(path.join(fixture.tempRoot, 'dist')), /ENOENT/);
	});

	await t.test('common layer root outside configured common-layers root', async () => {
		const fixture = await createBoundaryWorkspace({ commonLayers: ['shared'] });
		await fs.rm(fixture.commonLayerDir, { recursive: true });
		await fs.symlink(fixture.outsideDir, fixture.commonLayerDir, 'dir');
		await assert.rejects(() => loadWorkspace(fixture.packageDir), /Rejected common layer shared.*symbolic links are not allowed/i);
		await assert.rejects(() => fs.access(path.join(fixture.tempRoot, 'dist')), /ENOENT/);
	});

	await t.test('skill root outside skillsRoot', async () => {
		const fixture = await createBoundaryWorkspace();
		await fs.rm(fixture.skillDir, { recursive: true });
		await fs.symlink(fixture.outsideDir, fixture.skillDir, 'dir');
		await assert.rejects(() => loadWorkspace(fixture.packageDir), /Rejected skill netsuite-good-skill root: symbolic links are not allowed/i);
		await assert.rejects(() => fs.access(path.join(fixture.tempRoot, 'dist')), /ENOENT/);
	});
});

test('buildPlugin rejects nested symlinks and accepts in-bound collection roots', async () => {
	const fixture = await createBoundaryWorkspace({ commonLayers: ['shared'] });
	const workspace = await loadWorkspace(fixture.packageDir);
	const nestedLink = path.join(fixture.sourceDir, 'nested-link');
	await fs.symlink(fixture.outsideDir, nestedLink, 'dir');

	await assert.rejects(
		() => buildPlugin('boundary-plugin', { workspace, writeOutput: true }),
		/Symlinks are not allowed: nested-link/i
	);
	await assert.rejects(() => fs.access(path.join(fixture.tempRoot, 'dist', 'boundary-plugin')), /ENOENT/);

	await fs.rm(nestedLink);
	const result = await buildPlugin('boundary-plugin', { workspace, writeOutput: false });
	assert.deepEqual(await listRelativeFiles(result.outputDir), [
		'.claude-plugin/plugin.json',
		'COMMON.md',
		'LICENSE.txt',
		'README.md',
		'skills/netsuite-good-skill/SKILL.md',
	]);
});

async function createNamedSourceFixture(t) {
 const f = await createBoundaryWorkspace();
 t.after(() => fs.rm(f.tempRoot, { recursive: true, force: true }));
 const configPath = path.join(f.packageDir, 'config/build.json');
 const pluginPath = path.join(f.pluginDir, 'plugin.build.json');
 const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
 const plugin = JSON.parse(await fs.readFile(pluginPath, 'utf8'));
 const namedRoot = path.join(f.packageDir, 'common/named-skills');
 const namedSkill = path.join(namedRoot, 'netsuite-good-skill');
 await fs.mkdir(namedSkill, { recursive: true });
 await fs.writeFile(path.join(namedSkill, 'SKILL.md'), '---\nname: netsuite-good-skill\ndescription: named source\nlicense: UPL\n---\n');
 config.skillSources = { named: './common/named-skills' };
 await writeJson(configPath, config);
 return { ...f, configPath, pluginPath, config, plugin, namedRoot, namedSkill };
}

test('default and named sources keep identical skill names isolated per plugin', async t => {
 const f = await createNamedSourceFixture(t);
 const namedPluginDir = path.join(f.packageDir, 'named-plugin');
 await fs.mkdir(path.join(namedPluginDir, 'src'), { recursive: true });
 await fs.writeFile(path.join(namedPluginDir, 'src/README.md'), '# Named\n');
 await writeJson(path.join(namedPluginDir, 'plugin.build.json'), { ...f.plugin, id: 'named-plugin', skillSource: 'named' });
 const workspace = await loadWorkspace(f.packageDir);
 assert.equal(workspace.buildConfig.skillsRoot, '../skills');
 for (const [name, expected] of [['boundary-plugin', 'description: good'], ['named-plugin', 'description: named source']]) {
  const result = await buildPlugin(name, { workspace, writeOutput: false });
  t.after(() => fs.rm(path.dirname(result.outputDir), { recursive: true, force: true }));
  assert.match(await fs.readFile(path.join(result.outputDir, 'skills/netsuite-good-skill/SKILL.md'), 'utf8'), new RegExp(expected));
 }
});

test('named sources reject invalid configuration and missing skills without fallback', async t => {
 for (const scenario of ['unknown', 'missing skill', 'missing source', 'source file', 'escaping source', 'absolute source', 'invalid registry', 'invalid entry', 'invalid frontmatter']) {
  await t.test(scenario, async t => {
   const f = await createNamedSourceFixture(t);
   let expected;
   f.plugin.skillSource = 'named';
   switch (scenario) {
    case 'unknown': f.plugin.skillSource = 'other'; expected = /Unknown skill source/; break;
    case 'missing skill': await fs.rm(f.namedSkill, { recursive: true }); expected = /Missing skill directory/; break;
    case 'missing source': await fs.rm(f.namedRoot, { recursive: true }); expected = /root does not exist/; break;
    case 'source file': await fs.rm(f.namedRoot, { recursive: true }); await fs.writeFile(f.namedRoot, 'file'); expected = /expected an existing directory/; break;
    case 'escaping source': f.config.skillSources.named = '../skills'; expected = /must stay inside the package/; break;
    case 'absolute source': f.config.skillSources.named = f.namedRoot; expected = /must be relative/; break;
    case 'invalid registry': f.config.skillSources = []; expected = /skillSources must be an object/; break;
    case 'invalid entry': f.config.skillSources.named = null; expected = /Invalid skill source/; break;
    case 'invalid frontmatter': await fs.writeFile(path.join(f.namedSkill, 'SKILL.md'), '---\nname: netsuite-wrong-name\ndescription: wrong\nlicense: UPL\n---\n'); expected = /name must match directory name/; break;
   }
   await writeJson(f.configPath, f.config);
   await writeJson(f.pluginPath, f.plugin);
   await assert.rejects(() => loadWorkspace(f.packageDir), expected);
  });
 }
});

test('named sources reject symlinks, containment escapes and destination collisions', async t => {
 for (const scenario of ['source symlink', 'skill symlink', 'ancestor escape', 'nested symlink', 'case collision', 'input collision']) {
  await t.test(scenario, async t => {
   const f = await createNamedSourceFixture(t);
   f.plugin.skillSource = 'named';
   await writeJson(f.pluginPath, f.plugin);
   if (scenario === 'source symlink') {
    await fs.rm(f.namedRoot, { recursive: true });
    await fs.symlink(path.dirname(f.skillDir), f.namedRoot, 'dir');
    await assert.rejects(() => loadWorkspace(f.packageDir), /skill source named root: symbolic links/);
   } else if (scenario === 'skill symlink') {
    await fs.rm(f.namedSkill, { recursive: true });
    await fs.symlink(f.skillDir, f.namedSkill, 'dir');
    await assert.rejects(() => loadWorkspace(f.packageDir), /skill netsuite-good-skill root: symbolic links/);
   } else if (scenario === 'ancestor escape') {
    await fs.mkdir(path.join(f.outsideDir, 'nested'));
    await fs.symlink(f.outsideDir, path.join(f.packageDir, 'common/link'), 'dir');
    f.config.skillSources.named = './common/link/nested';
    await writeJson(f.configPath, f.config);
    await assert.rejects(() => loadWorkspace(f.packageDir), /outside allowed parent/);
   } else {
    const workspace = await loadWorkspace(f.packageDir);
    if (scenario === 'nested symlink') await fs.symlink(f.outsideDir, path.join(f.namedSkill, 'nested'), 'dir');
    if (scenario === 'case collision' || scenario === 'input collision') {
     await fs.mkdir(path.join(f.sourceDir, 'skills/netsuite-good-skill'), { recursive: true });
     await fs.writeFile(path.join(f.sourceDir, 'skills/netsuite-good-skill', scenario === 'case collision' ? 'skill.md' : 'SKILL.md'), 'collision');
    }
    await assert.rejects(() => buildPlugin('boundary-plugin', { workspace, writeOutput: true }), scenario === 'nested symlink' ? /Symlinks are not allowed/ : /Case-insensitive destination collision/);
   }
  });
 }
});

test('named source root is revalidated before staging', async t => {
 const f = await createNamedSourceFixture(t);
 await writeJson(f.pluginPath, { ...f.plugin, skillSource: 'named' });
 const workspace = await loadWorkspace(f.packageDir);
 await fs.rm(f.namedRoot, { recursive: true });
 await fs.symlink(path.dirname(f.skillDir), f.namedRoot, 'dir');
 await assert.rejects(() => buildPlugin('boundary-plugin', { workspace, writeOutput: true }), /skill source named root: symbolic links/);
});
