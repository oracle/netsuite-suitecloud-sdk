/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { chmodSync, copyFileSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const { join, resolve } = require('node:path');
const { spawnSync } = require('node:child_process');
const { inject } = require('postject');

const packageRoot = resolve(__dirname, '..');
const distFolder = join(packageRoot, 'dist');
const bundlePath = join(distFolder, 'suitecloud.js');
const seaConfigPath = join(distFolder, 'sea-config.json');
const seaBlobPath = join(distFolder, 'suitecloud.blob');
const supportedPlatforms = new Set(['win32', 'darwin', 'linux']);
const requestedPlatform = process.argv[2];
const executableName = process.platform === 'win32' ? 'suitecloud.exe' : 'suitecloud';
const executablePath = join(distFolder, executableName);

if (!supportedPlatforms.has(process.platform)) {
	throw new Error(`Executable builds are not supported on ${process.platform}.`);
}

if (requestedPlatform && requestedPlatform !== process.platform) {
	throw new Error(
		`This build must run on ${requestedPlatform}, but the current platform is ${process.platform}. ` +
			'Node.js SEA executables must be built natively on the target operating system.'
	);
}

buildExecutable().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});

async function buildExecutable() {
	writeFileSync(
		seaConfigPath,
		JSON.stringify(
			{
				main: bundlePath,
				output: seaBlobPath,
				disableExperimentalSEAWarning: true,
				useSnapshot: false,
				useCodeCache: false,
			},
			null,
			2
		)
	);

	try {
		runNode(['--experimental-sea-config', seaConfigPath]);
		copyFileSync(process.execPath, executablePath);
		if (process.platform === 'darwin') {
			runCommand('codesign', ['--remove-signature', executablePath]);
		}
		await inject(executablePath, 'NODE_SEA_BLOB', readFileSync(seaBlobPath), {
			sentinelFuse: 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2',
			...(process.platform === 'darwin' && { machoSegmentName: 'NODE_SEA' }),
		});
		if (process.platform !== 'win32') {
			chmodSync(executablePath, 0o755);
		}
		if (process.platform === 'darwin') {
			runCommand('codesign', ['--sign', '-', executablePath]);
		}
	} finally {
		rmSync(seaConfigPath, { force: true });
		rmSync(seaBlobPath, { force: true });
	}

	console.log(`Created ${executablePath} with Node.js ${process.version}.`);
}

function runNode(args) {
	runCommand(process.execPath, args, 'Node SEA blob generation');
}

function runCommand(command, args, description = command) {
	const result = spawnSync(command, args, {
		cwd: packageRoot,
		stdio: 'inherit',
	});

	if (result.error) {
		throw result.error;
	}
	if (result.status !== 0) {
		throw new Error(`${description} failed with exit code ${result.status ?? 1}.`);
	}
}