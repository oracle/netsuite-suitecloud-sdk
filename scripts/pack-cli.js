/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { cpSync, copyFileSync, mkdirSync, mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const { spawnSync } = require('node:child_process');

const repositoryRoot = resolve(__dirname, '..');
const cliPackage = require(join(repositoryRoot, 'packages', 'node-cli', 'package.json'));
const sdkCorePackage = require(join(repositoryRoot, 'packages', 'sdk-core', 'package.json'));
const sdkCorePackageName = sdkCorePackage.name;
const destinationFolder = resolve(repositoryRoot, process.argv[2] || 'dist');
const stagingRoot = mkdtempSync(join(tmpdir(), 'suitecloud-cli-package-'));
const stagedCliFolder = join(stagingRoot, 'package');
const sdkCoreSourceFolder = join(repositoryRoot, 'packages', 'sdk-core');
const stagedSdkCoreFolder = join(
	stagedCliFolder,
	'node_modules',
	...sdkCorePackageName.split('/')
);

verifyPackageConfiguration();
mkdirSync(destinationFolder, { recursive: true });

try {
	runNpm(['run', 'build:sdk-core']);
	stageCliPackage();
	installSdkCoreRuntimeDependencies();
	runNpm(['pack', '--ignore-scripts', '--pack-destination', destinationFolder], stagedCliFolder);
} finally {
	rmSync(stagingRoot, { recursive: true, force: true });
}

function verifyPackageConfiguration() {
	if (cliPackage.dependencies?.[sdkCorePackageName] !== sdkCorePackage.version) {
		throw new Error(
			`${cliPackage.name} must depend on ${sdkCorePackageName}@${sdkCorePackage.version}.`
		);
	}

	if (!cliPackage.bundleDependencies?.includes(sdkCorePackageName)) {
		throw new Error(`${sdkCorePackageName} must be listed in bundleDependencies.`);
	}
}

function stageCliPackage() {
	const cliSourceFolder = join(repositoryRoot, 'packages', 'node-cli');
	cpSync(cliSourceFolder, stagedCliFolder, {
		recursive: true,
		filter: (sourcePath) => sourcePath !== join(cliSourceFolder, 'node_modules'),
	});

	mkdirSync(stagedSdkCoreFolder, { recursive: true });
	copyFileSync(
		join(sdkCoreSourceFolder, 'package.json'),
		join(stagedSdkCoreFolder, 'package.json')
	);
	cpSync(join(sdkCoreSourceFolder, 'build'), join(stagedSdkCoreFolder, 'build'), {
		recursive: true,
	});
}

function installSdkCoreRuntimeDependencies() {
	runNpm(
		['install', '--omit=dev', '--ignore-scripts', '--package-lock=false'],
		stagedSdkCoreFolder
	);
}

function runNpm(args, workingDirectory = repositoryRoot) {
	const npmCliPath = process.env.npm_execpath;
	if (!npmCliPath) {
		throw new Error('The npm executable could not be resolved. Run this script through npm run pack:cli.');
	}
	const result = spawnSync(process.execPath, [npmCliPath, ...args], {
		cwd: workingDirectory,
		stdio: 'inherit',
	});

	if (result.error) {
		throw result.error;
	}
	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}
