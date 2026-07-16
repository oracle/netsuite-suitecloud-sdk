import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { loadWorkspace } from './lib/build-config.mjs';
import { buildPlugins } from './lib/plugin-builder.mjs';
import { listRelativeFiles } from './lib/fs-utils.mjs';

async function compareDirectories(expectedDir, actualDir) {
	const [expectedFiles, actualFiles] = await Promise.all([
		listRelativeFiles(expectedDir),
		listRelativeFiles(actualDir).catch(() => null),
	]);

	if (actualFiles === null) {
		return ['missing output directory'];
	}

	const errors = [];
	if (expectedFiles.join('\n') !== actualFiles.join('\n')) {
		errors.push('file inventory differs');
	}

	const sharedFiles = expectedFiles.filter((filePath) => actualFiles.includes(filePath));
	for (const filePath of sharedFiles) {
		const [expectedContents, actualContents] = await Promise.all([
			fs.readFile(path.join(expectedDir, filePath)),
			fs.readFile(path.join(actualDir, filePath)),
		]);

		if (!expectedContents.equals(actualContents)) {
			errors.push(`content differs: ${filePath}`);
		}
	}

	return errors;
}

async function commandExists(command) {
	return new Promise((resolve) => {
		const child = spawn(command, ['--help'], { stdio: 'ignore' });
		child.on('error', () => resolve(false));
		child.on('exit', (code) => resolve(code === 0));
	});
}

async function runCommand(command, args) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			stdio: 'inherit',
		});

		child.on('error', reject);
		child.on('exit', (code) => {
			if (code === 0) {
				resolve();
				return;
			}

			reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
		});
	});
}

const workspace = await loadWorkspace();
const stagedResults = await buildPlugins([], { workspace, writeOutput: false });
const hasClaudeCli = await commandExists('claude');

for (const result of stagedResults) {
	const releaseDir = path.resolve(workspace.packageRoot, workspace.buildConfig.pluginDistRoot, result.plugin.id);
	const errors = await compareDirectories(result.outputDir, releaseDir);
	if (errors.length > 0) {
		throw new Error(`Release verification failed for ${result.plugin.id}: ${errors.join(', ')}`);
	}

	if (result.plugin.platform === 'claude' && hasClaudeCli) {
		await runCommand('claude', ['plugin', 'validate', '--strict', releaseDir]);
	}

	console.log(`Verified ${result.plugin.id}`);
}
