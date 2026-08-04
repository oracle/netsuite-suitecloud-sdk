/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { copyFileSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const { join, resolve } = require('node:path');
const { spawnSync } = require('node:child_process');
const { inject } = require('postject');

const packageRoot = resolve(__dirname, '..');
const distFolder = join(packageRoot, 'dist');
const bundlePath = join(distFolder, 'suitecloud.js');
const seaConfigPath = join(distFolder, 'sea-config.json');
const seaBlobPath = join(distFolder, 'suitecloud.blob');
const executablePath = join(distFolder, 'suitecloud.exe');

if (process.platform !== 'win32') {
	throw new Error('This builder currently produces a Windows executable and must run on Windows.');
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
		await inject(executablePath, 'NODE_SEA_BLOB', readFileSync(seaBlobPath), {
			sentinelFuse: 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2',
		});
	} finally {
		rmSync(seaConfigPath, { force: true });
		rmSync(seaBlobPath, { force: true });
	}

	console.log(`Created ${executablePath} with Node.js ${process.version}.`);
}

function runNode(args) {
	const result = spawnSync(process.execPath, args, {
		cwd: packageRoot,
		stdio: 'inherit',
	});

	if (result.error) {
		throw result.error;
	}
	if (result.status !== 0) {
		throw new Error(`Node SEA blob generation failed with exit code ${result.status ?? 1}.`);
	}
}