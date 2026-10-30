/*
 ** Copyright (c) 2026 Oracle and/or its affiliates. All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main(): Promise<void> {
	const yamlPath = process.env.YAML_EXTENSION_PATH;
	if (!yamlPath) { throw new Error('Set YAML_EXTENSION_PATH to an installed redhat.vscode-yaml extension directory.'); }
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'suitecloud-json-host-'));
	try {
		const profile = path.join(root, 'user-data', 'User');
		await fs.mkdir(profile, { recursive: true });
		await fs.writeFile(path.join(profile, 'settings.json'), JSON.stringify({
			'workbench.startupEditor': 'none', 'chat.disableAIFeatures': true,
		}));
		for (const [project, source] of [['project [a]', 'src'], ['repository-b/nested-project', 'application']]) {
			const directory = path.join(root, project);
			await fs.mkdir(path.join(directory, source), { recursive: true });
			await fs.writeFile(path.join(directory, 'suitecloud.config.js'), `module.exports = { defaultProjectFolder: '${source}' };\n`);
			await fs.writeFile(path.join(directory, source, 'manifest.xml'), '<manifest projecttype="ACCOUNTCUSTOMIZATION"><frameworkversion>1.0</frameworkversion><projectname>JSON demo</projectname></manifest>');
			await fs.writeFile(path.join(directory, source, 'deploy.xml'), '<deploy/>');
		}
		// A saved override from the earlier PoC must not replace the built-in catalog.
		const legacySettings = path.join(root, 'project [a]', '.vscode');
		await fs.mkdir(legacySettings, { recursive: true });
		await fs.writeFile(path.join(legacySettings, 'settings.json'), JSON.stringify({
			'suitecloud.jsonObjects.schemaUrl': 'https://retired.example.invalid/parent.json',
		}));
		const workspace = path.join(root, 'test.code-workspace');
		await fs.writeFile(workspace, JSON.stringify({ folders: [{ path: 'project [a]' }, { path: 'repository-b' }], settings: { 'extensions.autoUpdate': false } }));
		await runTests({
			extensionDevelopmentPath: [path.resolve(__dirname, '../..'), path.resolve(yamlPath)],
			extensionTestsPath: path.resolve(__dirname, 'suite/index'),
			vscodeExecutablePath: process.env.VSCODE_EXECUTABLE_PATH,
			extensionTestsEnv: { SUITECLOUD_JSON_TEST_ROOT: root },
			launchArgs: [workspace, '--disable-workspace-trust', '--disable-extensions', '--skip-welcome', '--skip-release-notes',
				'--user-data-dir', path.join(root, 'user-data'), '--extensions-dir', path.join(root, 'extensions')],
		});
	} finally { await fs.rm(root, { recursive: true, force: true }); }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
