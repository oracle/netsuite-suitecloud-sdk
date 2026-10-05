/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { chmodSync, copyFileSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } = require('node:fs');
const { join, resolve, sep } = require('node:path');
const { spawnSync } = require('node:child_process');
const { createHash } = require('node:crypto');

const packageRoot = resolve(__dirname, '..');
const distFolder = join(packageRoot, 'dist');
const defaultTargets = ['win32-x64', 'darwin-arm64', 'linux-x64'];
const supportedTargets = new Set([...defaultTargets, 'win32-arm64', 'linux-arm64']);
const aliases = { windows: 'win32', mac: 'darwin', macos: 'darwin' };

function parseTargets(args, platform = process.platform, arch = process.arch) {
	if (args.length > 1) {
		throw new Error('Usage: build-sea.js [all | <platform>-<arch>[,<platform>-<arch>...]]');
	}
	if (args[0] === 'all') {
		return [...defaultTargets];
	}
	return [...new Set((args.length === 0 ? `${platform}-${arch}` : args[0]).split(',').map((value) => {
		let [targetPlatform, targetArch, extra] = value.split('-');
		const malformed = value === '' || targetArch === '' || extra !== undefined;
		targetPlatform = aliases[targetPlatform] || targetPlatform;
		targetArch = targetArch || (targetPlatform === 'darwin' ? 'arm64' : arch);
		const target = `${targetPlatform}-${targetArch}`;
		if (malformed || !supportedTargets.has(target)) {
			throw new Error(`Unsupported SEA target "${value}". Supported targets: ${[...supportedTargets].join(', ')}. macOS builds target Apple Silicon (arm64).`);
		}
		return target;
	}))];
}

function runtimeDownload(target, version) {
	const [platform, arch] = target.split('-');
	if (platform === 'win32') {
		return { filename: `win-${arch}/node.exe` };
	}
	const directory = `node-${version}-${platform}-${arch}`;
	return { filename: `${directory}.tar.gz`, member: `${directory}/bin/node` };
}

function verifyDownload(buffer, filename, checksums) {
	const entry = checksums.split(/\r?\n/).map((line) => line.trim().split(/\s+/))
		.find(([, name]) => name === filename);
	const expected = entry && entry[0];
	const actual = createHash('sha256').update(buffer).digest('hex');
	if (!expected || !/^[a-f0-9]{64}$/i.test(expected) || actual !== expected.toLowerCase()) {
		throw new Error(`SHA-256 verification failed for ${filename}.`);
	}
}

async function download(url) {
	const response = await fetch(url, { signal: AbortSignal.timeout(120000) });
	if (!response.ok) {
		throw new Error(`Download failed (${response.status}): ${url}`);
	}
	return Buffer.from(await response.arrayBuffer());
}

async function buildExecutables(args) {
	const targets = parseTargets(args);
	if (process.versions.node.split('.')[0] !== '22') {
		throw new Error('Build SuiteCloud executables with Node.js 22, matching the CLI runtime requirement.');
	}
	const bundlePath = join(distFolder, 'suitecloud.js');
	// Read before downloading anything so missing build:single output fails immediately.
	readFileSync(bundlePath);
	const temporaryFolder = mkdtempSync(join(distFolder, '.sea-'));
	const seaConfigPath = join(temporaryFolder, 'sea-config.json');
	const seaBlobPath = join(temporaryFolder, 'suitecloud.blob');
	const releaseUrl = `https://nodejs.org/download/release/${process.version}/`;
	let checksums;
	const artifacts = [];
	try {
		writeFileSync(seaConfigPath, JSON.stringify({
			main: bundlePath,
			output: seaBlobPath,
			disableExperimentalSEAWarning: true,
			useSnapshot: false,
			useCodeCache: false,
		}, null, 2));
		runCommand(process.execPath, ['--experimental-sea-config', seaConfigPath], 'Node SEA blob generation');
		const blob = readFileSync(seaBlobPath);
		const { inject } = require('postject');
		for (const target of targets) {
			const [platform] = target.split('-');
			const executableName = platform === 'win32' ? 'suitecloud.exe' : 'suitecloud';
			// Preserve the original output path when no target was requested.
			const outputFolder = args.length === 0 ? distFolder : join(distFolder, target);
			mkdirSync(outputFolder, { recursive: true });
			const executablePath = join(outputFolder, executableName);
			const stagingFolder = join(temporaryFolder, target);
			mkdirSync(stagingFolder);
			const stagedExecutable = join(stagingFolder, executableName);
			if (target === `${process.platform}-${process.arch}`) {
				copyFileSync(process.execPath, stagedExecutable);
			} else {
				const { filename, member } = runtimeDownload(target, process.version);
				checksums ??= (await download(`${releaseUrl}SHASUMS256.txt`)).toString('utf8');
				console.log(`Downloading Node.js ${process.version} for ${target}...`);
				const archive = await download(`${releaseUrl}${filename}`);
				verifyDownload(archive, filename, checksums);
				if (member) {
					const archivePath = join(stagingFolder, 'node.tar.gz');
					writeFileSync(archivePath, archive);
					runCommand('tar', ['-xzf', archivePath, '-C', stagingFolder, member], 'Node runtime extraction (requires tar)');
					copyFileSync(join(stagingFolder, member), stagedExecutable);
				} else {
					writeFileSync(stagedExecutable, archive);
				}
			}
			if (platform === 'darwin' && process.platform === 'darwin') {
				runCommand('codesign', ['--remove-signature', stagedExecutable]);
			}
			// postject removes the Mach-O signature during injection, including on non-Mac hosts.
			await inject(stagedExecutable, 'NODE_SEA_BLOB', blob, {
				sentinelFuse: 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2',
				...(platform === 'darwin' && { machoSegmentName: 'NODE_SEA' }),
			});
			if (platform !== 'win32') {
				chmodSync(stagedExecutable, 0o755);
			}
			const requiresMacSigning = platform === 'darwin' && process.platform !== 'darwin';
			if (platform === 'darwin' && !requiresMacSigning) {
				runCommand('codesign', ['--sign', '-', stagedExecutable]);
			}
			renameSync(stagedExecutable, executablePath);
			artifacts.push({ target, executable: executablePath, requiresMacSigning });
			console.log(`Created ${executablePath} with Node.js ${process.version}.`);
			if (requiresMacSigning) {
				console.warn(`macOS signing required before running/distributing: codesign --force --sign - "${executablePath}" (run on a Mac after transferring the file).`);
			}
		}
	} finally {
		// Only remove this invocation's generated temporary directory inside dist.
		const resolvedTemporaryFolder = resolve(temporaryFolder);
		if (!resolvedTemporaryFolder.startsWith(`${resolve(distFolder)}${sep}.sea-`)) {
			throw new Error(`Refusing to remove unexpected temporary directory: ${resolvedTemporaryFolder}`);
		}
		rmSync(resolvedTemporaryFolder, { recursive: true, force: true });
	}
	return artifacts;
}

function runCommand(command, args, description = command) {
	const result = spawnSync(command, args, { cwd: packageRoot, stdio: 'inherit' });
	if (result.error) {
		throw result.error;
	}
	if (result.status !== 0) {
		throw new Error(`${description} failed with exit code ${result.status ?? 1}.`);
	}
}

if (require.main === module) {
	buildExecutables(process.argv.slice(2)).catch((error) => {
		console.error(error);
		process.exitCode = 1;
	});
}

module.exports = { parseTargets, runtimeDownload, verifyDownload, buildExecutables };
