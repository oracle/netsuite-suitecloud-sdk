/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { isDirectExecution } from './lib/cli-entrypoint.mjs';
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

const minimumClaudeVersion = [2, 1, 281];
const claudePrerequisite = 'Release verification requires a usable Claude Code 2.1.281+ on PATH for Anthropic packages. Install or upgrade Claude Code and rerun verification.';

async function requireClaudeCli() {
	const output = await new Promise((resolve, reject) => {
		const child = spawn('claude', ['--version'], { stdio: ['ignore', 'pipe', 'pipe'] });
		let stdout = '';
		child.stdout.setEncoding('utf8');
		child.stdout.on('data', (chunk) => { stdout += chunk; });
		child.stderr.resume();
		child.on('error', (error) => reject(new Error(`${claudePrerequisite} ${error.message}`)));
		child.on('close', (code, signal) => {
			if (signal || code !== 0) reject(new Error(`${claudePrerequisite} Version probe ${signal ? `terminated by signal ${signal}` : `exited with code ${code}`}.`));
			else resolve(stdout.trim());
		});
	});
	const match = /^(\d+)\.(\d+)\.(\d+)(?: \(Claude Code\))?$/.exec(output);
	if (!match) throw new Error(`${claudePrerequisite} Unparseable version: ${JSON.stringify(output)}`);
	const version = match.slice(1).map(Number);
	const firstDifference = version.findIndex((part, index) => part !== minimumClaudeVersion[index]);
	if (firstDifference >= 0 && version[firstDifference] < minimumClaudeVersion[firstDifference]) {
		throw new Error(`${claudePrerequisite} Found ${output}.`);
	}
}

async function runCommand(command, args) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			stdio: 'inherit',
		});

		child.on('error', reject);
		child.on('close', (code, signal) => {
			if (code === 0 && !signal) {
				resolve();
				return;
			}

			reject(new Error(`${command} ${args.join(' ')} ${signal ? `terminated by signal ${signal}` : `exited with code ${code}`}`));
		});
	});
}

export async function verifyRootReadme(workspace) {
	const expectedPath = path.join(workspace.packageRoot, 'README.md');
	const releasePath = path.resolve(workspace.packageRoot, workspace.buildConfig.pluginDistRoot, 'README.md');
	let actualContents;

	try {
		actualContents = await fs.readFile(releasePath);
	} catch (error) {
		if (error?.code === 'ENOENT') {
			throw new Error('Release verification failed: missing root README.md');
		}
		throw error;
	}

	const expectedContents = await fs.readFile(expectedPath);
	if (!expectedContents.equals(actualContents)) {
		throw new Error('Release verification failed: root README.md differs from packages/ai-plugins/README.md');
	}
}

async function main() {
	const workspace = await loadWorkspace();
	if (workspace.plugins.some((plugin) => plugin.platform === 'anthropic')) await requireClaudeCli();
	await verifyRootReadme(workspace);
	const stagedResults = await buildPlugins([], { workspace, writeOutput: false });

	try {
		for (const result of stagedResults) {
			const releaseDir = path.resolve(workspace.packageRoot, workspace.buildConfig.pluginDistRoot, result.plugin.sourceKey);
			const errors = await compareDirectories(result.outputDir, releaseDir);
			if (errors.length > 0) {
				throw new Error(`Release verification failed for ${result.plugin.sourceKey}: ${errors.join(', ')}`);
			}

			if (result.plugin.platform === 'anthropic') {
				await runCommand('claude', ['plugin', 'validate', '--strict', releaseDir]);
			}

			console.log(`Verified ${result.plugin.sourceKey}`);
		}
	} finally {
		await Promise.all(stagedResults.map(result => fs.rm(path.dirname(result.outputDir), { recursive: true, force: true })));
	}
}

if (await isDirectExecution(import.meta.url)) {
	await main();
}
